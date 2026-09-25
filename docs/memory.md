# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 7 na branch `fase-7` (criada da `fase-6`), em modo somente auditoria: nada de mudança em
`apps/`, `packages/`, `supabase/` nem nos testes existentes. F7-001 `[x]`. Sem push.

## Próxima tarefa
F7-003 · OVW-005 · QA exploratório no build de produção (web e admin, 1440 e 390 px), com
scripts Playwright temporários fora do repo. Depois F7-004 (axe em `tests/e2e/a11y.spec.ts`,
só com `A11Y=1`). Achados vão para `docs/revisao-final.md` (IDs QA-n e A11Y-n).

## Estado da revisão (`docs/revisao-final.md`)
- F7-001: 0 crítico, 0 alto, 1 médio (SEC-1: IP do `X-Forwarded-For` falsificável se o proxy
  não sobrescrever), 6 baixos (SEC-2 a SEC-7). Matriz RLS-*/SEC-* toda ✅; `.env.example` não
  verificado (regra de não ler `.env*`).
- A skill `security-review` exige `origin/HEAD`; sem remote, a revisão do diff foi manual.

## Regras do loop
- Arquivos permitidos: `docs/revisao-final.md`, `docs/tasks/fase-7.md`, `docs/memory.md`,
  `tests/e2e/a11y.spec.ts`, `package.json`/lockfile raiz (só `@axe-core/playwright`).
- Scripts temporários no scratchpad da sessão, nunca no repo.
- Build de produção: `pnpm build`; web `next start --port 3200`, admin `--port 3201` (usam o
  `.env.local` sem precisar lê-lo). E2E: web :3100/:3102, admin :3101; parar servidores antes.
- Não tocar F7-002 e F7-005 a F7-009 (produção).
- Nunca ler `.env*`. `pnpm test` exige Docker + `pnpm exec supabase start`.

## Pendências para o Rafael
- ADR 0039: reenvio de lead de artigo excluído manda `article.id = null`; confirmar com o CRM.
- Deploy Pro: validar se o install do pnpm roda na raiz do monorepo; se falhar, VPS.
- F3-002: confirmar em qual header o Deploy entrega o IP real do visitante (ver SEC-1).
- Comando de start no Deploy Pro: `node .next/standalone/server.js` (`next start` avisa).
- Turnstile de teste no `.env.local`; DPO; aceites PUB-007/010/012; `corepack enable`; domínios.
