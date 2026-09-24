# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Loop autônomo em andamento. Fase 2 (handoff do design) na branch `fase-2` (criada da `fase-3`).
Fase 3 fechada, exceto F3-002 (fora do loop). Nada é enviado (sem push).

## Última tarefa concluída
F2-002 · DS-004 · componentes base em `packages/ui` (Button, TextField, Checkbox, Alert, Dialog,
badges, Table), listados na spec 06 (paridade testada). F2-001 também concluída (ADR 0023).

## Próxima tarefa
F2-003 · DS-005 · UI da spec 03 a partir de `design/prototipo/Site Publico.dc.html`. Depois F2-004 a F2-006;
ao fim, spec 06 com `status: approved` e Acessibilidade por componente.

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
