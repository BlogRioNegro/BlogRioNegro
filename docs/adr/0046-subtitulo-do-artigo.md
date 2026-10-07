# 0046 · Subtítulo do artigo

- Status: accepted · Data: 2026-10-07
- Specs: [DATA-001, DATA-002](../specs/01-data-model.md), [PUB-003, PUB-005, PUB-010, PUB-012](../specs/03-public-site.md), [ADM-003, ADM-004, ADM-008, ADM-009](../specs/05-admin-panel.md)
- Complementa: [0022](0022-convencoes-do-schema.md) e [0033](0033-save-article-transacional-sob-rls.md)

## Contexto
O cliente publica séries com o mesmo título e um período ("O que moveu o mercado" / "21 a 25 de
setembro") e quer o título em duas linhas, a segunda menor. Num campo só, o período entrava no
título, no slug e no título gravado no lead.

## Decisão
- **Coluna `articles.subtitle`**: `text`, opcional, `CHECK (char_length(subtitle) between 1 and 160)`
  (o limite do título). Sem subtítulo é `null`: string vazia não entra na coluna. Herda a RLS de
  `articles` (leitura pública, escrita só do admin).
- **`save_article`** ganha `subtitle text default null`, por último. Parâmetro novo muda a
  assinatura, então a migration `20261007140000_article_subtitle.sql` faz `drop` da função antiga e
  cria a nova, com `security invoker`, os mesmos `revoke`/`grant` e a transação única; `create or
  replace` deixaria duas funções e a chamada sem o subtítulo ficaria ambígua no PostgREST. A função
  grava `nullif(btrim(subtitle), '')`.
- **Compatibilidade**: quem chama sem o parâmetro continua funcionando e grava `null`. Em produção
  a migration é aplicada **antes** do deploy do código novo.
- **Admin**: campo "Subtítulo (opcional)" abaixo do Título, validado no mesmo schema Zod do
  formulário (`trim`, máx. 160, vazio vira `null`). Na lista, o subtítulo aparece abaixo do título,
  em texto secundário.
- **Site**: o subtítulo é um `<p>` logo abaixo do título (não é heading), em Roboto Slab Regular
  (400), um degrau abaixo do título do contexto:

  | Contexto | Título | Subtítulo |
  |---|---|---|
  | Página do artigo | `text-h1` 36 px (28 no celular) | 30 px (24 no celular) |
  | Card de destaque | 30 px (24 no celular) | 24 px (20 no celular) |
  | Card da listagem | 18 px | 16 px |

- **Uma linha só** (`articleFullTitle`, em `lib/domain/article-title.ts`): `<title>`, `og:title`,
  `twitter:title` e o título do item no RSS usam "Título: Subtítulo".
- **PDF gerado** dos artigos de texto: o subtítulo sai numa linha depois do título, com o estilo
  `h3` que o arquivo já tinha. O resto do PDF não muda.
- **Não muda**: o slug (vem só do título), `leads.article_title_snapshot`, o CSV e o payload do
  webhook, que continuam só com o título.

## Consequências
- **Ordem do deploy**: o site lê `subtitle` em toda listagem e artigo. Código novo sem a coluna em
  produção derruba o site; a migration vai primeiro (`supabase db push`, feito pelo Rafael).
- Entre a migration e o deploy, o admin antigo salva sem o parâmetro: grava `null`, o que é
  correto enquanto nenhum artigo tem subtítulo.
- O nome acessível do link do card passa a incluir o subtítulo.
- Nos testes, o campo Título é localizado pelo rótulo exato: "Subtítulo (opcional)" contém "título".
