# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 6 na branch `fase-6`. F6-001 a F6-013 `[x]`. Correções feitas: WebP fora (ADR 0037), CSP
do Dialog (`StyleNonce` + `get-nonce`), hospedagem StayCloud Deploy Pro Node 22 (ADR 0038). Sem push.

## Próxima tarefa
Visual do login (F6-extra): as 3 telas `Login · padrão|e-mail ou senha inválidos|acesso negado` do
protótipo, com `packages/ui`, sem mexer em auth, action ou `proxy.ts`. Depois o gate da fase 6.

## Decisões da fase 6
- Server Action/route handler: `requireAdmin()` na 1ª linha + teste de integração sem cookie
  (`tests/integration/admin-article-actions.test.ts`); `require-admin-usage.test.ts` varre `app/`.
  `'use server'` só exporta funções async.
- Integração com sessão de admin: mock de `require-admin` devolvendo `adminClient()`.
- `save_article` (ADR 0033); uploads `UPLOAD_RULES` (ADR 0034, 0037); rich text (ADR 0035, 0036).
- Slug: `slugFromTitle`; 23505 do `save_article` = slug em uso. Troca de tipo limpa `article-images`.
- Exclusão: `ConfirmDeleteDialog` (action com `.bind`, `router.refresh`). Leads: `lib/domain/leads.ts`,
  `components/leads-view.tsx`, CSV em `app/leads/exportar`. Webhook do admin: ADR 0039.
- Server do admin com import relativo. Hex proibido em `apps/`. Sem `service_role` no admin.
- Deps autorizadas: `@tiptap/*`, `pdf-lib`, `@react-pdf/renderer`, `file-type`, `get-nonce`.

## Regras do loop
- E2E: web :3100, web :3102 (build+start), admin :3101 com `LEAD_WEBHOOK_URL=https://crm.invalid`.
  Parar o `pnpm dev` antes. `tests/e2e/support/admin.ts` tem `signIn`/`signInAsAdmin`.
- Visual: `VISUAL=1 pnpm test:e2e admin-` gera app e protótipo em `tests/e2e/__visual__/`.
- Nunca ler `.env*` (inclui `.env.example`). `pnpm test` exige Docker + `pnpm exec supabase start`.

## Pendências para o Rafael
- ADR 0039: reenvio de lead de artigo excluído manda `article.id = null`; confirmar com o CRM.
- Deploy Pro: validar no 1º deploy se o install do pnpm roda na raiz do monorepo; se falhar, VPS.
- F3-002: confirmar em qual header o Deploy entrega o IP real do visitante (app lê `X-Forwarded-For`).
- CSP: o `next dev` gera violações de estilo na carga (produção limpa).
- Leads desktop: paginação abaixo da tabela (no protótipo, dentro do card).
- Turnstile de teste no `.env.local`; DPO; aceites
  PUB-007/010/012; `corepack enable`; push; domínios.
