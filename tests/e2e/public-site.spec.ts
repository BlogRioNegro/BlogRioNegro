import { expect, test } from '@playwright/test'
import { webUrl } from './support/urls'

// Site público (spec 03) contra o seed local: 3 artigos.

test.describe('PUB-001 · Home', () => {
  test('mostra o hero e o CTA leva a /artigos', async ({ page }) => {
    await page.goto(webUrl('/'))

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Análises sobre investimentos, escritas pela equipe da Rio Negro.',
      }),
    ).toBeVisible()
    await page.getByRole('main').getByRole('link', { name: 'Ver artigos' }).click()
    await expect(page).toHaveURL(webUrl('/artigos'))
  })

  test('tem header e rodapé com os links da spec', async ({ page }) => {
    await page.goto(webUrl('/'))

    await expect(
      page.getByRole('link', { name: 'Rio Negro Investimentos, página inicial' }),
    ).toHaveAttribute('href', '/')
    const footer = page.getByRole('contentinfo')
    await expect(footer.getByRole('link', { name: /Conheça a Rio Negro/ })).toHaveAttribute(
      'target',
      '_blank',
    )
    await expect(footer.getByRole('link', { name: 'Privacidade' })).toHaveAttribute(
      'href',
      '/privacidade',
    )
  })
})

test.describe('PUB-002 · PUB-003 · Listagem', () => {
  test('mostra o destaque no topo e os demais em ordem, sem repeti-lo', async ({ page }) => {
    await page.goto(webUrl('/artigos'))

    const titles = page.getByRole('main').getByRole('heading', { level: 2 })
    await expect(titles).toHaveText([
      'Guia de previdência privada: PGBL ou VGBL?',
      'Carteira recomendada de outubro',
      'Renda fixa em 2026: o que muda para o investidor',
    ])
    await expect(page.getByRole('link', { name: 'Artigos' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('o card leva à página do artigo', async ({ page }) => {
    await page.goto(webUrl('/artigos'))

    await expect(
      page.getByRole('link', { name: /Carteira recomendada de outubro/ }),
    ).toHaveAttribute('href', '/artigos/carteira-recomendada-outubro')
  })
})
