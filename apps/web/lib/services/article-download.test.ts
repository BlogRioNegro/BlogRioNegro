import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LeadInput } from '../domain/lead'
import { handleDownloadRequest, LEAD_ERROR_MESSAGE } from './article-download'
import { findArticleForLead } from './articles'
import { createDownloadUrl, insertLead } from './leads'
import { consumeLeadRateLimits, RATE_LIMIT_MESSAGE } from './rate-limit'
import { verifyTurnstile } from './turnstile'

vi.mock('./turnstile', () => ({ verifyTurnstile: vi.fn() }))
vi.mock('./rate-limit', () => ({
  consumeLeadRateLimits: vi.fn(),
  RATE_LIMIT_MESSAGE: 'Muitas tentativas, tente em alguns minutos',
}))
vi.mock('./articles', () => ({ findArticleForLead: vi.fn() }))
vi.mock('./leads', () => ({ insertLead: vi.fn(), createDownloadUrl: vi.fn() }))

const ARTICLE = { id: '11111111-1111-4111-8111-111111111111', title: 'Renda fixa em 2026' }
const SIGNED_URL = 'https://storage.example/article-files/assinada?token=x'
const IP = '203.0.113.7'

const input: LeadInput = {
  articleId: ARTICLE.id,
  name: 'Maria Silva',
  email: 'Maria@Exemplo.com.br',
  phone: '(11) 98765-4321',
  consent: true,
  marketingOptIn: true,
  turnstileToken: 'token',
}

const calls: string[] = []
const schedule = vi.fn()
let logs: string[] = []

function track<T>(step: string, value: T) {
  return async () => {
    calls.push(step)
    return value
  }
}

function allStepsSucceed() {
  vi.mocked(verifyTurnstile).mockImplementation(track('turnstile', true))
  vi.mocked(consumeLeadRateLimits).mockImplementation(track('rate_limit', true))
  vi.mocked(findArticleForLead).mockImplementation(track('article', ARTICLE))
  vi.mocked(insertLead).mockImplementation(
    track('insert', { id: 'lead-1', created_at: '2026-09-25T12:00:00Z' }),
  )
  vi.mocked(createDownloadUrl).mockImplementation(track('signed_url', SIGNED_URL))
}

const request = () => handleDownloadRequest(input, { ip: IP, schedule })

describe('handleDownloadRequest', () => {
  beforeEach(() => {
    calls.length = 0
    logs = []
    const capture = (chunk: unknown) => {
      logs.push(String(chunk))
      return true
    }
    vi.spyOn(process.stdout, 'write').mockImplementation(capture)
    vi.spyOn(process.stderr, 'write').mockImplementation(capture)
    allStepsSucceed()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('executa as etapas na ordem obrigatória e devolve a URL assinada', async () => {
    expect(await request()).toEqual({ ok: true, data: { url: SIGNED_URL } })
    expect(calls).toEqual(['turnstile', 'rate_limit', 'article', 'insert', 'signed_url'])
  })

  it('usa os dados normalizados pelo schema e o IP do contexto', async () => {
    await request()

    expect(consumeLeadRateLimits).toHaveBeenCalledWith({ ip: IP, email: 'maria@exemplo.com.br' })
    expect(insertLead).toHaveBeenCalledWith(
      expect.objectContaining({
        article: ARTICLE,
        ip: IP,
        lead: expect.objectContaining({ phone: '+5511987654321', marketingOptIn: true }),
      }),
    )
    expect(createDownloadUrl).toHaveBeenCalledWith(ARTICLE.id)
  })

  it('(1) dado inválido para antes do Turnstile, com erro genérico', async () => {
    const result = await handleDownloadRequest({ ...input, consent: false }, { ip: IP, schedule })

    expect(result).toEqual({ ok: false, error: LEAD_ERROR_MESSAGE })
    expect(calls).toEqual([])
  })

  it('(2) Turnstile recusado: nenhum rate limit, insert ou URL', async () => {
    vi.mocked(verifyTurnstile).mockImplementation(track('turnstile', false))

    expect(await request()).toEqual({ ok: false, error: LEAD_ERROR_MESSAGE })
    expect(calls).toEqual(['turnstile'])
  })

  it('(3) acima do limite: mensagem de rate limit, sem insert nem URL', async () => {
    vi.mocked(consumeLeadRateLimits).mockImplementation(track('rate_limit', false))

    expect(await request()).toEqual({ ok: false, error: RATE_LIMIT_MESSAGE })
    expect(calls).toEqual(['turnstile', 'rate_limit'])
  })

  it('(4) artigo inexistente: erro genérico, sem insert nem URL', async () => {
    vi.mocked(findArticleForLead).mockImplementation(track('article', null))

    expect(await request()).toEqual({ ok: false, error: LEAD_ERROR_MESSAGE })
    expect(calls).toEqual(['turnstile', 'rate_limit', 'article'])
  })

  it('(5) falha no insert: erro genérico e nenhuma URL', async () => {
    vi.mocked(insertLead).mockRejectedValue(new Error('insert do lead: 23514 check'))

    expect(await request()).toEqual({ ok: false, error: LEAD_ERROR_MESSAGE })
    expect(createDownloadUrl).not.toHaveBeenCalled()
  })

  it('(6) falha na URL depois do insert: erro genérico', async () => {
    vi.mocked(createDownloadUrl).mockRejectedValue(new Error('URL assinada: falhou'))

    expect(await request()).toEqual({ ok: false, error: LEAD_ERROR_MESSAGE })
    expect(calls).toEqual(['turnstile', 'rate_limit', 'article', 'insert'])
  })

  it('falha de infraestrutura em qualquer etapa vira erro genérico', async () => {
    vi.mocked(consumeLeadRateLimits).mockRejectedValue(new Error('consume_rate_limit falhou'))

    expect(await request()).toEqual({ ok: false, error: LEAD_ERROR_MESSAGE })
    expect(insertLead).not.toHaveBeenCalled()
  })

  it('não escreve nome, e-mail, telefone nem IP nos logs', async () => {
    await handleDownloadRequest({ ...input, phone: '555-1234' }, { ip: IP, schedule })
    vi.mocked(verifyTurnstile).mockImplementation(track('turnstile', false))
    await request()
    vi.mocked(verifyTurnstile).mockImplementation(track('turnstile', true))
    vi.mocked(consumeLeadRateLimits).mockImplementation(track('rate_limit', false))
    await request()

    const written = logs.join('\n')
    expect(logs.length).toBeGreaterThanOrEqual(3)
    for (const personal of ['Maria', 'maria@exemplo.com.br', '98765', IP, '555-1234']) {
      expect(written).not.toContain(personal)
    }
  })
})
