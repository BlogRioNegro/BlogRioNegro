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
      await page.close()
    })
  }
})
