# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 3 (fundação) na branch `fase-3` (local, sem push). Supabase local (CLI 2.117 via `pnpm exec`).

## Concluídas na fase 3
F3-001, F3-003 a F3-008, F3-010, F3-011, F3-016, F3-018, F3-019, F3-024.
Todas as tabelas com RLS ligado e **sem políticas** (acesso negado por padrão até a F3-012+).

## Última tarefa concluída
F3-011 · DATA-008 (`pnpm db:types`, `packages/db/src/types.gen.ts`, seed com 3 artigos).

## Próxima tarefa
F3-009 (seed do admin, após a resposta abaixo), depois F3-012 · RLS-001 em diante.

## Bloqueios e perguntas abertas
- F3-009 aberta: a migration `admin_users` existe, mas o seed do admin local precisa de e-mail
  e senha para a conta em `auth.users`, e a spec não define. Precisa do Rafael.
- Lacunas da spec resolvidas por convenção (confirmar ou virar ADR):
  `created_at`/`updated_at` com default `now()`; `leads.id` com `gen_random_uuid()`;
  `leads.webhook_status` e `article_slug_history.article_id` como `not null`;
  `consume_rate_limit(key text, "limit" int, "window" interval)` com janela fixa (`date_bin`);
  limites dos buckets em MiB (2 MiB e 20 MiB): a revalidação da ADM-006 deve usar o mesmo número.
- `corepack enable` como admin (o Turbo precisa do `pnpm` no PATH). Push da `fase-3`.
- Standalone não copia `.next/static` (F3-002). Domínios de produção; contato do DPO (F7-006).

## Revisar primeiro (ordem de risco)
1. `supabase/migrations/*_article_contents.sql`: constraint triggers adiadas (1:1 e `body_json`),
   `security definer` com EXECUTE revogado de anon/authenticated.
2. `*_article_slug_history.sql`: triggers `security definer` que gravam e removem o histórico.
3. `*_lead_rate_limits.sql`: semântica de `consume_rate_limit` e EXECUTE só para o service role.
4. `*_storage_buckets.sql`: limites e MIME criados por migration (valem em produção).

## Ler na próxima sessão
- [docs/tasks/fase-3.md](tasks/fase-3.md), [docs/specs/02-security-rls.md](specs/02-security-rls.md) (RLS-001 a RLS-004)
- [docs/specs/01-data-model.md](specs/01-data-model.md), [ADR 0014](adr/0014-admin-allowlist.md)
