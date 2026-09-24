# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 3 (fundação) na branch `fase-3` (local, sem push). Supabase local via `pnpm exec supabase` (Docker).

## Concluídas na fase 3
F3-001, F3-003 a F3-019 (exceto F3-002), F3-024. Faltam F3-002, F3-020 a F3-023.
- Políticas de RLS (tabelas e Storage) conforme a matriz da RLS-003/RLS-004, com testes de
  integração (`pnpm test:integration`, 35 testes) contra o Supabase local.
- [ADR 0022](adr/0022-convencoes-do-schema.md): convenções do schema (defaults, nulidade,
  `consume_rate_limit`, limites em MiB com constante única na ADM-006).

## Admin local
`admin@rionegro.local`; a senha de dev está no comentário e no insert de `supabase/seed.sql`
(também em `tests/integration/support/clients.ts`). Vale só no Supabase local.

## Próxima tarefa
F3-020 · ADM-001 (login com `@supabase/ssr`), depois F3-021, F3-023 e o Playwright da F3-022.

## Bloqueios e perguntas abertas
- F3-022 aberta: falta o Playwright (Vitest de integração já está pronto).
- F6: o admin não consegue criar artigo por chamadas REST separadas (a checagem 1:1 da F3-005
  roda no commit). A ADM de criação precisa de `save_article` (RPC transacional), já previsto na DATA-002.
- `corepack enable` como admin (o Turbo precisa do `pnpm` no PATH). Push da `fase-3`.
- Standalone não copia `.next/static` (F3-002). Domínios de produção; contato do DPO (F7-006).

## Revisar primeiro (ordem de risco)
1. `supabase/migrations/*_table_policies.sql`: políticas + `revoke`/`grant` de coluna em `leads`
   (admin só altera `webhook_*`) e `revoke all` em `lead_rate_limits`.
2. `supabase/migrations/*_storage_policies.sql`: `article-files` só admin; escrita só admin.
3. `tests/integration/rls-matrix.test.ts` e `storage-policies.test.ts`: cobertura da matriz.
4. `supabase/config.toml`: `[auth.email] enable_signup` voltou a `true` (senão o login por e-mail
   é desligado); o signup continua bloqueado por `[auth] enable_signup = false`.

## Ler na próxima sessão
- [docs/tasks/fase-3.md](tasks/fase-3.md), [docs/specs/05-admin-panel.md](specs/05-admin-panel.md) (ADM-001, ADM-002)
- [docs/specs/02-security-rls.md](specs/02-security-rls.md) (SEC-005), [ADR 0014](adr/0014-admin-allowlist.md)
