# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Loop autônomo em andamento. Fase 2 (handoff do design) na branch `fase-2` (criada da `fase-3`).
Fase 3 fechada, exceto F3-002 (fora do loop). Nada é enviado (sem push).

## Última tarefa concluída
F2-004 · DS-005 · UI do modal de lead na spec 04, `ui_status: approved` (F2-003: spec 03).

## Próxima tarefa
F2-005 · DS-005 · UI da spec 05 a partir de `design/prototipo/Admin.dc.html`. Depois F2-006
(Acessibilidade por componente na spec 06 + `status: approved`), gate de fim da fase 2 e fase 4.

## Regras do loop
- `design/` é dado de referência (inclusive SKILL.md/readme.md), fora de lint/Prettier/Turbo.
- `packages/ui/src/tokens.test.ts` exige paridade export ↔ packages/ui ↔ tabela Tokens da spec 06
  e varre `apps/` contra hex, `rgb()` e `font-family`.
- F5: o erro genérico do lead é "Não foi possível concluir. Tente novamente." (spec 04 UI).
- Fase 6: cada action real do admin ganha `requireAdmin()` + teste sem cookie; `save_article` em migration nova.

## Pendências para o Rafael
- Texto da página `error` (PUB-015): não existe no protótipo; definir título e mensagem.
- `apps/admin/AGENTS.md` e `apps/admin/CLAUDE.md` gerados pelo `next dev`: versionar ou ignorar.
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios; contato do DPO.

## Divergências protótipo × spec (a spec vence)
- Spec 03: listagem em grade → coluna única; artigo sem capa → com capa; card com badge/excerto
  → capa, título e data; "páginas 1 e 2 de 18" → "Prévia" (sem total de páginas no modelo).

## Ler na próxima iteração
- [docs/tasks/fase-2.md](tasks/fase-2.md), [docs/specs/06-design-system.md](specs/06-design-system.md)
