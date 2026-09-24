# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 3 (fundação) parcial na branch `fase-3` (local, sem push).

## Concluídas na fase 3
F3-001, F3-016, F3-018, F3-019, F3-024. Regras de segredo da SEC-003 (mínimo de 32; webhook
https com segredo obrigatório) no `env.ts` dos dois apps.

## Decisões recentes
- [ADR 0020](adr/0020-csp-com-nonce.md): CSP com nonce por request no `proxy.ts`; os layouts
  chamam `await connection()` para o render ser dinâmico (sem isso os scripts saem sem nonce).
- [ADR 0021](adr/0021-codigo-de-server-duplicado-por-app.md): código de server duplicado por app,
  sem pacote compartilhado. Logger/redact/`failAction` só entram no admin quando ele precisar.
  A F5-007 reavalia só o envio do webhook (ADM-014).

## Última tarefa concluída
F3-018 · SEC-006.

## Próxima tarefa
F3-002 · OVW-004 (spike StayCloud, com o Rafael) ou F3-003 · OVW-003 (precisa do Supabase CLI).

## Bloqueios e perguntas abertas
- F3-003 a F3-015, F3-017, F3-020 a F3-023: dependem do Supabase (Docker + liberar `supabase`
  em `.claude/settings.json`).
- `corepack enable` como admin: o Turbo precisa do binário `pnpm` no PATH.
- Standalone não copia `.next/static` (assets dão 404 no `start`): resolver na F3-002.
- Push da branch `fase-3` (`git push` bloqueado nas settings).
- Domínios de produção (usar env vars); contato do DPO (F7-006).

## Revisar primeiro (ordem de risco)
1. `apps/*/proxy.ts`: diretivas da CSP; o admin também libera o Turnstile (igual ao web).
2. `apps/*/app/layout.tsx`: `await connection()` deixa todas as rotas dinâmicas.
3. `apps/web/lib/domain/redact.ts`: regex heurística; nome em texto livre não é pego.
4. `apps/*/instrumentation*.ts`: boot com `process.exit(1)`; conferir na StayCloud.

## Ler na próxima sessão
- [docs/tasks/fase-3.md](tasks/fase-3.md), [docs/specs/00-overview.md](specs/00-overview.md) (OVW-004)
- [ADR 0002](adr/0002-hospedagem-staycloud.md), [ADR 0008](adr/0008-geracao-pdf.md)
