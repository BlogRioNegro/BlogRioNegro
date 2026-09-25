import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { serviceClient } from './support/clients'
import { executeLocalSql, localSupabase } from './support/local-supabase'

// PUB-009 · Serviço de leitura pública do apps/web contra o seed local (3 artigos).

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', localSupabase.API_URL)
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', localSupabase.ANON_KEY)
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', localSupabase.SERVICE_ROLE_KEY)
vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'turnstile-site-key')
vi.stubEnv('TURNSTILE_SECRET_KEY', 'turnstile-secret-key')
vi.stubEnv('LEAD_HASH_SECRET', 'x'.repeat(32))
vi.stubEnv('NEXT_PUBLIC_RIO_NEGRO_URL', 'https://rionegro.example')

const { coverUrl, getArticleBySlug, listArticles } =
  await import('../../apps/web/lib/services/articles')

const LIST_COLUMNS = [
  'content_type',
  'cover_path',
  'created_at',
  'id',
  'published_at',
  'slug',
  'summary',
  'title',
]

afterAll(() => {
  vi.unstubAllEnvs()
})

// Mais antigo que o seed, com published_at e created_at iguais para forçar o desempate.
function insertOldArticle(id: string) {
  executeLocalSql(`with a as (
    insert into public.articles
      (id, slug, title, cover_path, content_type, preview_pdf_path, published_at, created_at)
    values ('${id}', 'empate-${id}', 'Artigo empatado', '${id}/capa.jpg', 'pdf', '${id}/previa.pdf',
      '2020-01-01T00:00:00Z', '2020-01-01T00:00:00Z')
    returning id
  ) insert into public.article_contents (article_id, full_pdf_path) select id, id || '/completo.pdf' from a`)
}

describe('listArticles', () => {
  it('devolve só as colunas públicas da listagem, do mais recente ao mais antigo', async () => {
    const articles = await listArticles({ from: 0, to: 9 })

    expect(articles.map((article) => article.slug)).toEqual([
      'guia-de-previdencia-privada',
      'carteira-recomendada-outubro',
      'renda-fixa-em-2026',
    ])
    for (const article of articles) expect(Object.keys(article).sort()).toEqual(LIST_COLUMNS)
  })

  it('respeita o intervalo pedido', async () => {
    const articles = await listArticles({ from: 1, to: 1 })

    expect(articles.map((article) => article.slug)).toEqual(['carteira-recomendada-outubro'])
  })

  describe('com datas de publicação iguais', () => {
    const ids = ['44444444-4444-4444-8444-444444444441', '44444444-4444-4444-8444-444444444442']

    beforeAll(() => {
      for (const id of ids) insertOldArticle(id)
    })

    afterAll(async () => {
      await serviceClient().from('articles').delete().in('id', ids)
    })

    it('mantém a ordem estável entre chamadas', async () => {
      const first = await listArticles({ from: 3, to: 4 })
      const second = await listArticles({ from: 3, to: 4 })

      expect(first.map((article) => article.id)).toEqual([...ids].reverse())
      expect(second).toEqual(first)
    })
  })
})

describe('getArticleBySlug', () => {
  it('inclui a prévia, mas não o conteúdo completo', async () => {
    const article = await getArticleBySlug('renda-fixa-em-2026')

    expect(article).toMatchObject({ content_type: 'rich_text', preview_pdf_path: null })
    expect(JSON.stringify(article?.preview_json)).toContain('nova trajetória da Selic')
    expect(JSON.stringify(article)).not.toContain('Texto completo de exemplo')
  })

  it('devolve null para slug inexistente', async () => {
    expect(await getArticleBySlug('nao-existe')).toBeNull()
  })
})

describe('coverUrl', () => {
  it('aponta para o bucket público de capas', () => {
    expect(coverUrl('a/b.jpg')).toBe(
      `${localSupabase.API_URL}/storage/v1/object/public/covers/a/b.jpg`,
    )
  })
})
