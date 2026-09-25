import { expect, test, type Page } from '@playwright/test'
import { webUrl } from './support/urls'

// Captura de lead (spec 04) na página do artigo do seed, com as chaves de teste do Turnstile.

const ARTICLE_PATH = '/artigos/carteira-recomendada-outubro'

async function openModal(page: Page) {
  await page.goto(webUrl(ARTICLE_PATH))
  await page.getByRole('button', { name: 'Baixar artigo completo' }).click()
  return page.getByRole('dialog', { name: 'Baixe o artigo completo' })
}

test.describe('LEAD-001 · Modal', () => {
  test('abre com título, artigo · formato e foco no nome; Esc fecha', async ({ page }) => {
    const dialog = await openModal(page)

    await expect(dialog.getByText('Carteira recomendada de outubro · PDF')).toBeVisible()
    await expect(dialog.getByLabel('Nome')).toBeFocused()
    await expect(dialog.getByLabel('E-mail')).toHaveAttribute('autocomplete', 'email')
    await expect(dialog.getByLabel('Telefone')).toHaveAttribute('autocomplete', 'tel')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('mascara o telefone', async ({ page }) => {
    const dialog = await openModal(page)
    const phone = dialog.getByLabel('Telefone')

    await phone.pressSequentially('11987654321')
    await expect(phone).toHaveValue('(11) 98765-4321')
    await phone.fill('+55 21 3456-7890')
    await expect(phone).toHaveValue('(21) 3456-7890')
  })

  test('envio com campos inválidos mostra os erros da spec e foca o primeiro', async ({ page }) => {
    const dialog = await openModal(page)
    await dialog.getByLabel('E-mail').fill('maria@')
    await dialog.getByLabel('Telefone').fill('98765-4321')

    await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()

    await expect(dialog.getByText('Informe seu nome.')).toBeVisible()
    await expect(
      dialog.getByText('Informe um e-mail válido, como nome@exemplo.com.br.'),
    ).toBeVisible()
    await expect(
      dialog.getByText('Informe o telefone com DDD, no formato (99) 99999-9999.'),
    ).toBeVisible()
    await expect(dialog.getByLabel('Nome')).toBeFocused()
    await expect(dialog.getByLabel('Nome')).toHaveAttribute('aria-invalid', 'true')
  })

  test('carrega o widget do Turnstile sob a CSP', async ({ page }) => {
    const violations: string[] = []
    page.on('console', (message) => {
      if (message.text().includes('Content Security Policy')) violations.push(message.text())
    })
    const dialog = await openModal(page)

    // O iframe fica num shadow root fechado: conferir pelo frame e pelo token emitido.
    await expect
      .poll(() => page.frames().some((frame) => frame.url().includes('challenges.cloudflare.com')))
      .toBe(true)
    await expect(dialog.locator('input[name="cf-turnstile-response"]')).not.toHaveValue('')
    expect(violations.filter((text) => text.includes('challenges.cloudflare.com'))).toEqual([])
  })
})
