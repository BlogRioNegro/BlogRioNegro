import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, test } from '@playwright/test'
import { serviceClient } from '../integration/support/clients'
import { signInAsAdmin } from './support/admin'
import { webUrl } from './support/urls'

// ADM-004 · Formulário de artigo: erros por campo e publicação imediata no site.

const SEED = {
  id: '22222222-2222-4222-8222-222222222222',
  slug: 'carteira-recomendada-outubro',
  title: 'Carteira recomendada de outubro',
}

// PDF de 24,6 MB (base 1024) para o erro de tamanho da spec 05.
function bigPdf() {
  return {
    name: 'cenario-macro-4t26.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.alloc(Math.floor(24.6 * 1024 * 1024)),
  }
}

const SEED_PNG = path.join(
  import.meta.dirname,
  '../../supabase/storage/covers/11111111-1111-4111-8111-111111111111/a1b2c3d4-0000-4000-8000-000000000001.png',
)

const SEED_PDF = path.join(
  import.meta.dirname,
  '../../supabase/storage/article-previews/22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000002.pdf',
)

test.describe('formulário de artigo', () => {
  test.afterAll(async () => {
    await serviceClient().from('articles').update({ title: SEED.title }).eq('id', SEED.id)
  })

  test('mostra erros por campo sem enviar', async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')

    await page.getByRole('button', { name: 'Publicar' }).click()

    await expect(page.getByLabel('Título')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Informe um título de 3 a 160 caracteres.')).toBeVisible()
    await expect(page.getByText('Envie a capa do artigo.')).toBeVisible()
  })

  test('PDF acima do limite mostra o erro no campo sem enviar', async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')

    await page.getByLabel('Arquivo PDF').setInputFiles(bigPdf())
    await page.getByRole('button', { name: 'Publicar' }).click()

    await expect(page.getByText('O arquivo tem 24,6 MB. Envie um PDF de até 20 MB.')).toBeVisible()
    await expect(page).toHaveURL(/\/artigos\/novo$/)
  })

  test('editor Texto: barra da ADM-005 e imagem só com texto alternativo', async ({ page }) => {
    const cspViolations: string[] = []
    page.on('console', (message) => {
      if (message.text().includes('Content Security Policy')) cspViolations.push(message.text())
    })
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')
    const articleId = await page.locator('input[name="id"]').inputValue()
    // Só o editor: a carga em modo dev e o Dialog do Radix têm violações próprias (ver memory).
    cspViolations.length = 0

    await page.getByRole('group', { name: 'Tipo' }).getByRole('button', { name: 'Texto' }).click()
    const toolbar = page.getByRole('toolbar', { name: 'Formatação' })
    const labels = [
      'H2',
      'H3',
      'Negrito',
      'Itálico',
      'Lista',
      'Lista numerada',
      'Link',
      'Citação',
      'Imagem',
    ]
    await expect(toolbar.getByRole('button')).toHaveText(labels)

    const editor = page.getByRole('textbox', { name: 'Conteúdo' })
    await editor.click()
    await page.keyboard.type('Primeiro parágrafo')
    expect(cspViolations).toEqual([])
    await toolbar.getByRole('button', { name: 'Imagem' }).click()
    const dialog = page.getByRole('dialog', { name: 'Imagem' })
    await dialog.getByLabel('Arquivo').setInputFiles(SEED_PNG)
    await dialog.getByRole('button', { name: 'Inserir' }).click()
    await expect(dialog.getByText('Descreva a imagem para quem não pode vê-la.')).toBeVisible()

    await dialog.getByLabel('Texto alternativo').fill('Gráfico da Selic')
    await dialog.getByRole('button', { name: 'Inserir' }).click()
    await expect(dialog).toBeHidden()
    await expect(editor.locator('img[alt="Gráfico da Selic"]')).toHaveAttribute(
      'src',
      new RegExp(`/article-images/${articleId}/`),
    )

    const storage = serviceClient().storage.from('article-images')
    const { data } = await storage.list(articleId)
    await storage.remove((data ?? []).map((file) => `${articleId}/${file.name}`))
  })

  test('criar artigo PDF: original privado, prévia pública e artigo no site', async ({ page }) => {
    const service = serviceClient()
    const slug = `artigo-pdf-e2e-${Date.now()}`
    await signInAsAdmin(page)
    await page.goto('/artigos/novo')
    const articleId = await page.locator('input[name="id"]').inputValue()

    await page.getByLabel('Título').fill('Artigo PDF criado no E2E')
    await page.getByLabel('Slug').fill(slug)
    await page.getByLabel('Capa').setInputFiles(SEED_PNG)
    await page.getByLabel('Arquivo PDF').setInputFiles(SEED_PDF)
    await page.getByRole('button', { name: 'Publicar' }).click()

    try {
      await expect(page).toHaveURL(/\/artigos$/)
      await expect(page.getByRole('table').getByText('Artigo PDF criado no E2E')).toBeVisible()

      const { data: article } = await service
        .from('articles')
        .select('preview_pdf_path, article_contents(full_pdf_path)')
        .eq('id', articleId)
        .single()
      const fullPath = article?.article_contents?.full_pdf_path ?? ''
      const previewPath = article?.preview_pdf_path ?? ''
      const inArticleFolder = new RegExp(`^${articleId}/[0-9a-f-]+\\.pdf$`)
      expect(fullPath).toMatch(inArticleFolder)
      expect(previewPath).toMatch(inArticleFolder)
      expect((await service.storage.from('article-files').download(fullPath)).error).toBeNull()
      expect(
        (await service.storage.from('article-previews').download(previewPath)).error,
      ).toBeNull()
      const anonOriginal = await page.request.get(
        service.storage.from('article-files').getPublicUrl(fullPath).data.publicUrl,
      )
      expect(anonOriginal.ok()).toBe(false)

      await page.goto(webUrl(`/artigos/${slug}`))
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Artigo PDF criado no E2E')
    } finally {
      await service.from('articles').delete().eq('id', articleId)
      for (const bucket of ['covers', 'article-files', 'article-previews']) {
        const { data } = await service.storage.from(bucket).list(articleId)
        const paths = (data ?? []).map((file) => `${articleId}/${file.name}`)
        if (paths.length > 0) await service.storage.from(bucket).remove(paths)
      }
    }
  })

  test('salvar a edição publica o novo título no site no próximo request', async ({ page }) => {
    await signInAsAdmin(page)
    await page.goto(`/artigos/${SEED.id}`)
    await expect(page.getByRole('heading', { name: 'Editar artigo' })).toBeVisible()

    await page.getByLabel('Título').fill('Carteira recomendada de outubro (revisada)')
    await page.getByRole('button', { name: 'Publicar' }).click()

    await expect(page).toHaveURL(/\/artigos$/)
    await page.goto(webUrl(`/artigos/${SEED.slug}`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Carteira recomendada de outubro (revisada)',
    )
  })
})

