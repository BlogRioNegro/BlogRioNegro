import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getArticleBySlug, type ArticleDetail } from '@/lib/services/articles'
import ArticlePage, { generateMetadata } from './page'

// PUB-005 · PUB-010 · ADR 0046: subtítulo na segunda linha da página e depois de dois-pontos em
// <title>, Open Graph e Twitter.

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site-key',
    NEXT_PUBLIC_RIO_NEGRO_URL: 'https://rionegro.test',
  },
}))
vi.mock('@/lib/services/articles', () => ({
  getArticleBySlug: vi.fn(),
  coverUrl: (path: string) => `https://cdn.test/covers/${path}`,
  previewPdfUrl: (path: string) => `https://cdn.test/article-previews/${path}`,
}))
vi.mock('@/components/lead-dialog', () => ({ LeadDialog: () => null }))

const ARTICLE: ArticleDetail = {
  id: '4b4f7c5e-2d7a-4c1e-9d55-0a3f5c1e8b21',
  slug: 'o-que-moveu-o-mercado',
  title: 'O que moveu o mercado',
  subtitle: null,
  summary: 'Resumo da semana.',
  cover_path: 'capa.png',
  content_type: 'pdf',
  published_at: '2026-09-25T12:00:00.000Z',
  created_at: '2026-09-25T12:00:00.000Z',
  preview_json: null,
  preview_pdf_path: 'previa.pdf',
}
const SUBTITLE = '21 a 25 de setembro'

const props = {
  params: Promise.resolve({ slug: ARTICLE.slug }),
  searchParams: Promise.resolve({}),
}

function withArticle(subtitle: string | null) {
  vi.mocked(getArticleBySlug).mockResolvedValue({ ...ARTICLE, subtitle })
}

afterEach(() => {
  vi.resetAllMocks()
})

describe('generateMetadata', () => {
  it('com subtítulo: "Título: Subtítulo" em title, Open Graph e Twitter', async () => {
    withArticle(SUBTITLE)
    const full = `${ARTICLE.title}: ${SUBTITLE}`

    const metadata = await generateMetadata(props)

    expect(metadata.title).toBe(full)
    expect(metadata.openGraph?.title).toBe(full)
    expect(metadata.twitter?.title).toBe(full)
  })

  it('sem subtítulo: só o título', async () => {
    withArticle(null)

    const metadata = await generateMetadata(props)

    expect(metadata.title).toBe(ARTICLE.title)
    expect(metadata.openGraph?.title).toBe(ARTICLE.title)
    expect(metadata.twitter?.title).toBe(ARTICLE.title)
  })
})

describe('ArticlePage', () => {
  it('com subtítulo: <p> em Roboto Slab Regular logo abaixo do <h1>', async () => {
    withArticle(SUBTITLE)

    const html = renderToStaticMarkup(await ArticlePage(props))

    expect(html).toMatch(
      new RegExp(
        `<h1 [^>]*>${ARTICLE.title}</h1><p class="[^"]*font-serif[^"]*font-regular[^"]*">${SUBTITLE}</p>`,
      ),
    )
    expect(html.match(/<h1/g)).toHaveLength(1)
  })

  it('sem subtítulo: o <h1> é seguido direto pela capa', async () => {
    withArticle(null)

    const html = renderToStaticMarkup(await ArticlePage(props))

    expect(html).toMatch(new RegExp(`<h1 class="[^"]*mb-6[^"]*">${ARTICLE.title}</h1><div`))
  })
})
