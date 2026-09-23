---
id: 03-public-site
status: approved
ui_status: pending-design
fase: 4
depends_on: [01-data-model.md, 02-security-rls.md, 04-lead-capture.md, 06-design-system.md]
---

# 03 · Site público (`apps/web`)

## Requisitos

### PUB-001 · Home
Hero de boas-vindas com texto fixo no código e CTA para `/artigos`.
**Aceite:** `/` renderiza o hero sem consultar o banco; o CTA leva a `/artigos`.

### PUB-002 · Destaque automático
O destaque é o artigo com `published_at` mais recente (desempate `created_at desc`),
calculado por função de domínio `getFeaturedArticle` ([ADR 0004](../adr/0004-destaque-automatico.md)).
**Aceite:** com 0 artigos a listagem mostra estado vazio; com 1 artigo ele aparece só como
destaque; alterar `published_at` de outro artigo para mais recente troca o destaque.

### PUB-003 · Listagem `/artigos`
Coluna única: destaque no topo; abaixo, os demais em ordem `published_at desc`, sem repetir
o destaque. Card: capa + título (+ data).
**Aceite:** o destaque nunca aparece duas vezes; a ordem é estável com datas iguais.

### PUB-004 · "Carregar mais"
Lotes de 10 artigos. O botão "Carregar mais" busca o próximo lote sem recarregar a página.
Fallback para crawlers e sem JS: o botão é um link `/artigos?page=N` renderizado no server.
**Aceite:** sem JavaScript, `?page=2` mostra o 2º lote; com JS, o clique anexa o lote;
o botão some quando não há mais artigos; `page` inválido cai na página 1.

### PUB-005 · Página do artigo `/artigos/[slug]`
Mostra título, capa, data de publicação, resumo (se houver) e a **prévia**
([ADR 0007](../adr/0007-conteudo-gated-previa-publica.md)), seguida do botão
"Baixar artigo completo" que abre o modal de [04-lead-capture](04-lead-capture.md).
A página nunca consulta `article_contents` nem `article-files`.
**Aceite:** o HTML da página e o payload RSC não contêm nada além da prévia
(teste e2e compara com o conteúdo completo de um artigo seed).

### PUB-006 · Prévia `rich_text`
`preview_json` (3 primeiros blocos) serializado para HTML no server ([SEC-007](02-security-rls.md)).
**Aceite:** títulos, listas, links, citações e imagens da prévia renderizam; nada além
dos 3 blocos aparece.

### PUB-007 · Prévia `pdf`
O PDF de prévia (2 páginas, bucket público `article-previews`) é embutido na página.
**Aceite:** a prévia abre em desktop e mobile (iOS Safari e Chrome Android); se o navegador
não embutir, aparece um link "Ver prévia" para o mesmo arquivo.

### PUB-008 · Redirect de slug antigo
Slug não encontrado em `articles` é buscado em `article_slug_history`; se existir, responde
**301** para o slug atual ([ADR 0006](../adr/0006-slug-editavel-historico-301.md)).
**Aceite:** link antigo compartilhado abre o artigo com 301; slug inexistente retorna 404.

### PUB-009 · Renderização dinâmica
Rotas que leem artigos são dinâmicas, sem cache de dados
([ADR 0003](../adr/0003-renderizacao-dinamica.md)).
**Aceite:** artigo salvo no admin aparece no site no próximo request, sem rota de revalidate.

### PUB-010 · Metadata e Open Graph
`generateMetadata` por artigo: `title`, `description`, `canonical`, `og:title`,
`og:description`, `og:image` (capa, URL absoluta), `og:type=article`,
`article:published_time`, `twitter:card=summary_large_image`.
Descrição: `summary`; se vazio, rich_text usa os primeiros ~160 caracteres do texto da
prévia; pdf usa a descrição padrão do blog.
**Aceite:** preview correto no WhatsApp e no LinkedIn Post Inspector para um artigo de cada
tipo, com e sem resumo.

### PUB-011 · Sitemap e robots
`/sitemap.xml` com home, `/artigos` e todos os artigos (`lastmod = updated_at`);
`/robots.txt` apontando para o sitemap.
**Aceite:** sitemap válido; slugs antigos não aparecem.

### PUB-012 · RSS
`/rss.xml` (RSS 2.0) com os 20 artigos mais recentes: título, link, data, descrição
(mesma regra de PUB-010) e capa como `enclosure`.
**Aceite:** feed valida no W3C Feed Validator; não inclui conteúdo completo.

### PUB-013 · Rodapé
Em todas as páginas: CTA discreto "Conheça a Rio Negro" (`NEXT_PUBLIC_RIO_NEGRO_URL`, nova
aba), disclaimer regulatório (CVM 178/23 e contrato de distribuição com a XP) e link
"Privacidade" para `/privacidade`. Não há CTA no corpo do artigo
([ADR 0018](../adr/0018-cta-e-disclaimer-no-rodape.md)).
**Aceite:** rodapé presente em home, listagem, artigo, privacidade e 404; texto do
disclaimer idêntico ao rodapé de rionegroinvestimentos.com.br (copiado na F4-009).

### PUB-014 · Página `/privacidade`
Renderiza o texto definido em [LEAD-013](04-lead-capture.md).
**Aceite:** acessível pelo rodapé e pelo modal; indexável.

### PUB-015 · Páginas de erro
`not-found` e `error` com o layout do site e link para `/artigos`.
**Aceite:** erro de banco mostra a página de erro sem vazar detalhes ([SEC-008](02-security-rls.md)).

## UI · pending-design

Layout, componentes e estados visuais de home, listagem, card, página do artigo, prévia,
rodapé e 404 serão definidos na fase 2 a partir do protótipo do Claude Design
([06-design-system](06-design-system.md)). Não inventar layout antes disso.

## Fora de escopo

- CTA no corpo do artigo, busca, filtros, categorias, artigos relacionados.
- Comentários, curtidas, compartilhamento com contagem.
- Analytics e banner de cookies (sem cookies de rastreamento no lançamento).
- Liberar o restante do texto na página após o lead (o lead recebe o PDF, [LEAD-009](04-lead-capture.md)).