// Fidelidade visual (spec 05, UI): só com VISUAL=1. Salva o app e o protótipo em __visual__.
test.describe('Visual · Formulário', () => {
  test.skip(!process.env.VISUAL, 'Gerado só com VISUAL=1')

  const OUT = path.join(import.meta.dirname, '__visual__')
  const PROTOTYPE = pathToFileURL(
    path.join(import.meta.dirname, '../../design/prototipo/Admin.dc.html'),
  ).href
  const SIZES = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 },
  } as const

  for (const [device, viewport] of Object.entries(SIZES)) {
    test(device, async ({ browser }) => {
      const prototype = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
      await prototype.goto(PROTOTYPE, { waitUntil: 'networkidle' })
      await prototype
        .locator(`[data-screen-label="Formulário · tipo PDF · vazio · ${device}"] > div`)
        .first()
        .screenshot({ path: path.join(OUT, `admin-form-pdf-${device}-prototipo.png`) })
      await prototype
        .locator(`[data-screen-label="Formulário · tipo PDF · erro · ${device}"] > div`)
        .first()
        .screenshot({ path: path.join(OUT, `admin-form-pdf-erro-${device}-prototipo.png`) })
      await prototype
        .locator(`[data-screen-label="Formulário · tipo Texto · ${device}"] > div`)
        .first()
        .screenshot({ path: path.join(OUT, `admin-form-texto-${device}-prototipo.png`) })
      await prototype.close()

      const page = await browser.newPage({ viewport })
      await signInAsAdmin(page)
      await page.goto('/artigos/novo')
      await page.mouse.move(0, 0)
      await page.screenshot({
        path: path.join(OUT, `admin-form-pdf-${device}-app.png`),
        fullPage: true,
      })
      await page.getByLabel('Arquivo PDF').setInputFiles(bigPdf())
      await page.getByRole('button', { name: 'Publicar' }).click()
      await page.getByText('O arquivo tem 24,6 MB').waitFor()
      await page.mouse.move(0, 0)
      await page.screenshot({
        path: path.join(OUT, `admin-form-pdf-erro-${device}-app.png`),
        fullPage: true,
      })

      await page.goto('/artigos/novo')
      await page.getByLabel('Título').fill('Tesouro IPCA+ ou prefixado: como comparar')
      await page.getByLabel('Slug').fill('tesouro-ipca-ou-prefixado-como-comparar')
      await page.getByRole('group', { name: 'Tipo' }).getByRole('button', { name: 'Texto' }).click()
      const toolbar = page.getByRole('toolbar', { name: 'Formatação' })
      await page.getByRole('textbox', { name: 'Conteúdo' }).click()
      await toolbar.getByRole('button', { name: 'H2' }).click()
      await page.keyboard.type('O que cada título paga')
      await page.keyboard.press('Enter')
      await page.keyboard.type('O Tesouro Prefixado garante a taxa no momento da compra.')
      await page.keyboard.press('Enter')
      await toolbar.getByRole('button', { name: 'Lista', exact: true }).click()
      await page.keyboard.type('Prefixado: faz sentido quando você espera queda dos juros.')
      await page.mouse.move(0, 0)
      await page.screenshot({
        path: path.join(OUT, `admin-form-texto-${device}-app.png`),
        fullPage: true,
      })
      await page.close()
    })
  }
})
