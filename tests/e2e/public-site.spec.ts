import path from 'node:path'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { executeLocalSql, localSupabase } from '../integration/support/local-supabase'
import { webUrl } from './support/urls'

// Site público (spec 03) contra o seed local: 3 artigos.

test.describe('PUB-001 · Home', () => {
  test('mostra o hero e o CTA leva a /artigos', async ({ page }) => {
    await page.goto(webUrl('/'))

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Artigos, estudos e relatórios elaborados por nosso time de assessores e especialistas.',
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
    await expect(footer.getByRole('link', { name: /Política de privacidade/ })).toHaveAttribute(
      'href',
      'https://rionegroinvestimentos.com.br/politica-de-privacidade/',
    )
    await expect(footer.getByRole('link', { name: /Trabalhe conosco/ })).toHaveAttribute(
      'target',
      '_blank',
    )
    await expect(footer.getByRole('link', { name: '(67) 3304-8380' })).toBeVisible()
    await expect(footer.getByRole('link', { name: /Instagram/ })).toBeVisible()
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

test.describe('PUB-007 · Prévia pdf', () => {
  const PREVIEW =
    /\/storage\/v1\/object\/public\/article-previews\/22222222-2222-4222-8222-222222222222\/b1b2c3d4-0000-4000-8000-000000000002\.pdf/

  test('sem visualizador de PDF, mostra o aviso e o link "Ver prévia" para o arquivo', async ({
    page,
  }) => {
    await page.goto(webUrl('/artigos/carteira-recomendada-outubro'))

    const main = page.getByRole('main')
    await expect(main.getByText('Seu navegador não exibe o PDF nesta página.')).toBeVisible()
    await expect(main.getByRole('link', { name: /Ver prévia/ })).toHaveAttribute('href', PREVIEW)
  })

  test.describe('sem JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('embute a prévia num <object> com o link de fallback dentro', async ({ page }) => {
      await page.goto(webUrl('/artigos/carteira-recomendada-outubro'))

      const embed = page.locator('object[type="application/pdf"]')
      await expect(embed).toHaveAttribute('data', PREVIEW)
      await expect(embed.getByRole('link', { name: /Ver prévia/ })).toHaveAttribute('href', PREVIEW)
    })
  })

  test('a prévia do seed é um PDF público de 2 páginas', async ({ request }) => {
    const response = await request.get(
      `${localSupabase.API_URL}/storage/v1/object/public/article-previews/22222222-2222-4222-8222-222222222222/b1b2c3d4-0000-4000-8000-000000000002.pdf`,
    )

    expect(response.headers()['content-type']).toBe('application/pdf')
    expect((await response.body()).toString('latin1')).toContain('/Count 2')
  })
})

test.describe('PUB-008 · Redirect de slug antigo', () => {
  const id = '88888888-8888-4888-8888-888888888888'

  test.beforeAll(() => {
    executeLocalSql(`with a as (
      insert into public.articles (id, slug, title, cover_path, content_type, preview_pdf_path, published_at)
      values ('${id}', 'slug-compartilhado', 'Artigo com slug editado', 'x/capa.jpg', 'pdf', 'x/previa.pdf',
        now() - interval '30 days')
      returning id
    ) insert into public.article_contents (article_id, full_pdf_path) select id, 'x/completo.pdf' from a`)
    executeLocalSql(`update public.articles set slug = 'slug-editado' where id = '${id}'`)
  })

  test.afterAll(() => {
    executeLocalSql(`delete from public.articles where id = '${id}'`)
  })

  test('link antigo responde 301 para o slug atual e abre o artigo', async ({ page, request }) => {
    const response = await request.get(webUrl('/artigos/slug-compartilhado'), { maxRedirects: 0 })

    expect(response.status()).toBe(301)
    expect(response.headers()['location']).toMatch(/\/artigos\/slug-editado$/)

    await page.goto(webUrl('/artigos/slug-compartilhado'))
    await expect(page).toHaveURL(webUrl('/artigos/slug-editado'))
    await expect(
      page.getByRole('heading', { level: 1, name: 'Artigo com slug editado' }),
    ).toBeVisible()
  })
})

test.describe('PUB-014 · Privacidade', () => {
  test('mostra o texto de LEAD-013 e é indexável', async ({ page }) => {
    await page.goto(webUrl('/privacidade'))

    const main = page.getByRole('main')
    await expect(
      main.getByRole('heading', { level: 1, name: 'Aviso de privacidade' }),
    ).toBeVisible()
    await expect(main).toContainText(
      'Rio Negro Assessoria de Investimentos Ltda., CNPJ 33.457.321/0001-79.',
    )
    await expect(main).toContainText('Consentimento (LGPD, art. 7º, I).')
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })
})

test.describe('PUB-010 · Metadata e Open Graph', () => {
  const id = '99999999-9999-4999-8999-999999999999'

  test.beforeAll(() => {
    executeLocalSql(`with a as (
      insert into public.articles (id, slug, title, cover_path, content_type, preview_json, published_at)
      values ('${id}', 'sem-resumo', 'Artigo sem resumo', 'x/capa.png', 'rich_text',
        '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Primeiro parágrafo da prévia."}]}]}',
        now() - interval '40 days')
      returning id
    ) insert into public.article_contents (article_id, body_json, full_pdf_path)
      select id, '{"type":"doc","content":[]}', 'x/completo.pdf' from a`)
  })

  test.afterAll(() => {
    executeLocalSql(`delete from public.articles where id = '${id}'`)
  })

  const meta = (page: Page, attribute: 'name' | 'property', key: string) =>
    page.locator(`meta[${attribute}="${key}"]`)

  // O artigo do seed tem subtítulo: título e og:title saem como "Título: Subtítulo" (ADR 0046).
  test('artigo pdf com resumo: título, descrição, canonical, og e twitter', async ({ page }) => {
    await page.goto(webUrl('/artigos/carteira-recomendada-outubro'))

    await expect(page).toHaveTitle(
      'Carteira recomendada de outubro: 1 a 31 de outubro · Rio Negro Investimentos',
    )
    const description = 'Alocação sugerida por perfil de risco para o próximo mês.'
    await expect(meta(page, 'name', 'description')).toHaveAttribute('content', description)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      webUrl('/artigos/carteira-recomendada-outubro'),
    )
    await expect(meta(page, 'property', 'og:type')).toHaveAttribute('content', 'article')
    await expect(meta(page, 'property', 'og:title')).toHaveAttribute(
      'content',
      'Carteira recomendada de outubro: 1 a 31 de outubro',
    )
    await expect(meta(page, 'name', 'twitter:title')).toHaveAttribute(
      'content',
      'Carteira recomendada de outubro: 1 a 31 de outubro',
    )
    await expect(meta(page, 'property', 'og:description')).toHaveAttribute('content', description)
    await expect(meta(page, 'property', 'og:image')).toHaveAttribute(
      'content',
      /^http:\/\/127\.0\.0\.1:54321\/storage\/v1\/object\/public\/covers\/22222222-.+\.png$/,
    )
    await expect(meta(page, 'property', 'article:published_time')).toHaveAttribute(
      'content',
      /^\d{4}-\d{2}-\d{2}T/,
    )
    await expect(meta(page, 'name', 'twitter:card')).toHaveAttribute(
      'content',
      'summary_large_image',
    )
  })

  test('rich_text sem resumo usa o texto da prévia como descrição', async ({ page }) => {
    await page.goto(webUrl('/artigos/sem-resumo'))

    await expect(meta(page, 'name', 'description')).toHaveAttribute(
      'content',
      'Primeiro parágrafo da prévia.',
    )
    await expect(meta(page, 'property', 'og:description')).toHaveAttribute(
      'content',
      'Primeiro parágrafo da prévia.',
    )
  })
})

