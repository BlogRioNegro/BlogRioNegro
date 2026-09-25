# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 6 na branch `fase-6`. F6-001 a F6-011 `[x]`. Correções feitas: WebP fora (ADR 0037), CSP
do Dialog (`StyleNonce` + `get-nonce`), hospedagem StayCloud Deploy Pro Node 22 (ADR 0038). Sem push.

## Próxima tarefa
F6-012 · ADM-014 · "Reenviar falhas": copiar `apps/web/lib/services/lead-webhook.ts` para o admin,
testar as 2 cópias com `tests/fixtures/lead-webhook-signature.json`; sem `LEAD_WEBHOOK_URL` = `disabled`.
Depois F6-013, visual do login (F6-extra) e o gate.

## Decisões da fase 6 (valem para F6-007+)
- Server Action/route handler: `requireAdmin()` na 1ª linha + teste de integração sem cookie
  (`tests/integration/admin-article-actions.test.ts`); `require-admin-usage.test.ts` varre `app/`
  (retorno com `{` inline quebra a varredura: usar alias de tipo).
- `save_article` (ADR 0033): RPC transacional sob RLS. `saveArticle` (`app/artigos/actions.ts`):
  `resolveContent` → `uploadAll` (rollback) → RPC → `staleFiles` removidos.
- Uploads (ADR 0034, 0037): `UPLOAD_RULES` + `validateUpload`; imagens só PNG/JPEG (`IMAGE_ACCEPT`).
- Slug (ADM-009): `slugFromTitle`; 23505 do `save_article` = slug em uso (`ARTICLE_MESSAGES.slugTaken`).
- Leads: `lib/domain/leads.ts` (paginação, CSV), `components/leads-view.tsx`, CSV em `app/leads/exportar`.
- Exclusão: `components/confirm-delete-dialog.tsx` (action ligada com `.bind`, `router.refresh`).
- Integração com sessão de admin: mock de `require-admin` devolvendo `adminClient()`
  (`tests/integration/admin-content-type-switch.test.ts`).
- Editor (ADR 0035): `checkRichText`, imagens só de `article-images/<article_id>/`, `alt` obrigatório.
- Rich text (ADR 0036): `richTextPreview` + `renderArticlePdf`, PDF regenerado a cada save.
- Server do admin com import relativo (vitest/integração não resolvem `@/`). Hex proibido em `apps/`.
- Páginas usam `requireAdminPage()`. Sem `service_role` no admin (se a spec exigir, perguntar).
- Deps autorizadas: `@tiptap/*`, `pdf-lib`, `@react-pdf/renderer`, `file-type`, `get-nonce`.
- F6-012: copiar `lead-webhook.ts` do web (ADR 0032), vetor `tests/fixtures/lead-webhook-signature.json`.

## Regras do loop
- E2E: web :3100, web :3102 (build+start), admin :3101. Parar o `pnpm dev` antes.
  `tests/e2e/support/admin.ts` tem `signIn`/`signInAsAdmin`.
- Visual: `VISUAL=1 pnpm test:e2e admin-` gera app e protótipo em `tests/e2e/__visual__/`.

## Ambiente
- Nunca ler `.env*`. `pnpm test` exige Docker Desktop aberto + `pnpm exec supabase start`.

## Pendências para o Rafael
- CSP: o modo dev do Next (`next dev`) gera violações de estilo na carga (produção limpa).
- F3-002: confirmar em qual header o Deploy entrega o IP real do visitante (o app lê o 1º valor de
  `X-Forwarded-For`).
- Deploy Pro: validar no 1º deploy se o install do pnpm roda na raiz do monorepo; se falhar, fallback VPS.
- Leads: no desktop a paginação fica abaixo da tabela (no protótipo, dentro do card). Divergência visual pequena.
- Login do admin sem o visual da spec (F6-extra, antes do gate). Turnstile de teste no
  `.env.local`; header de IP (F3-002); DPO; aceites PUB-007/010/012; `corepack enable`; push; domínios.
