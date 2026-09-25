import { afterAll, describe, expect, it, vi } from 'vitest'
import { serviceClient } from './support/clients'
import { localSupabase } from './support/local-supabase'

// SEC-005 · Server Actions de artigo chamadas sem cookie de sessão: erro de autorização e
// nenhum dado alterado.

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', localSupabase.API_URL)
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', localSupabase.ANON_KEY)
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
vi.stubEnv('ADMIN_SITE_URL', 'http://localhost:3001')

const { saveArticle } = await import('../../apps/admin/app/artigos/actions')
const { UNAUTHORIZED_MESSAGE } = await import('../../apps/admin/lib/services/require-admin')

const ARTICLE_ID = '22222222-2222-4222-8222-222222222222'

describe('SEC-005 · actions de artigo sem sessão', () => {
  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('saveArticle nega e não altera o artigo', async () => {
    const formData = new FormData()
    formData.set('id', ARTICLE_ID)
    formData.set('title', 'Título trocado sem sessão')
    formData.set('slug', 'carteira-recomendada-outubro')
    formData.set('summary', '')
    formData.set('contentType', 'pdf')
    formData.set('publishedDate', '2026-09-20')

    const result = await saveArticle(null, formData)

    expect(result).toEqual({ ok: false, error: UNAUTHORIZED_MESSAGE, fieldErrors: {} })
    const { data } = await serviceClient()
      .from('articles')
      .select('title')
      .eq('id', ARTICLE_ID)
      .single()
    expect(data?.title).toBe('Carteira recomendada de outubro')
  })
})
