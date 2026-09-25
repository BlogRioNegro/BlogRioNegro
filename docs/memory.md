# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 6 na branch `fase-6` (a partir da `fase-5`). F6-001 a F6-004 `[x]`. Sem push.

## Próxima tarefa
F6-005 · ADM-007 · PDF: original em `article-files` + prévia de 2 páginas (`pdf-lib`) em
`article-previews`; protegido/corrompido rejeitado; trocar o PDF remove os antigos.

## Decisões da fase 6 (valem para F6-007+)
- Toda Server Action/route handler: `requireAdmin()` na 1ª linha + teste de integração sem cookie
  (`tests/integration/admin-article-actions.test.ts`); `require-admin-usage.test.ts` varre `app/`.
  Tipo de retorno com `{` inline quebra a varredura: usar alias de tipo.
- `save_article` (ADR 0033): RPC transacional sob RLS. `saveArticle` (`app/artigos/actions.ts`)
  reaproveita o conteúdo se o tipo não mudou e nada novo veio; PDF novo (F6-005) e rich text novo
  (F6-006, hoje devolve erro de conteúdo) entram ali.
- Uploads (ADR 0034): `UPLOAD_RULES` + `validateUpload` (magic bytes, extensão, tamanho).
- Editor (ADR 0035): `checkRichText` em `lib/domain/rich-text.ts`; imagens só de
  `article-images/<article_id>/`, `alt` obrigatório; `uploadArticleImage`.
- Código de server do admin usa import relativo (vitest e integração não resolvem `@/`).
- Páginas usam `requireAdminPage()`. Sem `service_role` no admin (se a spec exigir, perguntar).
- Deps pré-autorizadas no admin: `@tiptap/*`, `pdf-lib`, `@react-pdf/renderer`, `file-type`.
- Rotas: `/artigos`, `/artigos/novo`, `/artigos/[id]`, `/artigos/[id]/leads`, `/leads`.
- Lista: "Excluir" + `Dialog` entram na F6-010. F6-012: copiar `lead-webhook.ts` do web (ADR 0032).

## Regras do loop
- E2E: web :3100, web :3102 (build+start), admin :3101. Parar o `pnpm dev` antes.
  `tests/e2e/support/admin.ts` tem `signIn`/`signInAsAdmin`.
- Visual: `VISUAL=1 pnpm test:e2e admin-` gera app e protótipo em `tests/e2e/__visual__/`
  pelo seletor `[data-screen-label="<Tela> · <estado> · desktop|mobile"] > div`.

## Ambiente
- Nunca ler `.env*`. `pnpm test` exige Docker Desktop aberto + `pnpm exec supabase start`.

## Pendências para o Rafael
- Turnstile de teste no `apps/web/.env.local`; header de IP na StayCloud (F3-002); DPO para
  `/privacidade`; aceites manuais PUB-007/010/012; `corepack enable`; push; domínios.
- `file-type` 22 exige Node ≥ 22 (conferir a versão na StayCloud).
- CSP: o `Dialog` do Radix (react-remove-scroll) injeta `<style>` sem nonce e é bloqueado
  (web e admin); o scroll lock não aplica. O modo dev do Next também gera violações de estilo.
- Login do admin ainda sem o visual da spec (fora das F6-001 a F6-006).
