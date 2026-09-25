import { expect, test, type Page } from '@playwright/test'
import { executeLocalSql } from '../integration/support/local-supabase'
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
    await expect(footer).toContainText(
      'A Rio Negro Assessoria de Investimentos Ltda, inscrita sob o CNPJ 33.457.321/0001-79',
    )
    await expect(footer).toContainText('Ouvidoria da XP pelo telefone 0800 722 3730.')
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

test.describe('PUB-004 · Carregar mais', () => {
  // 12 artigos mais antigos que o seed: destaque + 14 na lista → lote 1 com 10 e lote 2 com 4.
  const EXTRA = 12

  test.beforeAll(() => {
    executeLocalSql(`with a as (
      insert into public.articles (id, slug, title, cover_path, content_type, preview_pdf_path, published_at)
      select ('66666666-6666-4666-8666-6666666666' || lpad(i::text, 2, '0'))::uuid, 'lote-' || i,
        'Artigo do lote ' || i, 'x/capa.jpg', 'pdf', 'x/previa.pdf', now() - (i + 10) * interval '1 day'
      from generate_series(1, ${EXTRA}) i
      returning id
    ) insert into public.article_contents (article_id, full_pdf_path) select id, 'x/completo.pdf' from a`)
  })

  test.afterAll(() => {
    executeLocalSql(`delete from public.articles where slug like 'lote-%'`)
  })

  const cards = (page: Page) => page.getByRole('main').getByRole('heading', { level: 2 })

  test('com JS, o clique anexa o próximo lote sem recarregar e o botão some no fim', async ({
    page,
  }) => {
    await page.goto(webUrl('/artigos'))
    await page.evaluate(() => Object.assign(window, { semRecarregar: true }))
    await expect(cards(page)).toHaveCount(11)

    await page.getByRole('link', { name: 'Carregar mais' }).click()

    await expect(cards(page)).toHaveCount(15)
    await expect(cards(page).last()).toHaveText(`Artigo do lote ${EXTRA}`)
    await expect(page.getByRole('link', { name: 'Carregar mais' })).toHaveCount(0)
    await expect(page).toHaveURL(webUrl('/artigos'))
    expect(await page.evaluate(() => 'semRecarregar' in window)).toBe(true)
  })

  test.describe('sem JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('o botão é um link para ?page=2, que mostra o 2º lote', async ({ page }) => {
      await page.goto(webUrl('/artigos'))
      await page.getByRole('link', { name: 'Carregar mais' }).click()

      await expect(page).toHaveURL(webUrl('/artigos?page=2'))
      await expect(cards(page)).toHaveText([
        'Guia de previdência privada: PGBL ou VGBL?',
        'Artigo do lote 9',
        'Artigo do lote 10',
        'Artigo do lote 11',
        'Artigo do lote 12',
      ])
      await expect(page.getByRole('link', { name: 'Carregar mais' })).toHaveCount(0)
    })

    test('page inválido cai na página 1', async ({ page }) => {
      await page.goto(webUrl('/artigos?page=abc'))

      await expect(cards(page)).toHaveCount(11)
      await expect(page.getByRole('link', { name: 'Carregar mais' })).toHaveAttribute(
        'href',
        '/artigos?page=2',
      )
    })
  })
})

test.describe('PUB-005 · Página do artigo', () => {
  test('mostra título, data, resumo, nota da prévia e "Baixar artigo completo"', async ({
    page,
  }) => {
    await page.goto(webUrl('/artigos/carteira-recomendada-outubro'))

    const main = page.getByRole('main')
    await expect(
      main.getByRole('heading', { level: 1, name: 'Carteira recomendada de outubro' }),
    ).toBeVisible()
    await expect(main.getByText('Alocação sugerida por perfil de risco')).toBeVisible()
    await expect(main.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T/)
    await expect(
      main.getByText('Esta é uma prévia. O artigo completo está disponível para download.'),
    ).toBeVisible()
    await expect(main.getByRole('button', { name: 'Baixar artigo completo' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'Todos os artigos' })).toHaveAttribute(
      'href',
      '/artigos',
    )
  })

  test('slug inexistente responde 404', async ({ page }) => {
    const response = await page.goto(webUrl('/artigos/nao-existe'))

    expect(response?.status()).toBe(404)
  })
})

test.describe('PUB-006 · Prévia rich_text', () => {
  test('renderiza a prévia do seed e não o conteúdo completo', async ({ page }) => {
    await page.goto(webUrl('/artigos/renda-fixa-em-2026'))

    const main = page.getByRole('main')
    await expect(
      main.getByText('Com a nova trajetória da Selic, a renda fixa volta ao centro das carteiras.'),
    ).toBeVisible()
    expect(await page.content()).not.toContain('Texto completo de exemplo')
  })
})
