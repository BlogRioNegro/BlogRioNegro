# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Estado
- Branch `titulos-black` (da `main` em `767ef01`), sem push. Tasks em
  [tasks/titulos-black.md](tasks/titulos-black.md), as duas `[x]`. A branch local `ajuste-titulos`
  é um experimento descartado: não usar.
- TB-001 `6cf98c1` + `4b03995` (ADR 0045): todo título em Roboto Slab Black (900), na caixa digitada
  e sem espaçamento entre letras, no blog e no admin. H1 de toda página com `text-h1`: 36 px
  (desktop) e 28 px (celular), entrelinha 1,2. Subtítulos em 400. Volta `--font-weight-black`, sai
  `--letter-spacing-title`. Card de destaque protegido contra título longo no desktop.
- TB-002 `e3d31d6` (ADR 0046): `articles.subtitle` e `save_article` com `subtitle` opcional, na
  migration `20261007140000_article_subtitle.sql`. Campo "Subtítulo (opcional)" no admin; `<p>`
  abaixo do título no artigo e nos cards; "Título: Subtítulo" em `<title>`, OG, Twitter e RSS; linha
  no PDF gerado. Slug, título do lead, CSV e webhook não mudaram.
- Gate completo com Docker verde em 2026-10-07: typecheck, lint, format, 397 unitários, 100 de
  integração, 95 e2e, a11y (22) e `pnpm build`. Capturas em `tests/e2e/__visual__/titulos-black-*.png`.

## Próxima tarefa
Rafael revisa as capturas, aplica a migration em produção e decide o merge/push (ver Pendências).

## Specs e ADRs a ler
Specs 01, 03, 05 e 06; ADRs 0022, 0033, 0044, 0045 e 0046.

## Regras do loop
- Tokens iguais em três lugares (`packages/ui/src/tokens.test.ts`): `packages/ui/src/tokens.css` +
  `theme.css`, `design/design-system/tokens/*.css` e a tabela Tokens da spec 06.
- Utilitário novo de tamanho, peso ou espaçamento entra também em `packages/ui/src/cn.ts`.
- Hex, `rgb()` e `font-family` proibidos em `apps/`. Sem estilo inline e sem `next/image` (ADR 0020).
- Nenhum título maior nem igual ao `text-h1`. Código de server duplicado por app: mudar nas duas cópias.
- Nos e2e, o campo Título é `getByLabel('Título', { exact: true })` ("Subtítulo" contém "título").
- E2E: web :3100/:3102, admin :3101; `pnpm test` exige Docker + `pnpm exec supabase start` (parar
  antes `rio-negro-family-office`); Storage com `42P10`: `pnpm exec supabase db reset --local`.
- Nunca push, nunca ler `.env*`, nunca editar migration existente, nenhuma dependência nova.
  Nunca `supabase db push` nem `supabase link`: produção é com o Rafael.

## Pendências para o Rafael
- **ANTES do merge na main: (1) gate completo com Docker verde; (2) o Rafael aplica a migration do
  subtítulo no Supabase de PRODUÇÃO (`supabase db push`). Código novo sem a coluna em produção
  derruba o site.** O item (1) passou em 2026-10-07; repetir se a branch mudar.
- Validar com o cliente: H1 do admin (30 → 36 px) e do login (24 → 36 px) cresceram no desktop;
  subtítulo do PDF gerado usa o estilo `h3` (Helvetica-Bold 14).
- Tokens alterados à mão no export do Claude Design (marca, tipografia e títulos): reaplicar lá.
- Favicon branco e amarelo sobre transparente: validar com o cliente.
- `curl`/`wget` estão no `deny` de `.claude/settings.json`.
- SEC-1 / F3-002 (header do IP na Vercel), SEC-4, SEC-5, SEC-6 e ADR 0039 seguem abertos.
- `docs/specs/00-overview.md` e a spec 02 ainda citam a StayCloud como hospedagem.
