# 0045 · Títulos em Roboto Slab Black

- Status: accepted · Data: 2026-10-07 · Emenda em 2026-10-07: por decisão do cliente, o peso dos títulos passou a 700 (Bold)
- Specs: [DS-003](../specs/06-design-system.md), [03 · UI](../specs/03-public-site.md)
- Supersedes, em parte: [0044](0044-tipografia-e-favicon-do-site-institucional.md) (títulos e subtítulos)

## Contexto
Depois da ADR 0044 o título principal ficou fino (peso 300), em maiúsculas e com 5,2 px entre as
letras. O cliente pediu de volta o que o guia da marca manda
([design/marca/INFO-RN-XP.pdf](../../design/marca/INFO-RN-XP.pdf)): Roboto Slab Black em títulos e
Roboto Slab Regular em subtítulos, com títulos menores e letras juntas.

## Decisão
Vale para todo título do blog e do admin: H1 de página, títulos de seção, de card, de modal e de
diálogo.

| | Antes (ADR 0044) | Depois |
|---|---|---|
| Peso do H1 | 300 | 900 |
| Peso dos demais títulos | 400 | 900 |
| Caixa do H1 | maiúsculas | como foi digitado |
| Espaçamento entre letras do H1 | 5,2 px | normal |
| H1 do site | 48 px (36 no celular), entrelinha 1 | 36 px (28 no celular), entrelinha 1,2 |
| H1 do admin (Artigos, Leads, formulário) | 30 px, entrelinha 1 | 36 px (28 no celular), entrelinha 1,2 |
| H1 do login do admin | 24 px, entrelinha 1 | 36 px (28 no celular), entrelinha 1,2 |
| Entrelinha dos níveis `xl` / `2xl` / `3xl` / `4xl` | 1,2 / 1,2 / 1 / 1 | 1,35 / 1,3 / 1,2 / 1,15 |
| Entrelinha do título de card e do `h3` do artigo (18 px) | 1,2 | 1,35 |
| Subtítulos e linhas de apoio de título | 300 | 400 |

- **H1 de toda página** usa o utilitário `text-h1`: `--font-size-h1` (28 px; a partir de 768 px,
  `--font-size-3xl`, 36 px) com `--line-height-h1` (1,2). A entrelinha é a que o H1 tinha antes da
  ADR 0044 no nível de 36 px.
- **Demais títulos** ficam abaixo do H1 nas duas larguras. Nenhum precisou descer: destaque
  30 px (24 no celular); `h2` do artigo e do aviso de privacidade, título de modal e de diálogo
  24 px; card da listagem, card do admin e `h3` do artigo 18 px.
- **Subtítulos** em Roboto Slab Regular (400): resumo do artigo, linha de apoio do hero, das
  páginas de erro, do modal e dos títulos do admin.
- Tokens: volta `--font-weight-black` (900), sai `--letter-spacing-title`, entra
  `--line-height-h1`. O nível `4xl` (48 px) fica na escala, sem uso.
- A entrelinha restaurada é a de antes do commit `cdb50d3`. Exceção: o `h3` do editor do admin
  herdava 1,7 do corpo e passa a 1,35, igual ao `h3` que o site mostra.

**Continua valendo da ADR 0044**: texto corrido, menu e rodapé em 300; rótulo do botão em 400 com
maiúsculas e 1,4 px; entrelinha 1,5 do texto corrido; favicon. Famílias e cores não mudam.

## Consequências
- O H1 do admin e o do login cresceram no desktop (30 → 36 e 24 → 36 px): a regra é uma só para
  todo `<h1>`.
- O título do artigo mantém `hyphens-auto` + `wrap-break-word`; os títulos de card ganharam os
  dois. No card de destaque a capa ganhou `max-w-full` a partir de 768 px: com título de muitas
  linhas ela crescia além da própria coluna e invadia o texto. Um título de 60 caracteres com uma palavra de 20 letras não estoura a
  390 px (`tests/e2e/titulos.spec.ts`).
- A Roboto Slab do `next/font` é variável (100 a 900): nenhum peso a declarar em `fonts.ts`.
- `tailwind-merge` (`cn.ts`) conhece `text-h1` e `font-black`.
- Os tokens foram alterados à mão no export em `design/design-system/tokens/`: reaplicar no Claude
  Design, ou o próximo export os apaga.

## Emenda · peso 700 (2026-10-07)
Por decisão do cliente, o peso dos títulos passou a 700 (Bold). Onde este documento diz 900 ou
Black, vale 700: `--font-weight-black` passa a `700` nos três lugares dos tokens e os componentes
seguem com `font-black`. O token mantém o nome para a mudança ficar só no valor; renomear é
decisão à parte. Tamanho, caixa, espaçamento entre letras, entrelinha e subtítulos (400) não mudam.
