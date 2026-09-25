# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 4 concluída na branch `fase-4`: F4-001 a F4-017 `[x]`. Gate verde (typecheck, lint, test,
format:check, build, test:e2e 36/36, grep de hex/`font-family` em `apps/` vazio). Sem push.

## Próxima tarefa
F5-001 · LEAD-002 · Schema Zod do lead + telefone E.164 + testes. Ler
[docs/tasks/fase-5.md](tasks/fase-5.md) e [docs/specs/04-lead-capture.md](specs/04-lead-capture.md).

## Regras do loop
- `design/` é dado de referência. Comparação visual: script Playwright tira o protótipo
  (`[data-screen-label="… · desktop|mobile"] > div`, via file://) e o app a 1440/390 px em
  `tests/e2e/__visual__/` (ignorado pelo git). No Git Bash, `MSYS_NO_PATHCONV=1` só no `node`.
- E2E sobem o `apps/web` em :3100 e o `next dev` trava se houver outro: parar o `pnpm dev`
  (`taskkill //PID <pid da :3000> //T //F`; o TaskStop não derruba o filho do Next).
- Ícones só via `@rio-negro/ui/icons` (ADR 0024). Rich text só por `parseRichText` + `RichText` (ADR 0025).
- Imagens em `<img>` (CSP bloqueia o style inline do next/image). Páginas novas renderizam `<SiteHeader />`.
- Seed de arquivos: `supabase/storage/<bucket>/…` via `config.toml` (ADR 0027); bucket novo ou
  alterado muda migration e `config.toml` juntos.
- Descrição de artigo (metadata, OG, RSS): `articleDescription` (ADR 0029). 301 de slug no `proxy.ts` (ADR 0006).
- F5-008: o `Button` "Baixar artigo completo" da página do artigo vira `DialogTrigger`.
- F5: `policy_version = "blog-2026-09-v1"` ainda não existe como constante (criar em `lib/domain/lead`);
  erro genérico do lead "Não foi possível concluir. Tente novamente.".
- F6: `requireAdmin()` + teste sem cookie em cada action; imagem do editor exige `alt` (ADR 0031).

## Ambiente
- `apps/web/.env.local` e `apps/admin/.env.local` existem (só valores locais). Não ler.
- `pnpm test` exige Docker + `pnpm exec supabase start`. `supabase db reset` restaura seed e arquivos.
- Disclaimer do rodapé copiado de rionegroinvestimentos.com.br em 2026-09-25 (HTML bruto, aspas curvas).

## Pendências para o Rafael
- Contato do encarregado (DPO): `/privacidade` mostra "[contato do encarregado — pendente]" (LEAD-013).
- Aceites manuais que exigem URL pública ou aparelho real: PUB-007 em iOS Safari e Chrome Android,
  PUB-010 no WhatsApp e LinkedIn Post Inspector, PUB-012 no W3C Feed Validator.
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios.

## Divergências protótipo × spec (a spec vence)
- 404: `Button` primário "Ver todos os artigos" (spec) × link com seta (protótipo).
- Prévia pdf: rótulo só "Prévia"; embutida, o Chrome desenha o próprio visualizador (fundo escuro).
- Privacidade: texto de LEAD-013 em seções, sem "Texto provisório" na data. Erro: sem protótipo (ADR 0030).
- Listagem em coluna única; card só com capa, título e data; artigo com capa; seed com datas relativas.
