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
- MO-003 `6608c9f`: logos (escura 1024×169, branca 906×153) e favicon `app/icon.png` (512×512) nos dois
  apps, recortados do PDF; `/icon.png` é público no proxy do admin.
- MO-004 `a76f138`: ADR 0043 (marca oficial; 0038 superseded) e spec 06.

## Próxima tarefa
Marca oficial pronta: MO-001 a MO-004 `[x]` e gate verde em 2026-10-02 (`pnpm test` 378 + 90 de
integração, `pnpm build`, `pnpm test:e2e` 73, a11y 22). Próximo: Rafael revisa as capturas
`tests/e2e/__visual__/marca-*.png` (não versionadas) e decide o merge/push da `marca-oficial`.

## Specs e ADRs a ler
Spec [06-design-system](specs/06-design-system.md); ADRs 0020, 0023, 0024, 0028, 0042 e 0043.

## Regras do loop
- Tokens iguais em três lugares (`packages/ui/src/tokens.test.ts`): `packages/ui/src/tokens.css` +
  `theme.css`, `design/design-system/tokens/*.css` e a tabela Tokens da spec 06.
- Hex, `rgb()` e `font-family` proibidos em `apps/`. Sem estilo inline e sem `next/image` (ADR 0020).
- Cores do guia com hex exato; tons fora do guia ficam como estão. Contraste AA obrigatório.
- Não alterar `apps/admin/lib/services/article-pdf.tsx` nem `design/prototipo/`.
- E2E: web :3100/:3102, admin :3101; parar servidores antes (`taskkill //PID <pid> //T //F`).
- Nunca push, nunca ler `.env*`, nunca editar migration, nenhuma dependência nova.
- Se o Storage local falhar com `42P10` após `supabase start`, rodar `pnpm exec supabase db reset`.
- `pnpm test` exige Docker + `pnpm exec supabase start` (parar antes o projeto
  `rio-negro-family-office`, que usa as mesmas portas).

## Pendências para o Rafael
- SEC-1 / F3-002: confirmar em qual header a Vercel entrega o IP real do visitante.
- SEC-4 (HSTS), SEC-5 (`enable_signup` em produção), SEC-6 (hostname do Turnstile).
- ADR 0039: reenvio de lead de artigo excluído manda `article.id = null`; confirmar com o CRM.
- Tokens da marca e `--color-footer-*` foram acrescentados à mão no export do Claude Design: reaplicar lá.
- `docs/specs/00-overview.md` e a spec 02 ainda citam a StayCloud como hospedagem: atualizar para Vercel.
