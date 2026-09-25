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
    await expect(dialog.getByLabel('Nome', { exact: true })).toBeFocused()
    await expect(dialog.getByLabel('E-mail', { exact: true })).toHaveAttribute(
      'autocomplete',
      'email',
    )
    await expect(dialog.getByLabel('Telefone', { exact: true })).toHaveAttribute(
      'autocomplete',
      'tel',
    )

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('mascara o telefone', async ({ page }) => {
    const dialog = await openModal(page)
    const phone = dialog.getByLabel('Telefone', { exact: true })

    await phone.pressSequentially('11987654321')
    await expect(phone).toHaveValue('(11) 98765-4321')
    await phone.fill('+55 21 3456-7890')
    await expect(phone).toHaveValue('(21) 3456-7890')
  })

  test('envio com campos inválidos mostra os erros da spec e foca o primeiro', async ({ page }) => {
    const dialog = await openModal(page)
    await dialog.getByLabel('E-mail', { exact: true }).fill('maria@')
    await dialog.getByLabel('Telefone', { exact: true }).fill('98765-4321')

    await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()

    await expect(dialog.getByText('Informe seu nome.')).toBeVisible()
    await expect(
      dialog.getByText('Informe um e-mail válido, como nome@exemplo.com.br.'),
    ).toBeVisible()
    await expect(
      dialog.getByText('Informe o telefone com DDD, no formato (99) 99999-9999.'),
    ).toBeVisible()
    await expect(dialog.getByLabel('Nome', { exact: true })).toBeFocused()
    await expect(dialog.getByLabel('Nome', { exact: true })).toHaveAttribute('aria-invalid', 'true')
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

test.describe('LEAD-003 · Consentimento', () => {
  test('mostra o aviso de LEAD-013 e o checkbox desmarcado com link para /privacidade', async ({
    page,
  }) => {
    const dialog = await openModal(page)

    await expect(
      dialog.getByText(
        'Usaremos seu nome, e-mail e telefone para enviar este material e registrar seu interesse. Se você autorizar abaixo, também poderemos enviar novidades da Rio Negro.',
        { exact: true },
      ),
    ).toBeVisible()
    const consent = dialog.getByRole('checkbox', {
      name: 'Li e concordo com o aviso de privacidade.',
    })
    await expect(consent).not.toBeChecked()
    const link = dialog.getByRole('link', { name: 'aviso de privacidade' })
    await expect(link).toHaveAttribute('href', '/privacidade')
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('sem o checkbox, o client bloqueia o envio sem chamar a action', async ({ page }) => {
    const actions: string[] = []
    page.on('request', (request) => {
      if (request.headers()['next-action']) actions.push(request.url())
    })
    const dialog = await openModal(page)
    await dialog.getByLabel('Nome', { exact: true }).fill('Maria Silva')
    await dialog.getByLabel('E-mail', { exact: true }).fill('maria@exemplo.com.br')
    await dialog.getByLabel('Telefone', { exact: true }).fill('11987654321')

    await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()

    await expect(dialog.getByText('Marque esta opção para continuar.')).toBeVisible()
    await expect(
      dialog.getByRole('checkbox', { name: 'Li e concordo com o aviso de privacidade.' }),
    ).toBeFocused()
    expect(actions).toEqual([])
  })
})

test.describe('LEAD-004 · Opt-in', () => {
  test('é opcional, vem desmarcado e marca com um clique', async ({ page }) => {
    const dialog = await openModal(page)
    const optIn = dialog.getByRole('checkbox', {
      name: 'Aceito receber novidades da Rio Negro por e-mail, telefone ou WhatsApp.',
    })

    await expect(optIn).not.toBeChecked()
    await optIn.click()
    await expect(optIn).toBeChecked()
    await dialog.getByRole('button', { name: 'Baixar artigo completo' }).click()
    await expect(dialog.getByText('Informe seu nome.')).toBeVisible()
    await expect(optIn).not.toHaveAttribute('aria-invalid')
  })
})
