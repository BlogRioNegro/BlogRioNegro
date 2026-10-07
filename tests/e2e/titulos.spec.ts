import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { executeLocalSql } from '../integration/support/local-supabase'
import { signInAsAdmin } from './support/admin'
import { webUrl } from './support/urls'

// TB-001 · ADR 0045 · Todo título em Roboto Slab Black, na caixa digitada e sem espaçamento entre
// letras; H1 de 36 px (desktop) e 28 px (celular) e nenhum outro título desse tamanho.

const SIZES = {
  desktop: { viewport: { width: 1440, height: 900 }, h1: 36 },
  mobile: { viewport: { width: 390, height: 844 }, h1: 28 },
} as const

const LONG_WORD = 'desproporcionalmente'
const LONG_TITLE = `Juros ${LONG_WORD} altos: o que mudou na renda fixa?`
const LONG_ARTICLE = {
  id: '77777777-7777-4777-8777-777777777777',
  slug: 'titulo-longo-tb-001',
}

// O login é do admin (baseURL); as demais são do site.
const PAGES = [
  { name: 'home', url: webUrl('/') },
  { name: 'listagem', url: webUrl('/artigos') },
  { name: 'artigo', url: webUrl('/artigos/renda-fixa-em-2026') },
  { name: 'privacidade', url: webUrl('/privacidade') },
  { name: '404', url: webUrl('/artigos/nao-existe-titulos') },
  { name: 'login do admin', url: '/login' },
  { name: 'título longo', url: webUrl(`/artigos/${LONG_ARTICLE.slug}`) },
]

type TitleStyle = {
  tag: string
  size: number
  weight: string
  transform: string
  spacing: string
  serif: boolean
}

function titleStyles(page: Page): Promise<TitleStyle[]> {
  return page.locator('h1, h2, h3').evaluateAll((titles) =>
    titles.map((title) => {
      const style = getComputedStyle(title)
      return {
        tag: title.tagName.toLowerCase(),
        size: Number.parseFloat(style.fontSize),
        weight: style.fontWeight,
        transform: style.textTransform,
        spacing: style.letterSpacing,
        serif: style.fontFamily.includes('Roboto Slab'),
      }
    }),
  )
}

// Artigo e conteúdo na mesma transação (DATA-002); mais recente que o seed, vira o destaque.
test.beforeAll(() => {
  executeLocalSql(`with a as (
    insert into public.articles (id, slug, title, cover_path, content_type, preview_pdf_path)
    values ('${LONG_ARTICLE.id}', '${LONG_ARTICLE.slug}', '${LONG_TITLE}', 'x/capa.jpg', 'pdf', 'x/previa.pdf')
    returning id
  ) insert into public.article_contents (article_id, full_pdf_path) select id, 'x/completo.pdf' from a`)
})

test.afterAll(() => {
  executeLocalSql(`delete from public.articles where id = '${LONG_ARTICLE.id}'`)
})

test('o título longo tem 60 caracteres e uma palavra de 20 letras', () => {
  expect(LONG_TITLE).toHaveLength(60)
  expect(LONG_WORD).toHaveLength(20)
})