test.describe('PUB-011 · Sitemap e robots', () => {
  const id = 'aaaaaaaa-0000-4000-8000-000000000011'

  test.beforeAll(() => {
    executeLocalSql(`with a as (
      insert into public.articles (id, slug, title, cover_path, content_type, preview_pdf_path)
      values ('${id}', 'slug-velho-sitemap', 'Artigo renomeado', 'x/capa.png', 'pdf', 'x/previa.pdf')
      returning id
    ) insert into public.article_contents (article_id, full_pdf_path) select id, 'x/completo.pdf' from a`)
    executeLocalSql(`update public.articles set slug = 'slug-novo-sitemap' where id = '${id}'`)
  })

  test.afterAll(() => {
    executeLocalSql(`delete from public.articles where id = '${id}'`)
  })

  test('sitemap lista home, listagem e slugs atuais com lastmod, sem slugs antigos', async ({
    request,
  }) => {
    const response = await request.get(webUrl('/sitemap.xml'))
    const xml = await response.text()

    expect(response.headers()['content-type']).toContain('xml')
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    for (const path of [
      '/',
      '/artigos',
      '/artigos/renda-fixa-em-2026',
      '/artigos/slug-novo-sitemap',
    ]) {
      expect(xml).toContain(`<loc>${webUrl(path)}</loc>`)
    }
    expect(xml).toMatch(
      /<loc>[^<]+\/artigos\/guia-de-previdencia-privada<\/loc>\s*<lastmod>\d{4}-\d{2}-\d{2}T/,
    )
    expect(xml).not.toContain('slug-velho-sitemap')
  })

  test('robots.txt aponta para o sitemap', async ({ request }) => {
    const robots = await (await request.get(webUrl('/robots.txt'))).text()

    expect(robots).toContain('Allow: /')
    expect(robots).toContain(`Sitemap: ${webUrl('/sitemap.xml')}`)
  })
})

