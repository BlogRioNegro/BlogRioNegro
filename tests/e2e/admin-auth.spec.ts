import { expect, test, type Page } from '@playwright/test'
import { createAuthenticatedUser, SEED_ADMIN, type TestUser } from '../integration/support/clients'
import { signIn } from './support/admin'

// OVW-005 · ADM-001 · ADM-002: login do admin contra o Supabase local.

async function expectRedirectedToLogin(page: Page, path: string) {
  await page.goto(path)
  await expect(page).toHaveURL(/\/login$/)
}

test('login válido abre o painel com a sessão em cookie httpOnly', async ({ page, context }) => {
  await signIn(page, SEED_ADMIN.email, SEED_ADMIN.password)

  await expect(page).toHaveURL(/\/artigos$/)
  await expect(page.getByRole('heading', { name: 'Artigos', level: 1 })).toBeVisible()

  const sessionCookies = (await context.cookies()).filter((cookie) => cookie.name.startsWith('sb-'))
  expect(sessionCookies.length).toBeGreaterThan(0)
  expect(sessionCookies.every((cookie) => cookie.httpOnly)).toBe(true)
})

test('senha errada mostra erro genérico e não cria sessão', async ({ page }) => {
  await signIn(page, SEED_ADMIN.email, 'senha-errada')

  await expect(page.getByRole('main').getByRole('alert')).toHaveText('E-mail ou senha inválidos.')
  await expectRedirectedToLogin(page, '/')
})

test('e-mail inexistente recebe a mesma mensagem da senha errada', async ({ page }) => {
  await signIn(page, 'ninguem@rionegro.local', 'qualquer-senha')

  await expect(page.getByRole('main').getByRole('alert')).toHaveText('E-mail ou senha inválidos.')
})

test.describe('usuário fora de admin_users', () => {
  let user: TestUser
  const password = 'senha-do-usuario-comum'

  test.beforeAll(async () => {
    user = await createAuthenticatedUser(password)
  })

  test.afterAll(async () => {
    await user.remove()
  })

  test('recebe "Acesso negado" e fica sem sessão', async ({ page }) => {
    await signIn(page, user.email, password)

    await expect(page.getByRole('main').getByRole('alert')).toHaveText('Acesso negado.')
    await expectRedirectedToLogin(page, '/')
  })
})

test('acesso anônimo a rota protegida redireciona para /login', async ({ page }) => {
  await expectRedirectedToLogin(page, '/')
  await expectRedirectedToLogin(page, '/artigos')
})

test('logout limpa a sessão', async ({ page, context }) => {
  await signIn(page, SEED_ADMIN.email, SEED_ADMIN.password)
  await expect(page).toHaveURL(/\/artigos$/)

  await page.getByRole('button', { name: 'Sair' }).click()

  await expect(page).toHaveURL(/\/login$/)
  const sessionCookies = (await context.cookies()).filter((cookie) => cookie.name.startsWith('sb-'))
  expect(sessionCookies).toEqual([])
  await expectRedirectedToLogin(page, '/')
})
