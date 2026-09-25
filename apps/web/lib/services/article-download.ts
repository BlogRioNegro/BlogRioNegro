import 'server-only'
import { leadSchema } from '../domain/lead'
import { failAction, type ActionResult } from './action-result'
import { findArticleForLead } from './articles'
import { createDownloadUrl, insertLead } from './leads'
import { logger } from './logger'
import { consumeLeadRateLimits, RATE_LIMIT_MESSAGE } from './rate-limit'
import { verifyTurnstile } from './turnstile'

// LEAD-007 · Pedido de download do artigo completo, na ordem obrigatória:
// (1) Zod → (2) Turnstile → (3) rate limit IP e e-mail → (4) artigo existe → (5) insert do lead
// → (6) URL assinada → (7) agendar webhook. Nenhuma URL é gerada se algo falhar até (5).
// Nada de dado pessoal nos logs: só eventos, campos inválidos e erros sem a linha do banco.

/** Mensagem genérica do fluxo de lead (spec 04, UI · Estados). */
export const LEAD_ERROR_MESSAGE = 'Não foi possível concluir. Tente novamente.'

export type DownloadContext = {
  /** IP do cliente (`clientIp`); só entra em hash. */
  ip: string
  /** Roda a tarefa depois da resposta (o `after` do Next). */
  schedule: (task: () => Promise<void>) => void
}

export type DownloadResult = ActionResult<{ url: string }>

function fail(event: string, error: unknown): DownloadResult {
  return failAction(event, error, LEAD_ERROR_MESSAGE)
}

export async function handleDownloadRequest(
  input: unknown,
  context: DownloadContext,
): Promise<DownloadResult> {
  const parsed = leadSchema.safeParse(input)
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join('.'))
    return fail('lead.invalid_input', { fields })
  }
  const lead = parsed.data

  try {
    if (!(await verifyTurnstile(lead.turnstileToken))) {
      return fail('lead.turnstile_rejected', null)
    }

    if (!(await consumeLeadRateLimits({ ip: context.ip, email: lead.email }))) {
      logger.warn('lead.rate_limited')
      return { ok: false, error: RATE_LIMIT_MESSAGE }
    }

    const article = await findArticleForLead(lead.articleId)
    if (!article) return fail('lead.article_not_found', { articleId: lead.articleId })

    // F5-007 liga o webhook: `pending` + envio agendado quando LEAD_WEBHOOK_URL existir.
    const created = await insertLead({ lead, article, ip: context.ip, webhookStatus: 'disabled' })

    try {
      return { ok: true, data: { url: await createDownloadUrl(article.id) } }
    } catch (error) {
      return fail('lead.signed_url_failed', { leadId: created.id, error })
    }
  } catch (error) {
    return fail('lead.request_failed', error)
  }
}
