# 0044 · Tipografia e favicon do site institucional

- Status: accepted · Data: 2026-10-05 · superseded em parte por
  [0045](0045-titulos-em-roboto-slab-black.md) (títulos e subtítulos)
- Specs: [DS-001, DS-003](../specs/06-design-system.md)
- Supersedes, em parte: [0043](0043-marca-oficial-conforme-o-guia.md) (peso dos títulos e favicon)

## Contexto
O cliente achou os títulos em Roboto Slab Black (900) pesados e pediu a tipografia leve e fina de
https://rionegroinvestimentos.com.br/, além do favicon de lá.

## Decisão
- **Famílias não mudam**: Roboto Slab (títulos e subtítulos) e Roboto (todo o resto), como no guia.
- **Peso, entrelinha, espaçamento entre letras e maiúsculas** copiam o site institucional. Isso
  substitui o "Roboto Slab Black em títulos" do guia.
- **Tamanhos de fonte e cores não mudam.**
- **Favicon**: o do site institucional, no lugar do "RN" do guia. Arquivo original
  `/wp-content/uploads/2021/10/cropped-favicon-1.png` (512×512, PNG transparente), copiado sem
  alteração para `app/icon.png` nos dois apps e `design/design-system/assets/favicon.png`.

### Medição
Estilos computados no site (Chromium via Playwright, 2026-10-05), a 1440 e a 390 px, na home, em
`/sobre-a-rio-negro/` e em `/investimentos/`. O site usa Roboto Slab em todos esses elementos.
Só o tamanho muda entre as larguras (entre parênteses, 390 px).

| Elemento do site | Tamanho | Peso | Entrelinha | Espaç. letras | Maiúsculas |
|---|---|---|---|---|---|
| `h1` | não existe em nenhuma das três páginas | | | | |
| `h2` título de página/seção ("Investimentos", "Conheça nossa assessoria") | 30 px (25) | 300 | 1,0 | 5,2 px | sim |
| `h2` título de card ("On Demand", "Exclusive") | 30 px (25) | 400 | 1,2 | normal | não |
| `h2` nome da equipe | 25 px | 500 | 1,0 | normal | não |
| `h3` ("Câmbio", "Crédito para empresas") | 27 px | 400 | 1,2 | normal | não |
| `p` texto corrido | 17–18 px | 300 | 1,5 | normal | não |
| `p` lista de diferenciais (`/sobre-a-rio-negro/`) | 17 px | 400 | 1,5 | normal | não |
| `p` contato e endereço | 17 px (13) | 200 | 1,5 (1,7) | normal | não |
| Link do menu | 14 px | 300 | 20 px (1,43) | normal | sim |
| Botão ("Abra sua conta", "Enviar") | 15 px | 400 | 1,0 | 1,4 px | sim |
| Botão do topo (telefone, "Abra sua conta") | 15 px | 300 | 1,0 | normal | não |
| Rodapé: telefone e ouvidoria | 14 px | 300 | 1,5 | normal | não |
| Rodapé: copyright e texto regulatório | 10 px (13 e 10) | 300 | 1,5 | normal | não |

### Aplicação

| Elemento do site | Elemento do blog e do admin | Antes | Depois |
|---|---|---|---|
| `h2` de página/seção | `h1` de todas as telas | 900 · 1,2/1,15 · normal · sem maiúsculas | 300 · 1,0 · 5,2 px · maiúsculas |
| `h2` de card e `h3` | Títulos de card e do destaque, `h2`/`h3` do artigo e do aviso de privacidade, título do modal, título do card do admin | 900 · 1,3/1,35 | 400 · 1,2 |
| `p` texto corrido | Corpo do artigo (site e editor do admin), aviso de privacidade | 400 · 1,7 | 300 · 1,5 |
| `p` texto corrido | Subtítulos: resumo do artigo, linha de apoio do hero, das páginas de erro, do modal e dos títulos do admin | 400 · 1,35/1,5 | 300 · 1,5 |
| Link do menu | Links do header (site e admin, com "Sair") | 500 · sem maiúsculas | 300 · maiúsculas |
| Botão | `Button` `primary`, `secondary` e `ghost` | 500 · normal · sem maiúsculas | 400 · 1,4 px · maiúsculas |
| Rodapé | Links, copyright e texto regulatório do rodapé | 400 · regulatório 1,4 | 300 · regulatório 1,5 |

Tokens: `--font-weight-light` (300) entra e `--font-weight-black` (900) sai;
`--line-height-md`/`-lg` 1,5; `--line-height-xl`/`-2xl` 1,2; `--line-height-3xl`/`-4xl` 1;
`--line-height-article` passa a `--line-height-normal`; `--letter-spacing-title` (5,2 px) e
`--letter-spacing-button` (1,4 px), com os utilitários `tracking-title` e `tracking-button`.
Maiúsculas pelo utilitário `uppercase`, sempre junto do espaçamento.

**Sem equivalente no site** (ficam como estavam): `Label`, `Input`, `FieldMessage`, `Checkbox`,
`Alert`, badges, tabela e paginação do admin; data e legendas; negrito do artigo (700); `Button`
`link` (500, acompanha o texto). A entrelinha do menu e a do botão não foram copiadas: são textos
de uma linha em controle de altura fixa. Os pesos 200 (contato e endereço) e 500 (nomes da equipe)
não têm elemento correspondente no blog.

## Consequências
- O título do artigo em maiúsculas com 5,2 px de espaçamento comporta cerca de 13 letras por linha
  a 390 px: palavras maiores são hifenizadas (`hyphens-auto` + `wrap-break-word`), sem overflow.
- Texto abaixo de 18 px em peso 300: menu (16 px), subtítulos do modal (16 px) e do admin (14 px)
  e rodapé (16 e 11 px). Nenhum texto em peso 200.
- `tailwind-merge` (`cn.ts`) conhece os pesos e os espaçamentos dos tokens, para `font-light` não
  anular `font-serif`.
- As fontes do `next/font` são variáveis: nenhum peso novo a declarar em `fonts.ts`.
- Os tokens foram alterados à mão no export em `design/design-system/tokens/`: reaplicar no Claude
  Design, ou o próximo export os apaga.
- O favicon é branco e amarelo sobre fundo transparente: em aba clara do navegador, só a barra
  amarela aparece bem, como no site institucional.
- Tamanhos diferentes dos do site, mantidos: título 48/36 px (site 30/25), menu 16 (14), botão
  16 (15), corpo do artigo 20/18 (17–18), links do rodapé 16 (14), regulatório 11 (10).
