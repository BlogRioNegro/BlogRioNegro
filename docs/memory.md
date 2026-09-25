# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 2 (handoff do design) fechada na branch `fase-2`: F2-001 a F2-006 `[x]`, specs 03/04/05
`ui_status: approved` e spec 06 `status: approved`. Gate verde (typecheck, lint, test, format:check,
build; grep de hex/`font-family` em `apps/` vazio). Fase 3 fechada, exceto F3-002. Nada é enviado (sem push).

## Próxima tarefa
F4-001 · PUB-009 · Serviço de leitura de artigos em `lib/services`. Criar a branch `fase-4` a partir da `fase-2`.

## Regras do loop
- `design/` é dado de referência (inclusive SKILL.md/readme.md), fora de lint/Prettier/Turbo.
- `packages/ui/src/tokens.test.ts` exige paridade export ↔ packages/ui ↔ tabela Tokens da spec 06
  e varre `apps/` contra hex, `rgb()` e `font-family`.
- Acessibilidade: checklist por componente na spec 06 (DS-006); axe sem violações críticas nas fases 4–6.
- F6: o login (F3-020) passa a usar os textos de Alert da spec 05 UI (título + descrição).
- F5: o erro genérico do lead é "Não foi possível concluir. Tente novamente." (spec 04 UI).
- Fase 6: cada action real do admin ganha `requireAdmin()` + teste sem cookie; `save_article` em migration nova.

## Ambiente
- `pnpm test` exige Docker + `pnpm exec supabase start`; se o banco local estiver sem schema, `supabase db reset`.
- Não há `.env.local` nos apps: `pnpm build` só passa com as variáveis de `.env.example` exportadas
  (valores locais: chaves do `supabase status`, chaves de teste do Turnstile).

## Pendências para o Rafael
- Texto da página `error` (PUB-015): não existe no protótipo; definir título e mensagem.
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios; contato do DPO.

## Divergências protótipo × spec (a spec vence)
- Spec 03: listagem em grade → coluna única; artigo sem capa → com capa; card com badge/excerto
  → capa, título e data; "páginas 1 e 2 de 18" → "Prévia" (sem total de páginas no modelo).
- Spec 05: capa só JPG/PNG → também WebP; "Reenviar falhas" sempre visível → só com `LEAD_WEBHOOK_URL`;
  editor com "Título"/"Lista" únicos → H2, H3, lista e lista numerada; formulário avisa que links
  antigos continuam funcionando ao editar o slug.

## Ler na próxima iteração
- [docs/tasks/fase-4.md](tasks/fase-4.md), [docs/specs/03-public-site.md](specs/03-public-site.md)
