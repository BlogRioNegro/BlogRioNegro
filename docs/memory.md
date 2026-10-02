# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Estado
- `fase-7` mergeada na `main` (`2e0ada6`). Produção na Vercel: blog em
  https://blogrionegro.vercel.app e um projeto separado para o admin; deploy automático a cada
  push na `main`. A ADR 0038 (StayCloud) não vale mais.
- Branch `marca-oficial` (da `main`), sem push. Aplica o guia `design/marca/INFO-RN-XP.pdf`.
- `1c7e2f2`: rodapé escuro e home conforme o site institucional (ADR 0042), trabalho do Rafael.
- MO-001 `9aaa4a5`: cores do guia nos tokens (`--rn-navy-900`, `--rn-gold-500`, `--rn-yellow-500`,
  `--color-divider`, `--color-highlight`, `--gradient-brand`); amarelo e degradê só como token.
- MO-002 `1c9266b`: Roboto Slab 900 (títulos), Roboto Slab 400 (subtítulos) e Roboto (resto) via
  `next/font`; `--font-weight-black`. Sem overflow a 390 px.

## Próxima tarefa
[docs/tasks/marca-oficial.md](tasks/marca-oficial.md): MO-003 (logo e favicon do PDF). Depois MO-004 (ADR e spec 06) e o gate final.

## Specs e ADRs a ler
Spec [06-design-system](specs/06-design-system.md); ADRs 0020, 0023, 0024, 0028 e 0042.

## Regras do loop
- Tokens iguais em três lugares (`packages/ui/src/tokens.test.ts`): `packages/ui/src/tokens.css` +
  `theme.css`, `design/design-system/tokens/*.css` e a tabela Tokens da spec 06.
- Hex, `rgb()` e `font-family` proibidos em `apps/`. Sem estilo inline e sem `next/image` (ADR 0020).
- Cores do guia com hex exato; tons fora do guia ficam como estão. Contraste AA obrigatório.
- Não alterar `apps/admin/lib/services/article-pdf.tsx` nem `design/prototipo/`.
- E2E: web :3100/:3102, admin :3101; parar servidores antes (`taskkill //PID <pid> //T //F`).
- Nunca push, nunca ler `.env*`, nunca editar migration, nenhuma dependência nova.
- `pnpm test` exige Docker + `pnpm exec supabase start` (parar antes o projeto
  `rio-negro-family-office`, que usa as mesmas portas).

## Pendências para o Rafael
- SEC-1 / F3-002: confirmar em qual header a Vercel entrega o IP real do visitante.
- SEC-4 (HSTS), SEC-5 (`enable_signup` em produção), SEC-6 (hostname do Turnstile).
- ADR 0039: reenvio de lead de artigo excluído manda `article.id = null`; confirmar com o CRM.
- Tokens `--color-footer-*` foram acrescentados à mão no export do Claude Design: reaplicar lá.
