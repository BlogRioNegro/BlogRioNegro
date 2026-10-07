import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ArticleCardData } from '@/lib/services/articles'
import { ArticleCard } from './article-card'
import { FeaturedArticleCard } from './featured-article-card'

// ADR 0046 · O subtítulo é um <p> logo abaixo do título do card; sem subtítulo, nada muda.

const ARTICLE: ArticleCardData = {
  slug: 'o-que-moveu-o-mercado',
  title: 'O que moveu o mercado',
  subtitle: null,
  coverUrl: 'https://cdn.test/covers/capa.png',
  publishedAt: '2026-09-25T12:00:00.000Z',
  dateLabel: '25 set. 2026',
}

const SUBTITLE = '21 a 25 de setembro'
const TITLE_THEN_SUBTITLE = new RegExp(
  `<h2 [^>]*>${ARTICLE.title}</h2><p class="[^"]*font-serif[^"]*font-regular[^"]*">${SUBTITLE}</p>`,
)

describe.each([
  { name: 'ArticleCard', Card: ArticleCard },
  { name: 'FeaturedArticleCard', Card: FeaturedArticleCard },
])('$name', ({ Card }) => {
  it('mostra o subtítulo num <p> logo abaixo do título', () => {
    const html = renderToStaticMarkup(<Card article={{ ...ARTICLE, subtitle: SUBTITLE }} />)

    expect(html).toMatch(TITLE_THEN_SUBTITLE)
    expect(html.match(/<h\d/g)).toHaveLength(1)
  })

  it('sem subtítulo, o título fecha o card', () => {
    const html = renderToStaticMarkup(<Card article={ARTICLE} />)

    expect(html).toContain(`${ARTICLE.title}</h2></div>`)
    expect(html).not.toContain('<p')
  })
})
