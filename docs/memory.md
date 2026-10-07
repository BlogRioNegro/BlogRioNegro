# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Estado
- Branch `main`, com o PR #4 (`titulos-black`) já mergeado em `9c546ae`.
- Títulos em Bold `31250e0` (emenda na ADR 0045): por decisão do cliente, todo título passou de 900
  para 700. `--font-weight-black` vale `700` nos três lugares dos tokens; os componentes seguem com
  `font-black` e o token manteve o nome. Caixa digitada, sem espaçamento entre letras, H1 com
  `text-h1` (36/28 px) e subtítulos em 400 não mudaram.
- TB-002 `e3d31d6` (ADR 0046): `articles.subtitle` e `save_article` com `subtitle` opcional, na
  migration `20261007140000_article_subtitle.sql`; admin, site, metadata, RSS e PDF.
- Rodapé `b0e75d7`: `--color-footer-bg` é `#000000`, medido no site institucional (ADR 0043).
- Voltar `9ecafae` (ADR 0047): no menu do cabeçalho do blog, a home mostra "Artigos" e as demais
  páginas mostram "Voltar" (`BackLink`, com `NavigationTrail` no layout raiz).
- Verificado depois dos títulos em Bold, em 2026-10-07: typecheck, lint, format, `tokens.test.ts`
  e build, todos verdes. Integração, e2e e a11y **não** rodaram; o `tests/e2e/titulos.spec.ts` foi
  ajustado para 700 sem ser executado.

## Próxima tarefa
Rodar o gate completo com Docker (integração, e2e inteira e a11y) e refazer as capturas de
`tests/e2e/__visual__/titulos-black-*.png`, que ainda mostram o peso 900.

## Specs e ADRs a ler
Specs 03 e 06; ADRs 0043, 0045, 0046 e 0047.

## Regras do loop
- Tokens iguais em três lugares (`packages/ui/src/tokens.test.ts`): `packages/ui/src/tokens.css` +
  `theme.css`, `design/design-system/tokens/*.css` e a tabela Tokens da spec 06.
- Utilitário novo de tamanho, peso ou espaçamento entra também em `packages/ui/src/cn.ts`.
- Hex, `rgb()` e `font-family` proibidos em `apps/`. Sem estilo inline e sem `next/image` (ADR 0020).
- Nenhum título maior nem igual ao `text-h1`. Código de server duplicado por app: mudar nas duas cópias.
- Nos e2e, o campo Título é `getByLabel('Título', { exact: true })` ("Subtítulo" contém "título").
- E2E: web :3100/:3102, admin :3101. Parar o `pnpm dev` antes: o Next não sobe outro `next dev` do
  mesmo app. `pnpm test` exige Docker + `pnpm exec supabase start`.
- Push só com autorização do Rafael para aquele push (a `main` publica o site na Vercel). Nunca
  ler `.env*`, nunca editar migration existente, nenhuma dependência nova. Nunca `supabase db push`
  nem `supabase link`: produção é com o Rafael.

## Pendências para o Rafael
- Confirmar que a migration do subtítulo está aplicada no Supabase de PRODUÇÃO: a `main` já tem o
  código que depende da coluna.
- Decidir se `--font-weight-black` (agora 700) é renomeado ou se os títulos passam a `font-bold`.
- Validar com o cliente: H1 do admin e do login em 36 px; subtítulo do PDF no estilo `h3`.
- Tokens alterados à mão no export do Claude Design (marca, títulos, peso 700 e rodapé): reaplicar lá.
- `curl`/`wget` estão no `deny` de `.claude/settings.json`.
- SEC-1 / F3-002 (header do IP na Vercel), SEC-4, SEC-5, SEC-6 e ADR 0039 seguem abertos.
- `docs/specs/00-overview.md` e a spec 02 ainda citam a StayCloud como hospedagem.
