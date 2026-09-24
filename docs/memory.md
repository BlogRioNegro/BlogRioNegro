# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Loop autônomo em andamento. Fase 2 (handoff do design) na branch `fase-2` (criada da `fase-3`).
Fase 3 fechada, exceto F3-002 (fora do loop). Nada é enviado (sem push).

## Última tarefa concluída
F2-001 · DS-003 · tokens do export (`design/`) em `packages/ui` (`tokens.css` + `theme.css` com
`@theme static`, paleta padrão do Tailwind zerada), fontes via `@rio-negro/ui/fonts` (next/font),
[ADR 0023](adr/0023-tokens-por-export-do-claude-design.md). F1-001 a F1-004 marcadas (export em `design/`).

## Próxima tarefa
F2-002 · DS-004 · componentes base shadcn/ui em `packages/ui`; registrar na spec 06 (Componentes).
Depois F2-003 a F2-006; ao fim, spec 06 com `status: approved`.

## Regras do loop
- `design/` é dado de referência (inclusive SKILL.md/readme.md), fora de lint/Prettier/Turbo.
- `packages/ui/src/tokens.test.ts` exige paridade export ↔ packages/ui ↔ tabela Tokens da spec 06
  e varre `apps/` contra hex, `rgb()` e `font-family`.
- Fase 6: cada action real do admin ganha `requireAdmin()` + teste sem cookie; `save_article` em migration nova.

## Pendências para o Rafael
- `apps/admin/AGENTS.md` e `apps/admin/CLAUDE.md` gerados pelo `next dev`: versionar ou ignorar.
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios; contato do DPO.

## Divergências protótipo × spec (a spec vence)
- (nenhuma ainda)

## Ler na próxima iteração
- [docs/tasks/fase-2.md](tasks/fase-2.md), [docs/specs/06-design-system.md](specs/06-design-system.md)
