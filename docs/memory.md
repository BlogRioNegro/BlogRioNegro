# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 5 concluída na branch `fase-5`: F5-001 a F5-013 `[x]`. Gate verde (typecheck, lint, test,
format:check, build, test:e2e 50 passaram + 2 visuais pulados). Sem push.

## Próxima tarefa
Fase 6 (F6-001) na branch `fase-6` (criar a partir da `fase-5`). Ler [docs/tasks/fase-6.md](tasks/fase-6.md)
e [docs/specs/05-admin-panel.md](specs/05-admin-panel.md).

## Para a fase 6
- F6-012: copiar `apps/web/lib/services/lead-webhook.ts` para o admin e testar com o vetor
  `tests/fixtures/lead-webhook-signature.json` (ADR 0032).
- `requireAdmin()` + teste sem cookie em cada action; imagem do editor exige `alt` (ADR 0031).
- `packages/ui` segue o export do DS (ADR 0028): `Button` com `aria-busy`, `Checkbox`, `Alert`,
  `DialogContent` já alinhados na F5-013.

## Regras do loop
- Lead: UI em `apps/web/components/lead-dialog.tsx` + `turnstile.tsx`; server em
  `lib/services/article-download.ts`. O iframe do Turnstile fica em shadow root fechado: E2E usam
  `page.frames()` e o input `cf-turnstile-response`.
- E2E: web em :3100 (dev), web em :3102 (`next build` + `next start`, secret do Turnstile que
  reprova) e admin em :3101. Parar o `pnpm dev` antes (`taskkill //PID <pid da :3000> //T //F`).
  Os E2E do lead precisam de rede (Turnstile de teste da Cloudflare).
- Visual: `VISUAL=1 pnpm test:e2e -g Visual` gera app e protótipo do modal em `tests/e2e/__visual__/`;
  a fase 4 usou o script do scratchpad (`[data-screen-label="… · desktop|mobile"] > div`).
- Env do web nos testes de integração: `stubWebEnv()` (`tests/integration/support/web-env.ts`).

## Ambiente
- Nunca ler `.env*`. `pnpm test` exige Docker Desktop aberto + `pnpm exec supabase start`.

## Pendências para o Rafael
- Conferir no `apps/web/.env.local` as chaves de TESTE do Turnstile.
- Confirmar o header de IP confiável na StayCloud (F3-002).
- Contato do encarregado (DPO) para `/privacidade`.
- Aceites manuais com URL pública: PUB-007 (iOS/Android), PUB-010 (WhatsApp/LinkedIn), PUB-012 (W3C).
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios.

## Divergências visuais restantes (modal)
- Widget real do Turnstile (as chaves de teste mostram "Somente para teste") no lugar do placeholder.
- Estado "Link expirado" não tem protótipo; texto registrado na spec 04 (UI · Estados).
