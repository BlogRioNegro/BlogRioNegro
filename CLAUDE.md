# Blog Rio Negro Investimentos

Blog institucional (site público + painel admin) com captura de lead.
Visão, stack e mapa de specs: [docs/specs/00-overview.md](docs/specs/00-overview.md).

## Protocolo de sessão

**Início**
1. Ler [docs/memory.md](docs/memory.md).
2. Ler **apenas** as specs e a task file listadas no memory. Não ler todas as specs.

**Durante**
- Toda decisão nova vira ADR em `docs/adr/NNNN-titulo.md` (próximo número livre).
  Se contradiz spec ou ADR existente, atualizar a spec e marcar a ADR antiga como `superseded`.
- Toda tarefa concluída é marcada `[x]` em `docs/tasks/fase-N.md`.
- Commits citam o ID da tarefa e do requisito: `feat(lead): F5-002 LEAD-006 rate limit`.

**Fim**
- Reescrever `docs/memory.md` inteiro (máx. ~40 linhas, sem histórico).

## Regras não negociáveis

- Dados de lead: validados com Zod e persistidos **só** via Server Action. O client nunca escreve no banco.
- RLS habilitado em toda tabela. Políticas em [02-security-rls.md](docs/specs/02-security-rls.md).
- `SUPABASE_SERVICE_ROLE_KEY` só em módulos com `import 'server-only'`, e só no `apps/web`.
- Conteúdo completo de artigo (texto e PDF) nunca exposto por leitura pública. Ver [ADR 0007](docs/adr/0007-conteudo-gated-previa-publica.md).
- TypeScript estrito; sem `any` sem justificativa em comentário.
- Clean code / SOLID: componentes de responsabilidade única; regra de negócio em `lib/domain` e
  acesso a dados/serviços externos em `lib/services`, nunca dentro de componentes.
- Seções `pending-design` das specs não são inventadas: aguardar a fase 2.
- Protótipo do Claude Design é referência visual; tokens entram via `/design-sync` em `packages/ui`.

## Documentação

- `docs/specs/` requisitos com ID estável (`DATA-001`, `LEAD-006`...) e critérios de aceite.
- `docs/tasks/` checklist por fase; cada tarefa referencia um requisito.
- `docs/adr/` uma decisão por arquivo.
- Nenhum arquivo duplica outro: linkar.

## Comandos

A definir na F3-001 (pnpm + Turborepo, ver [ADR 0001](docs/adr/0001-monorepo-pnpm-turborepo.md)).