test.describe('PUB-012 · RSS', () => {
  test('/rss.xml é RSS 2.0 com os artigos do seed e sem conteúdo completo', async ({
    page,
    request,
  }) => {
    const response = await request.get(webUrl('/rss.xml'))
    const xml = await response.text()

    expect(response.headers()['content-type']).toBe('application/rss+xml; charset=utf-8')
    expect(xml).toContain('<rss version="2.0"')
    expect(xml.match(/<item>/g)).toHaveLength(3)
    expect(xml).toContain(`<link>${webUrl('/artigos/renda-fixa-em-2026')}</link>`)
    expect(xml).toContain('<title>Carteira recomendada de outubro: 1 a 31 de outubro</title>')
    expect(xml).toContain('<title>Renda fixa em 2026: o que muda para o investidor</title>')
    expect(xml).toContain(
      '<description>Um panorama dos títulos públicos e privados diante da nova trajetória de juros.</description>',
    )
    expect(xml).toMatch(
      /<enclosure url="http:\/\/127\.0\.0\.1:54321\/[^"]+\.png" length="0" type="image\/png"\/>/,
    )
    expect(xml).not.toContain('Texto completo de exemplo')

    await page.goto(webUrl('/'))
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute(
      'href',
      webUrl('/rss.xml'),
    )
  })
})

