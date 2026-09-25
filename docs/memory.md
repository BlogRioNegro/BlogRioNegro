# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Loop autônomo em andamento. Fase 2 (handoff do design) na branch `fase-2` (criada da `fase-3`).
Fase 3 fechada, exceto F3-002 (fora do loop). Nada é enviado (sem push).

## Última tarefa concluída
F2-005 · DS-005 · UI do admin na spec 05, `ui_status: approved` (specs 03 e 04 também).

## Próxima tarefa
F2-006 · DS-006 · Acessibilidade por componente na spec 06 + `status: approved`; gate de fim da fase 2;
depois fase 4 (branch `fase-4` a partir da `fase-2`).

## Regras do loop
- `design/` é dado de referência (inclusive SKILL.md/readme.md), fora de lint/Prettier/Turbo.
- `packages/ui/src/tokens.test.ts` exige paridade export ↔ packages/ui ↔ tabela Tokens da spec 06
  e varre `apps/` contra hex, `rgb()` e `font-family`.
- F6: o login (F3-020) passa a usar os textos de Alert da spec 05 UI (título + descrição).
- F5: o erro genérico do lead é "Não foi possível concluir. Tente novamente." (spec 04 UI).
- Fase 6: cada action real do admin ganha `requireAdmin()` + teste sem cookie; `save_article` em migration nova.

## Pendências para o Rafael
- Texto da página `error` (PUB-015): não existe no protótipo; definir título e mensagem.
- `apps/admin/AGENTS.md` e `apps/admin/CLAUDE.md` gerados pelo `next dev`: versionar ou ignorar.
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios; contato do DPO.

## Divergências protótipo × spec (a spec vence)
- Spec 03: listagem em grade → coluna única; artigo sem capa → com capa; card com badge/excerto
  → capa, título e data; "páginas 1 e 2 de 18" → "Prévia" (sem total de páginas no modelo).
- Spec 05: capa só JPG/PNG → também WebP; "Reenviar falhas" sempre visível → só com webhook;
  editor com "Título"/"Lista" únicos → H2, H3, lista e lista numerada; aviso de links antigos no slug.

## Ler na próxima iteração
- [docs/tasks/fase-2.md](tasks/fase-2.md), [docs/specs/06-design-system.md](specs/06-design-system.md)
