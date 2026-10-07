import path from 'node:path'
import { expect, test } from '@playwright/test'
import { serviceClient } from '../integration/support/clients'
import { signInAsAdmin } from './support/admin'
import { webUrl } from './support/urls'

// TB-002 · ADR 0046 · O admin preenche Título e Subtítulo e o site mostra o título em duas linhas:
// o subtítulo num <p> menor, logo abaixo. O slug vem só do título.

const STORAGE = path.join(import.meta.dirname, '../../supabase/storage')
const PNG = path.join(
  STORAGE,
  'covers/11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.png',
)
const PDF = path.join(
  STORAGE,
  'article-previews/22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000002.pdf',
)
const BUCKETS = ['covers', 'article-files', 'article-previews'] as const

const stamp = Date.now()
const TITLE = `O que moveu o mercado ${stamp}`
const SUBTITLE = '21 a 25 de setembro'
const SLUG = `o-que-moveu-o-mercado-${stamp}`
const FULL_TITLE = `${TITLE}: ${SUBTITLE}`

let articleId = ''

test.afterAll(async () => {
  if (!articleId) return
  const service = serviceClient()
  await service.from('articles').delete().eq('id', articleId)
  for (const bucket of BUCKETS) {
    const { data } = await service.storage.from(bucket).list(articleId)
    const paths = (data ?? []).map((file) => `${articleId}/${file.name}`)
    if (paths.length > 0) await service.storage.from(bucket).remove(paths)
  }
})

test('admin cria artigo com subtítulo e o site mostra as duas linhas', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000)
  await signInAsAdmin(page)

  await page.goto('/artigos/novo')
  articleId = await page.locator('input[name="id"]').inputValue()
  await page.getByLabel('Título', { exact: true }).fill(TITLE)
  const subtitle = page.getByLabel('Subtítulo (opcional)')
  await expect(subtitle).toHaveAccessibleDescription(
    'Aparece numa segunda linha, menor, abaixo do título. Ex.: 21 a 25 de setembro',
  )
  await subtitle.fill(SUBTITLE)
  // O slug vem só do título.
  await expect(page.getByLabel('Slug')).toHaveValue(SLUG)
  await page.getByLabel('Capa').setInputFiles(PNG)
  await page.getByLabel('Arquivo PDF').setInputFiles(PDF)
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page).toHaveURL(/\/artigos$/)

  // Lista do admin: subtítulo abaixo do título, na mesma célula.
  const row = page.getByRole('row').filter({ hasText: TITLE })
  await expect(row.getByText(SUBTITLE, { exact: true })).toBeVisible()

  // Na edição, o campo volta preenchido.
  await row.getByRole('link', { name: 'Editar' }).click()
  await expect(page.getByLabel('Subtítulo (opcional)')).toHaveValue(SUBTITLE)

  // Página do artigo: <h1> com o título e, logo abaixo, <p> menor e em peso 400.
  await page.goto(webUrl(`/artigos/${SLUG}`))
  const main = page.getByRole('main')
  const heading = main.getByRole('heading', { level: 1 })
  await expect(heading).toHaveText(TITLE)
  const secondLine = main.locator('h1 + p')
  await expect(secondLine).toHaveText(SUBTITLE)
  await expect(secondLine).toHaveCSS('font-weight', '400')
  await expect(secondLine).toHaveCSS('font-family', /Roboto Slab/)
  const [titleBox, subtitleBox] = await Promise.all([
    heading.boundingBox(),
    secondLine.boundingBox(),
  ])
  expect(subtitleBox?.y).toBeGreaterThanOrEqual((titleBox?.y ?? 0) + (titleBox?.height ?? 0))
  const fontSize = (selector: string) =>
    main
      .locator(selector)
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))
  expect(await fontSize('h1 + p')).toBeLessThan(await fontSize('h1'))
  await expect(main.getByRole('heading', { name: SUBTITLE })).toHaveCount(0)

  // Metadata: "Título: Subtítulo".
  await expect(page).toHaveTitle(`${FULL_TITLE} · Rio Negro Investimentos`)
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', FULL_TITLE)

  // Listagem: é o mais recente, então aparece no card de destaque, com o subtítulo abaixo.
  await page.goto(webUrl('/artigos'))
  const card = page.getByRole('link', { name: new RegExp(TITLE) })
  await expect(card.getByRole('heading', { level: 2 })).toHaveText(TITLE)
  await expect(card.locator('h2 + p')).toHaveText(SUBTITLE)
  await expect(card.locator('h2 + p')).toHaveCSS('font-weight', '400')

  // RSS: título do item com o subtítulo.
  const feed = await (await request.get(webUrl('/rss.xml'))).text()
  expect(feed).toContain(`<title>${FULL_TITLE}</title>`)

  // O título gravado no banco continua sem o subtítulo.
  const { data } = await serviceClient()
    .from('articles')
    .select('title, subtitle, slug')
    .eq('id', articleId)
    .single()
  expect(data).toEqual({ title: TITLE, subtitle: SUBTITLE, slug: SLUG })
})
