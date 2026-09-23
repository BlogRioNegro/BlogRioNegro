# 0006 · Slug editável com histórico e redirect 301

- Status: accepted · Data: 2026-09-23
- Specs: [DATA-003](../specs/01-data-model.md), [PUB-008](../specs/03-public-site.md), [ADM-009](../specs/05-admin-panel.md)

## Contexto
Artigos são compartilhados no WhatsApp; links não podem quebrar.

## Decisão
- Slug gerado do título na criação; mudar o título **não** muda o slug.
- O admin pode **editar** o slug. O anterior vai para `article_slug_history`.
- Request a slug antigo responde 301 para o atual.

## Consequências
- Nenhum link compartilhado quebra, e o SEO é transferido pelo 301.
- Unicidade verificada entre slugs atuais e históricos.
