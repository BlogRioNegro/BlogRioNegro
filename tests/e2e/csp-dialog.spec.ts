import { expect, test, type Page } from '@playwright/test'
import { signInAsAdmin } from './support/admin'
import { TURNSTILE_FAIL_WEB_URL } from './support/urls'

// SEC-006 · ADR 0020 · Abrir um Dialog (Radix) não gera violação de CSP: o <style> que ele injeta
// recebe o nonce do request via get-nonce.

function collectCspViolations(page: Page): string[] {
  const violations: string[] = []
  page.on('console', (message) => {
    if (message.text().includes('Content Security Policy')) violations.push(message.text())
  })
  return violations
}

test('web: modal de lead abre sem violação de CSP (build de produção)', async ({ page }) => {
  const violations = collectCspViolations(page)

  await page.goto(new URL('/artigos/carteira-recomendada-outubro', TURNSTILE_FAIL_WEB_URL).href)
  await page.getByRole('button', { name: 'Baixar artigo completo' }).click()
  await expect(page.getByRole('dialog', { name: 'Baixe o artigo completo' })).toBeVisible()
  await expect(page.locator('style[nonce]')).not.toHaveCount(0)

  expect(violations).toEqual([])
})

test('admin: dialog do editor abre sem violação de CSP', async ({ page }) => {
  const violations = collectCspViolations(page)
  await signInAsAdmin(page)
  await page.goto('/artigos/novo')
  await page.getByRole('group', { name: 'Tipo' }).getByRole('button', { name: 'Texto' }).click()
  // Só o Dialog: a carga em modo dev (`next dev`) tem violações de estilo próprias.
  violations.length = 0

  await page
    .getByRole('toolbar', { name: 'Formatação' })
    .getByRole('button', { name: 'Link' })
    .click()
  await expect(page.getByRole('dialog', { name: 'Link' })).toBeVisible()

  expect(violations).toEqual([])
})
