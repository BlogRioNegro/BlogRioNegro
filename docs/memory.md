# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 6 na branch `fase-6` (a partir da `fase-5`). F6-001 `[x]`. Sem push.

## Próxima tarefa
F6-002 · ADM-004 · formulário de artigo + Server Action de salvar + migration `save_article`.
Ler [docs/tasks/fase-6.md](tasks/fase-6.md) e [docs/specs/05-admin-panel.md](specs/05-admin-panel.md).

## Decisões da fase 6 (valem para F6-007+)
- Toda Server Action e route handler novos: `requireAdmin()` na 1ª linha + teste de integração
  sem cookie esperando `UNAUTHORIZED_MESSAGE` (`require-admin-usage.test.ts` varre os arquivos).
- Páginas do painel usam `requireAdminPage()` (redireciona para /login) e o client dele.
- Sem `service_role` no admin; se a spec exigir, parar e perguntar.
- Dependências pré-autorizadas no admin: `@tiptap/*`, `pdf-lib`, `@react-pdf/renderer`, `file-type`.
- Imagem do rich text exige `alt`, sem legenda (ADR 0031); serializer sem `dangerouslySetInnerHTML`.
- Rotas: `/artigos` (lista), `/artigos/novo`, `/artigos/[id]` (edição), `/artigos/[id]/leads`, `/leads`.
- Lista: o botão "Excluir" + `Dialog` entram na F6-010 (a ação ainda não existe).
- F6-012: copiar `apps/web/lib/services/lead-webhook.ts` e testar com
  `tests/fixtures/lead-webhook-signature.json` (ADR 0032).

## Regras do loop
- E2E: web :3100 (dev), web :3102 (build+start), admin :3101. Parar o `pnpm dev` antes.
  `tests/e2e/support/admin.ts` tem `signIn`/`signInAsAdmin`.
- Visual: `VISUAL=1 pnpm test:e2e admin-articles` gera app e protótipo em `tests/e2e/__visual__/`
  pelo seletor `[data-screen-label="<Tela> · <estado> · desktop|mobile"] > div`.
- Env do admin nos testes de integração: `vi.stubEnv` das 4 variáveis (ver `admin-articles.test.ts`).

## Ambiente
- Nunca ler `.env*`. `pnpm test` exige Docker Desktop aberto + `pnpm exec supabase start`.

## Pendências para o Rafael
- Conferir no `apps/web/.env.local` as chaves de TESTE do Turnstile.
- Confirmar o header de IP confiável na StayCloud (F3-002).
- Contato do encarregado (DPO) para `/privacidade`.
- Aceites manuais com URL pública: PUB-007 (iOS/Android), PUB-010 (WhatsApp/LinkedIn), PUB-012 (W3C).
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios.
- Login do admin ainda sem o visual da spec (fora das F6-001 a F6-006).
