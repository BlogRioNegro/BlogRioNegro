# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Estado
- Branch `titulos-black` (da `main` em `767ef01`), sem push. Tasks em
  [tasks/titulos-black.md](tasks/titulos-black.md), as duas `[x]`. A branch local `ajuste-titulos`
  é um experimento descartado: não usar.
- TB-001 `6cf98c1` + `4b03995` (ADR 0045): todo título em Roboto Slab Black (900), caixa digitada,
  sem espaçamento entre letras. H1 de toda página com `text-h1` (36/28 px). Subtítulos em 400.
- TB-002 `e3d31d6` (ADR 0046): `articles.subtitle` e `save_article` com `subtitle` opcional, na
  migration `20261007140000_article_subtitle.sql`; admin, site, metadata, RSS e PDF.
- Rodapé `b0e75d7`: `--color-footer-bg` é `#000000`, medido no site institucional (ADR 0043).
- Voltar `6d311ac` (ADR 0047): `BackButton` (`Button` `secondary` `sm`) na linha do H1 em `/artigos`
  (→ `/`) e na linha da data em `/artigos/[slug]` (→ `/artigos`). A data do artigo subiu para o topo
  e o link "Todos os artigos" saiu.
- Gate completo verde em 2026-10-07 até a TB-002 (397 unitários, 100 integração, 95 e2e, a11y,
  build). Depois do rodapé e do Voltar rodaram só typecheck, lint, format, unitários de web e ui,
  build e `pnpm test:e2e public-site` (35 verdes).

## Próxima tarefa
Rafael revisa as capturas (`tests/e2e/__visual__/titulos-black-*.png` e `voltar-*.png`), aplica a
migration em produção e decide o merge/push (ver Pendências).

## Specs e ADRs a ler
Specs 01, 03, 05 e 06; ADRs 0022, 0033, 0043, 0045, 0046 e 0047.

## Regras do loop
- Tokens iguais em três lugares (`packages/ui/src/tokens.test.ts`): `packages/ui/src/tokens.css` +
  `theme.css`, `design/design-system/tokens/*.css` e a tabela Tokens da spec 06.
- Utilitário novo de tamanho, peso ou espaçamento entra também em `packages/ui/src/cn.ts`.
- Hex, `rgb()` e `font-family` proibidos em `apps/`. Sem estilo inline e sem `next/image` (ADR 0020).
- Nenhum título maior nem igual ao `text-h1`. Código de server duplicado por app: mudar nas duas cópias.
- Nos e2e, o campo Título é `getByLabel('Título', { exact: true })` ("Subtítulo" contém "título").
- E2E: web :3100/:3102, admin :3101. Parar o `pnpm dev` antes: o Next não sobe outro `next dev` do
  mesmo app. `pnpm test` exige Docker + `pnpm exec supabase start`.
- Nunca push, nunca ler `.env*`, nunca editar migration existente, nenhuma dependência nova.
  Nunca `supabase db push` nem `supabase link`: produção é com o Rafael.

## Pendências para o Rafael
- **ANTES do merge na main: (1) gate completo com Docker verde; (2) o Rafael aplica a migration do
  subtítulo no Supabase de PRODUÇÃO (`supabase db push`). Código novo sem a coluna em produção
  derruba o site.** Para o item (1) falta repetir a suíte e2e inteira e a a11y depois do rodapé e
  do Voltar.
- Validar com o cliente: H1 do admin e do login em 36 px; subtítulo do PDF no estilo `h3`; data do
  artigo no topo (saiu do lado do selo de tipo).
- Tokens alterados à mão no export do Claude Design (marca, títulos e rodapé): reaplicar lá.
- `curl`/`wget` estão no `deny` de `.claude/settings.json`.
- SEC-1 / F3-002 (header do IP na Vercel), SEC-4, SEC-5, SEC-6 e ADR 0039 seguem abertos.
- `docs/specs/00-overview.md` e a spec 02 ainda citam a StayCloud como hospedagem.