for (const [device, { viewport, h1 }] of Object.entries(SIZES)) {
  test.describe(`TB-001 · Títulos · ${device}`, () => {
    test.use({ viewport })

    for (const { name, url } of PAGES) {
      test(`${name}: títulos em Black, sem maiúsculas forçadas e menores que o H1`, async ({
        page,
      }) => {
        await page.goto(url)
        await page.evaluate(() => document.fonts.ready)

        const titles = await titleStyles(page)
        const pageTitles = titles.filter((title) => title.tag === 'h1')
        expect(pageTitles).toHaveLength(1)
        expect(pageTitles[0]?.size).toBe(h1)

        for (const title of titles) {
          expect(title).toMatchObject({
            weight: '900',
            transform: 'none',
            spacing: 'normal',
            serif: true,
          })
          if (title.tag !== 'h1') expect(title.size).toBeLessThan(h1)
        }
      })
    }

    test('o peso 900 da Roboto Slab está carregado', async ({ page }) => {
      await page.goto(webUrl('/'))
      await page.evaluate(() => document.fonts.ready)

      const ranges = await page.evaluate(() =>
        [...document.fonts]
          .filter((font) => font.family.includes('Roboto Slab') && font.status === 'loaded')
          .map((font) => font.weight),
      )
      const covers900 = ranges.some((range) => {
        const [min = 0, max = min] = range.split(' ').map(Number)
        return min <= 900 && max >= 900
      })
      expect(covers900).toBe(true)
    })

    test('título longo não estoura a página, no artigo nem no card', async ({ page }) => {
      for (const url of [webUrl(`/artigos/${LONG_ARTICLE.slug}`), webUrl('/artigos')]) {
        await page.goto(url)
        await page.evaluate(() => document.fonts.ready)

        const title = page.getByRole('heading', { name: LONG_TITLE })
        await expect(title).toBeVisible()
        const overflow = await title.evaluate((element) => ({
          title: element.scrollWidth - element.clientWidth,
          page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        }))
        expect(overflow).toEqual({ title: 0, page: 0 })
      }
    })

    test('o título do diálogo de lead é Black e menor que o H1', async ({ page }) => {
      await page.goto(webUrl('/artigos/renda-fixa-em-2026'))
      await page.getByRole('button', { name: 'Baixar artigo completo' }).click()

      const title = page
        .getByRole('dialog', { name: 'Baixe o artigo completo' })
        .getByRole('heading', { name: 'Baixe o artigo completo' })
      await expect(title).toHaveCSS('font-weight', '900')
      await expect(title).toHaveCSS('text-transform', 'none')
      await expect(title).toHaveCSS('letter-spacing', 'normal')
      const size = await title.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      )
      expect(size).toBeLessThan(h1)
    })
  })
}

// Capturas da ADR 0045: só com VISUAL=1. Ficam em __visual__ (fora do git).
test.describe('Visual · Títulos', () => {
  test.skip(!process.env.VISUAL, 'Gerado só com VISUAL=1')

  const OUT = path.join(import.meta.dirname, '__visual__')
  // browser.newPage() não herda o baseURL do config.
  const ADMIN_URL = 'http://localhost:3101'
  const SEED_ARTICLE_WITH_SUBTITLE = '22222222-2222-4222-8222-222222222222'
  const SHOTS = [
    { file: 'home', url: webUrl('/') },
    { file: 'privacidade', url: webUrl('/privacidade') },
    { file: '404', url: webUrl('/artigos/nao-existe-titulos') },
    { file: 'login-admin', url: '/login' },
    { file: 'titulo-longo', url: webUrl(`/artigos/${LONG_ARTICLE.slug}`) },
    { file: 'listagem', url: webUrl('/artigos') },
    { file: 'artigo-com-subtitulo', url: webUrl('/artigos/carteira-recomendada-outubro') },
  ]

  for (const { viewport } of Object.values(SIZES)) {
    for (const { file, url } of SHOTS) {
      test(`${file} a ${viewport.width} px`, async ({ browser }) => {
        const page = await browser.newPage({ viewport })
        await page.goto(url, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        await page.screenshot({
          path: path.join(OUT, `titulos-black-${file}-${viewport.width}.png`),
          fullPage: true,
        })
        await page.close()
      })
    }

    test(`formulário do admin a ${viewport.width} px`, async ({ browser }) => {
      const page = await browser.newPage({ viewport, baseURL: ADMIN_URL })
      await signInAsAdmin(page)
      await page.goto(`/artigos/${SEED_ARTICLE_WITH_SUBTITLE}`, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({
        path: path.join(OUT, `titulos-black-admin-formulario-${viewport.width}.png`),
        fullPage: true,
      })
      await page.close()
    })
  }
})
