import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { serviceClient } from './support/clients'
import { executeLocalSql, queryLocalDb } from './support/local-supabase'
import { stubWebEnv } from './support/web-env'

// LEAD-007 a LEAD-009 · requestArticleDownload contra o Supabase local. Só o siteverify do
// Turnstile é simulado; banco, rate limit e Storage são reais.

const LEAD_HASH_SECRET = 'segredo-de-teste-do-hash-com-32-caracteres'
stubWebEnv({ LEAD_HASH_SECRET })

const { handleDownloadRequest, LEAD_ERROR_MESSAGE } =
  await import('../../apps/web/lib/services/article-download')
const { hashIdentifier } = await import('../../apps/web/lib/domain/identifier-hash')
const { POLICY_VERSION } = await import('../../apps/web/lib/domain/lead')

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const ARTICLE_ID = 'bbbbbbbb-0000-4000-8000-000000000005'
const ARTICLE_TITLE = 'Artigo do teste de lead'
const FULL_PDF_PATH = `${ARTICLE_ID}/completo.pdf`

const realFetch = globalThis.fetch
const schedule = vi.fn()

function leadInput(overrides: Record<string, unknown> = {}) {
  return {
    articleId: ARTICLE_ID,
    name: 'Maria Silva',
    email: `Maria.${randomUUID()}@Exemplo.com.br`,
    phone: '(11) 98765-4321',
    consent: true,
    marketingOptIn: false,
    turnstileToken: 'token-de-teste',
    ...overrides,
  }
}

const uniqueIp = () => `198.51.100.${Math.floor(Math.random() * 250)}`

function leadsOf(email: string) {
  return queryLocalDb(`select * from public.leads where email = '${email.toLowerCase()}'
    order by created_at`)
}

beforeAll(async () => {
  executeLocalSql(`with a as (
    insert into public.articles (id, slug, title, cover_path, content_type, preview_pdf_path)
    values ('${ARTICLE_ID}', 'teste-lead-${ARTICLE_ID}', '${ARTICLE_TITLE}', 'x/capa.png', 'pdf', 'x/previa.pdf')
    returning id
  ) insert into public.article_contents (article_id, full_pdf_path) select id, '${FULL_PDF_PATH}' from a`)

  const { error } = await serviceClient()
    .storage.from('article-files')
    .upload(FULL_PDF_PATH, new Blob(['%PDF-1.4 completo'], { type: 'application/pdf' }))
  if (error) throw error
})

afterAll(async () => {
  executeLocalSql(`delete from public.leads where article_id = '${ARTICLE_ID}'`)
  executeLocalSql(`delete from public.articles where id = '${ARTICLE_ID}'`)
  await serviceClient().storage.from('article-files').remove([FULL_PDF_PATH])
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

beforeEach(() => {
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
    String(input) === SITEVERIFY
      ? Promise.resolve(Response.json({ success: true, 'error-codes': [] }))
      : realFetch(input, init),
  )
  vi.spyOn(process.stdout, 'write').mockReturnValue(true)
  vi.spyOn(process.stderr, 'write').mockReturnValue(true)
})

describe('LEAD-008 · persistência', () => {
  it('grava snapshot, consentimento, versão, opt-in e ip_hash, com dados normalizados', async () => {
    const input = leadInput({ marketingOptIn: true })
    const ip = uniqueIp()
    const before = Date.now()

    const result = await handleDownloadRequest(input, { ip, schedule })

    expect(result.ok).toBe(true)
    const [lead] = leadsOf(input.email)
    expect(lead).toMatchObject({
      article_id: ARTICLE_ID,
      article_title_snapshot: ARTICLE_TITLE,
      name: 'Maria Silva',
      email: input.email.toLowerCase(),
      phone: '+5511987654321',
      policy_version: POLICY_VERSION,
      marketing_opt_in: true,
      ip_hash: await hashIdentifier(ip, LEAD_HASH_SECRET),
    })
    expect(new Date(String(lead?.consent_at)).getTime()).toBeGreaterThanOrEqual(before - 1000)
    expect(JSON.stringify(lead)).not.toContain(ip)
  })

  it('o snapshot do título não muda quando o artigo é renomeado', async () => {
    const input = leadInput()
    await handleDownloadRequest(input, { ip: uniqueIp(), schedule })

    executeLocalSql(`update public.articles set title = 'Título novo' where id = '${ARTICLE_ID}'`)
    executeLocalSql(
      `update public.articles set title = '${ARTICLE_TITLE}' where id = '${ARTICLE_ID}'`,
    )

    expect(leadsOf(input.email)[0]?.article_title_snapshot).toBe(ARTICLE_TITLE)
  })

  it('dois downloads da mesma pessoa geram dois registros', async () => {
    const input = leadInput()

    expect((await handleDownloadRequest(input, { ip: uniqueIp(), schedule })).ok).toBe(true)
    expect((await handleDownloadRequest(input, { ip: uniqueIp(), schedule })).ok).toBe(true)

    expect(leadsOf(input.email)).toHaveLength(2)
  })

  it('Turnstile recusado não grava nada', async () => {
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
      String(input) === SITEVERIFY
        ? Promise.resolve(
            Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] }),
          )
        : realFetch(input, init),
    )
    const input = leadInput()

    expect(await handleDownloadRequest(input, { ip: uniqueIp(), schedule })).toEqual({
      ok: false,
      error: LEAD_ERROR_MESSAGE,
    })
    expect(leadsOf(input.email)).toHaveLength(0)
  })
})
