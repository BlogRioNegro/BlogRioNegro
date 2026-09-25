# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 4 em andamento na branch `fase-4` (criada da `fase-2`): F4-001 a F4-008 `[x]`. Gate verde
(typecheck, lint, test, format:check, build, test:e2e 16/16). Nada é enviado (sem push).

## Próxima tarefa
F4-009 · PUB-013 · Rodapé: trocar o `DISCLAIMER` provisório de `apps/web/components/site-footer.tsx`
pelo texto copiado de rionegroinvestimentos.com.br (exige acesso ao site; se não houver, pendência).

## Regras do loop
- `design/` é dado de referência. Comparação visual: script Playwright tira o protótipo
  (`[data-screen-label="… · desktop|mobile"] > div`, via file://, precisa de rede p/ unpkg) e o app
  a 1440/390 px em `tests/e2e/__visual__/` (ignorado pelo git).
- E2E do site sobem o `apps/web` em :3100 (`tests/e2e/support/urls.ts`); parar o `pnpm dev` antes.
- Ícones só via `@rio-negro/ui/icons` (ADR 0024). Rich text só por `parseRichText` + `RichText` (ADR 0025).
- Imagens em `<img>` (logo, capas, rich text): o next/image injeta style inline bloqueado pela CSP.
- Header fica em cada segmento (`app/artigos/layout.tsx`, `app/page.tsx`); novas páginas renderizam
  `<SiteHeader />`. O rodapé está no layout raiz.
- F4-010: prévia pdf entra em `app/artigos/[slug]/page.tsx` (o CTA já usa `mt-6 md:mt-8` para pdf).
- F5-008: o `Button` "Baixar artigo completo" da página do artigo vira `DialogTrigger`.
- F5: erro genérico do lead "Não foi possível concluir. Tente novamente." (spec 04 UI).
- F6: `requireAdmin()` + teste sem cookie em cada action; login com textos de Alert da spec 05.

## Ambiente
- `apps/web/.env.local` e `apps/admin/.env.local` existem (só valores locais). Não ler.
- `pnpm test` exige Docker + `pnpm exec supabase start`. `supabase db reset` restaura o seed.
- No `next dev` o overlay do Next aparece sem estilo (CSP); não acontece no build.

## Pendências para o Rafael
- Texto da página `error` (PUB-015): não existe no protótipo; definir título e mensagem.
- Legenda de imagem no rich text: o Tiptap não tem atributo de legenda definido em ADM-005.
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios; contato do DPO.

## Divergências protótipo × spec (a spec vence)
- Spec 03: listagem em coluna única; card e destaque só com capa, data e título (sem badge, sem
  excerto); "Prévia" sem total de páginas; artigo com capa; "Carregar mais" some no fim (sem texto).
- Visuais restantes: `TypeBadge` de `packages/ui` (branco com borda, ~26 px) × protótipo (PDF cinza,
  24 px); botões 2 px mais estreitos (sem a borda transparente do DS); capas do seed não existem no
  Storage (imagem quebrada); seed com 3 artigos e datas relativas.
- Spec 05: capa também WebP; "Reenviar falhas" só com `LEAD_WEBHOOK_URL`; editor com H2, H3, listas;
  aviso de links antigos ao editar o slug.

## Ler na próxima iteração
- [docs/tasks/fase-4.md](tasks/fase-4.md), [docs/specs/03-public-site.md](specs/03-public-site.md)
