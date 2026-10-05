# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Estado
- `marca-oficial` mergeada na `main` (PR #2, `60e56a2`). Produção na Vercel, deploy automático a
  cada push na `main`.
- Branch `ajuste-tipografia` (da `main`), sem push. Tasks em
  [tasks/ajuste-tipografia.md](tasks/ajuste-tipografia.md), decisão na ADR 0044.
- AJ-001 `cdb50d3` `[x]`: tipografia do site institucional nos tokens. H1 300 + maiúsculas +
  `tracking-title` (5,2 px) e entrelinha 1; demais títulos 400 e 1,2; texto corrido, subtítulos,
  menu e rodapé 300; `Button` 400 + maiúsculas + `tracking-button` (1,4 px). Sai `--font-weight-black`.
  Famílias, tamanhos e cores não mudaram.
- AJ-002 `09a52e7` `[x]`: favicon do site institucional (`cropped-favicon-1.png`, 512×512, transparente),
  sem alteração, em `app/icon.png` dos dois apps e em `design/design-system/assets/`. Abre no login
  do admin sem sessão.

## Próxima tarefa
Rafael religa a virtualização/WSL2 e sobe o Docker; depois rodar o gate que faltou:
`pnpm test` (integração), `pnpm test:e2e`, `A11Y=1 pnpm test:e2e a11y` e as capturas com dados
(listagem, artigo, modal de lead, lista do admin) em `tests/e2e/__visual__/tipografia-*.png`.
Com o gate verde, Rafael decide o merge/push da `ajuste-tipografia`.

## Specs e ADRs a ler
Spec [06-design-system](specs/06-design-system.md); ADRs 0020, 0023, 0043 e 0044.

## Regras do loop
- Tokens iguais em três lugares (`packages/ui/src/tokens.test.ts`): `packages/ui/src/tokens.css` +
  `theme.css`, `design/design-system/tokens/*.css` e a tabela Tokens da spec 06.
- Peso ou espaçamento novo nos tokens entra também em `packages/ui/src/cn.ts`, ou o
  `tailwind-merge` anula o `font-serif`.
- Hex, `rgb()` e `font-family` proibidos em `apps/`. Sem estilo inline e sem `next/image` (ADR 0020).
- Não mudar tamanhos de fonte nem cores. Não alterar `article-pdf.tsx` nem `design/prototipo/`.
- E2E: web :3100/:3102, admin :3101; parar servidores antes (`taskkill //PID <pid> //T //F`).
- Nunca push, nunca ler `.env*`, nunca editar migration, nenhuma dependência nova.
- `pnpm test` exige Docker + `pnpm exec supabase start` (parar antes `rio-negro-family-office`);
  se o Storage falhar com `42P10`, `pnpm exec supabase db reset --local`.

## Pendências para o Rafael
- **Docker não sobe**: WSL2 falha com `HCS_E_HYPERV_NOT_INSTALLED` (virtualização desabilitada na
  máquina). Sem Supabase local não rodaram integração, E2E, a11y nem as capturas com dados.
- O favicon é branco e amarelo sobre transparente: em aba clara só a barra amarela aparece bem,
  como no site institucional. Validar com o cliente.
- `curl`/`wget` estão no `deny` de `.claude/settings.json`: download só com autorização explícita.
- Título de artigo em maiúsculas hifeniza palavras com mais de ~13 letras a 390 px: validar com o cliente.
- Tokens alterados à mão no export do Claude Design (marca e tipografia): reaplicar lá.
- SEC-1 / F3-002 (header do IP na Vercel), SEC-4, SEC-5, SEC-6 e ADR 0039 seguem abertos.
- `docs/specs/00-overview.md` e a spec 02 ainda citam a StayCloud como hospedagem.