test.describe('PUB-015 · Páginas de erro', () => {
  test('rota inexistente mostra o 404 com link para /artigos', async ({ page }) => {
    const response = await page.goto(webUrl('/pagina-que-nao-existe'))

    expect(response?.status()).toBe(404)
    const main = page.getByRole('main')
    await expect(main.getByText('Erro 404')).toBeVisible()
    await expect(
      main.getByRole('heading', { level: 1, name: 'Página não encontrada' }),
    ).toBeVisible()
    await expect(main.getByRole('link', { name: 'Ver todos os artigos' })).toHaveAttribute(
      'href',
      '/artigos',
    )
  })

  test.describe('com o banco recusando a leitura', () => {
    test.beforeAll(() => {
      executeLocalSql('revoke select on public.articles from anon')
    })

    test.afterAll(() => {
      executeLocalSql('grant select on public.articles to anon')
    })

    test('mostra a página de erro sem detalhes do banco', async ({ page }) => {
      await page.goto(webUrl('/artigos'))

      const main = page.getByRole('main')
      await expect(main.getByRole('heading', { level: 1, name: 'Algo deu errado' })).toBeVisible()
      await expect(
        main.getByText(
          'Não foi possível carregar esta página agora. Tente novamente em instantes.',
        ),
      ).toBeVisible()
      await expect(main.getByRole('button', { name: 'Tentar novamente' })).toBeVisible()
      await expect(main.getByRole('link', { name: 'Ver artigos' })).toHaveAttribute(
        'href',
        '/artigos',
      )
      await expect(main).not.toContainText(/permission|denied|articles|Falha/i)
    })
  })
})

