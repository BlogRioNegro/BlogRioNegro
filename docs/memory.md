# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 3 (fundação) **fechada, exceto a F3-002** (spike StayCloud). Branch `fase-3`, local, sem push.

## Estado
- Admin: login/logout com `@supabase/ssr` (cookie httpOnly), `proxy.ts` renova a sessão e
  redireciona para `/login` mantendo a CSP com nonce, `requireAdmin()` em `apps/admin/lib/services`.
- Testes: `pnpm test` (Vitest nos apps + integração), `pnpm test:integration`, `pnpm test:e2e`
  (Playwright/Chromium, admin em :3101). Todos exigem o Supabase local rodando.
- Admin local: `admin@rionegro.local`; a senha de dev está em `supabase/seed.sql`.

## Regra para a fase 6 (decisão do Rafael)
- Toda Server Action e route handler do admin começa com `const auth = await requireAdmin()`.
  O teste `apps/admin/lib/services/require-admin-usage.test.ts` falha se faltar (exceção: login/logout).
- Cada action real ganha também o **próprio teste sem cookie** (erro de autorização e nenhum
  dado alterado), no molde de `tests/integration/admin-action-without-session.test.ts`.
- Criação de artigo exige `save_article` (RPC transacional): o 1:1 da F3-005 é checado no commit.

## Próxima tarefa
F3-002 · OVW-004 (spike StayCloud, com o Rafael). Depois, fase 4.

## Bloqueios e perguntas abertas
- `apps/admin/AGENTS.md` e `apps/admin/CLAUDE.md` são gerados pelo `next dev` (Next 16) e estão
  fora do git: decidir se entram no repositório ou no `.gitignore`.
- O build agora exige o env completo (os módulos importam `env.ts`); `turbo.json` repassa as vars.
- `corepack enable` como admin; push da `fase-3`; standalone não copia `.next/static` (F3-002).
- Domínios de produção; contato do DPO (F7-006).

## Revisar primeiro (ordem de risco)
1. `apps/admin/proxy.ts`: sessão + redirect + CSP (o redirect também leva a CSP).
2. `apps/admin/lib/services/require-admin.ts` e `app/auth-actions.ts` (signOut do não-admin).
3. `apps/admin/lib/services/supabase-cookies.ts`: `httpOnly`, `secure` fora do dev, `sameSite: lax`.

## Ler na próxima sessão
- [docs/tasks/fase-3.md](tasks/fase-3.md), [docs/specs/00-overview.md](specs/00-overview.md) (OVW-004)
- [ADR 0002](adr/0002-hospedagem-staycloud.md), [ADR 0008](adr/0008-geracao-pdf.md)
