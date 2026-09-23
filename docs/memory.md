# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 3 (fundação) parcial na branch `fase-3` (local, sem push). Sessão sem Supabase rodando.

## Concluídas
- F3-001 · OVW-001 · monorepo pnpm 12 + Turbo, Next 16, TS 5.9 strict, ESLint 9, Prettier, Vitest 5.
- F3-016 · SEC-003 · `lib/env.ts` com Zod por app; `instrumentation-node.ts` encerra com exit 1; `.env.example` por app.
- F3-019 · SEC-004 · `hashIdentifier` (HMAC-SHA256, Web Crypto) em `apps/web/lib/domain`.
- F3-024 · SEC-008 · `redactPersonalData` (domain), `logger` e `failAction`/`ActionResult` (services) no `apps/web`.

## Puladas
- F3-018 · SEC-006: a CSP no App Router exige nonce por request (`proxy.ts`, render dinâmico) ou
  `'unsafe-inline'` em `script-src`. Decisão ausente das specs/ADRs.
- Inelegíveis (Supabase, StayCloud ou dependência): F3-002 a F3-015, F3-017, F3-020 a F3-023.

## Pendências que dependem do Rafael
1. ADR da CSP (F3-018). Recomendação: nonce via `proxy.ts`, compatível com a ADR 0003.
2. Onde fica o código de server compartilhado entre os apps (logger, `failAction`, parse do env).
   Hoje está duplicado ou só no web. Precisa de ADR ou de liberação para pacote novo.
3. Specs: tamanho mínimo do `LEAD_HASH_SECRET`? `LEAD_WEBHOOK_SECRET` obrigatório quando houver URL?
4. Rodar `corepack enable` como admin: o Turbo precisa do binário `pnpm` no PATH.
5. Docker + liberar `supabase` em `.claude/settings.json` (F3-003 em diante); acesso à StayCloud (F3-002).
6. Push da branch `fase-3` (`git push` bloqueado nas settings).
7. Mantidos: domínios de produção (usar env vars); contato do DPO (F7-006).

## Revisar primeiro (ordem de risco)
1. `apps/web/lib/domain/redact.ts`: regex heurística; nome de pessoa em texto livre não é pego.
2. `apps/*/instrumentation*.ts` + `lib/env.ts`: boot com `process.exit(1)`; conferir na StayCloud.
3. `turbo.json`: cache do build desligado (symlinks do standalone), `env: NEXT_PUBLIC_*`.
   `start` usa `.next/standalone/.../server.js` sem copiar `static/` (resolver na F3-002).
4. `pnpm-workspace.yaml`: `unrs-resolver` sem build script; release age padrão do pnpm 12 mantida.
5. `eslint.config.mjs`: regras extras (`no-console`, `no-non-null-assertion`, `consistent-type-imports`).

## Próxima tarefa
F3-003 · OVW-003, quando o Supabase CLI estiver liberado. Ou F3-018, depois da ADR.

## Ler na próxima sessão
- [docs/tasks/fase-3.md](tasks/fase-3.md), [docs/specs/02-security-rls.md](specs/02-security-rls.md)
- [docs/specs/01-data-model.md](specs/01-data-model.md), [ADR 0016](adr/0016-supabase-local-e-prod.md)