// ADR 0047 · Menu do cabeçalho: "Artigos" na home e "Voltar" nas demais páginas.
test.describe('Voltar no cabeçalho', () => {
  const ARTICLE = '/artigos/carteira-recomendada-outubro'
  const menu = (page: Page) => page.getByRole('navigation', { name: 'Principal' })
  const back = (page: Page) =>
    menu(page).getByRole('link', { name: 'Voltar para a página anterior', exact: true })
  const look = (link: Locator) =>
    link.evaluate((element) => {
      const style = getComputedStyle(element)
      return [
        style.fontFamily,
        style.fontSize,
        style.fontWeight,
        style.textTransform,
        style.color,
        style.backgroundColor,
        style.borderTopWidth,
      ]
    })

  test('home mostra "Artigos", que leva à lista', async ({ page }) => {
    await page.goto(webUrl('/'))

    await expect(menu(page).getByRole('link')).toHaveText(['Artigos'])
    await expect(menu(page).getByRole('link', { name: 'Artigos' })).toHaveAttribute(
      'href',
      '/artigos',
    )
  })

  for (const { name, path: pagePath, fallback } of [
    { name: 'lista', path: '/artigos', fallback: '/' },
    { name: 'artigo', path: ARTICLE, fallback: '/artigos' },
    { name: 'privacidade', path: '/privacidade', fallback: '/' },
    { name: '404', path: '/nao-existe', fallback: '/' },
  ]) {
    test(`${name} mostra só "Voltar", com o destino de reserva ${fallback}`, async ({ page }) => {
      await page.goto(webUrl(pagePath))

      await expect(menu(page).getByRole('link')).toHaveText(['Voltar'])
      await expect(back(page)).toHaveAttribute('href', fallback)
      await expect(back(page)).not.toHaveAttribute('aria-current')
      await expect(back(page).locator('svg')).toHaveCount(0)
      expect((await back(page).boundingBox())?.height).toBeGreaterThanOrEqual(44)
    })
  }

  test('"Voltar" tem o estilo de texto do item "Artigos" e foco visível', async ({ page }) => {
    await page.goto(webUrl('/'))
    const articles = await look(menu(page).getByRole('link', { name: 'Artigos' }))

    await page.goto(webUrl('/artigos'))
    expect(await look(back(page))).toEqual(articles)
    await back(page).focus()
    await expect(back(page)).toHaveCSS('outline-style', 'solid')
  })

  test('home → lista → artigo → Voltar (lista) → Voltar (home)', async ({ page }) => {
    await page.goto(webUrl('/'))
    await menu(page).getByRole('link', { name: 'Artigos' }).click()
    await expect(page).toHaveURL(webUrl('/artigos'))
    await page.getByRole('link', { name: /Carteira recomendada de outubro/ }).click()
    await expect(page).toHaveURL(webUrl(ARTICLE))

    await back(page).click()
    await expect(page).toHaveURL(webUrl('/artigos'))
    await back(page).click()
    await expect(page).toHaveURL(webUrl('/'))
    await expect(menu(page).getByRole('link')).toHaveText(['Artigos'])
  })

  test('volta para a tela anterior, não para o nível acima', async ({ page }) => {
    await page.goto(webUrl('/privacidade'))
    await page.getByRole('link', { name: 'Rio Negro Investimentos, página inicial' }).click()
    await expect(page).toHaveURL(webUrl('/'))
    await menu(page).getByRole('link', { name: 'Artigos' }).click()
    await expect(page).toHaveURL(webUrl('/artigos'))

    await back(page).click()
    await expect(page).toHaveURL(webUrl('/'))
  })

  test('artigo aberto direto pela URL: Voltar leva para /artigos e depois para a home', async ({
    page,
  }) => {
    await page.goto(webUrl(ARTICLE))

    await back(page).click()
    await expect(page).toHaveURL(webUrl('/artigos'))
    // A lista veio depois do artigo: agora há tela anterior e o Voltar retorna a ela.
    await back(page).click()
    await expect(page).toHaveURL(webUrl(ARTICLE))
  })

  test('Ctrl + clique abre o destino de reserva em outra aba', async ({ page, context }) => {
    await page.goto(webUrl('/'))
    await menu(page).getByRole('link', { name: 'Artigos' }).click()
    await page.getByRole('link', { name: /Carteira recomendada de outubro/ }).click()
    await expect(page).toHaveURL(webUrl(ARTICLE))

    const [tab] = await Promise.all([
      context.waitForEvent('page'),
      back(page).click({ modifiers: ['ControlOrMeta'] }),
    ])
    await expect(tab).toHaveURL(webUrl('/artigos'))
    await expect(page).toHaveURL(webUrl(ARTICLE))
  })

  test('sem JavaScript, é um link para o nível acima', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto(webUrl(ARTICLE))
    await back(page).click()
    await expect(page).toHaveURL(webUrl('/artigos'))
    await back(page).click()
    await expect(page).toHaveURL(webUrl('/'))
    await context.close()
  })

  test('não há mais botão Voltar no conteúdo', async ({ page }) => {
    for (const pagePath of ['/artigos', ARTICLE]) {
      await page.goto(webUrl(pagePath))

      await expect(page.getByRole('main').getByRole('link', { name: /^Voltar/ })).toHaveCount(0)
    }
  })

  test.describe('capturas', () => {
    test.skip(!process.env.VISUAL, 'Gerado só com VISUAL=1')

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      for (const { file, path: pagePath } of [
        { file: 'home', path: '/' },
        { file: 'lista', path: '/artigos' },
        { file: 'artigo', path: ARTICLE },
      ]) {
        test(`${file} a ${viewport.width} px`, async ({ browser }) => {
          const page = await browser.newPage({ viewport })
          await page.goto(webUrl(pagePath), { waitUntil: 'networkidle' })
          await page.screenshot({
            path: path.join(
              import.meta.dirname,
              '__visual__',
              `voltar-${file}-${viewport.width}.png`,
            ),
            fullPage: true,
          })
          await page.close()
        })
      }
    }
  })
})

test.describe('PUB-013 · Rodapé em todas as páginas', () => {
  for (const path of [
    '/',
    '/artigos',
    '/artigos/renda-fixa-em-2026',
    '/privacidade',
    '/nao-existe',
  ]) {
    test(`rodapé com disclaimer e contato em ${path}`, async ({ page }) => {
      await page.goto(webUrl(path))

      const footer = page.getByRole('contentinfo')
      await expect(footer).toContainText('Resolução CVM 178/23')
      await expect(footer.getByRole('link', { name: '(67) 3304-8380' })).toBeVisible()
    })
  }
})
