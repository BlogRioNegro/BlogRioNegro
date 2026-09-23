# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 3 (fundação) em andamento na branch `fase-3`, sessão autônoma sem Supabase rodando.

## Classificação da fase 3 nesta sessão
- ELEGÍVEIS (em ordem): F3-001, F3-016, F3-018, F3-019, F3-024
- INELEGÍVEIS:
  - F3-002: deploy na StayCloud.
  - F3-003: exige Supabase CLI (`supabase init/start`, negado em `.claude/settings.json`).
    O `.env.example` (SEC-003) entra na F3-016.
  - F3-004 a F3-015: migrations, buckets, types gerados e RLS dependem do Supabase.
  - F3-017: depende do tipo `Database` gerado na F3-011.
  - F3-020: auth com Supabase. F3-021 e F3-023: dependem da F3-020.
  - F3-022: Vitest/Playwright "contra o Supabase local" (OVW-005). Um runner Vitest mínimo
    entra na F3-001 só para cumprir a definição de pronto.

## Última tarefa concluída
F0-003 · OVW-002.

## Próxima tarefa
**F3-001** · OVW-001.

## Bloqueios e perguntas abertas
- Domínios de produção (web e admin) ainda não definidos: usar env vars.
- Contato do encarregado (DPO) da Rio Negro pendente (necessário na F7-006).
- Suporte da StayCloud a monorepo/pnpm/Node 20+ não confirmado (spike F3-002).

## Ler na próxima sessão
- [docs/tasks/fase-3.md](tasks/fase-3.md)
- [docs/specs/00-overview.md](specs/00-overview.md), [docs/specs/02-security-rls.md](specs/02-security-rls.md)
