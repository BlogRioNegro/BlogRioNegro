# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 5 na branch `fase-5`: F5-001 a F5-007 `[x]` (server do lead completo, sem UI). Gate verde
(typecheck, lint, test com 63 de integração, format:check, build). Sem push.

## Próxima tarefa
F5-008 · LEAD-001 · Modal com campos, máscara e Turnstile. Ler [docs/tasks/fase-5.md](tasks/fase-5.md),
[docs/specs/04-lead-capture.md](specs/04-lead-capture.md) (seção UI) e o protótipo
`design/prototipo/Modal de Lead.dc.html`.

## O que existe para a UI usar
- Action: `requestArticleDownload(input)` em `app/artigos/[slug]/actions.ts` → `{ ok, data: { url } }`
  ou `{ ok: false, error }` (genérico "Não foi possível concluir. Tente novamente." ou
  `RATE_LIMIT_MESSAGE`). Input = `LeadInput` (`articleId`, `name`, `email`, `phone`, `consent`,
  `marketingOptIn`, `turnstileToken`).
- Schema e mensagens de campo: `leadSchema`/`LEAD_MESSAGES` em `lib/domain/lead.ts` (usar no client).
- O `Button` "Baixar artigo completo" da página do artigo vira `DialogTrigger`.
- O widget do Turnstile precisa de `script-src`/`frame-src` já liberados na CSP (ADR 0020).

## Regras do loop
- Orquestração em `lib/services/article-download.ts` (ordem de LEAD-007; webhook agendado sempre
  que o insert der certo, ADR 0032). Logs só com eventos, ids e campos; nada de `details` do PostgREST.
- Webhook em `lib/services/lead-webhook.ts`: copiar para o admin na F6-012 e testar com o vetor
  `tests/fixtures/lead-webhook-signature.json`.
- Env do web nos testes de integração: `stubWebEnv()` (`tests/integration/support/web-env.ts`).
- E2E sobem o `apps/web` em :3100; parar o `pnpm dev` antes (`taskkill //PID <pid da :3000> //T //F`).
- F6: `requireAdmin()` + teste sem cookie em cada action; imagem do editor exige `alt` (ADR 0031).

## Ambiente
- Nunca ler `.env*` (regra de deny). `pnpm test` exige Docker Desktop aberto + `pnpm exec supabase start`.

## Pendências para o Rafael
- Conferir no `apps/web/.env.local` as chaves de TESTE do Turnstile (site `1x00000000000000000000AA`,
  secret `1x0000000000000000000000000000000AA`).
- Confirmar o header de IP confiável na StayCloud (F3-002); hoje: 1º `x-forwarded-for`, `x-real-ip`, "unknown".
- Contato do encarregado (DPO) para `/privacidade`.
- Aceites manuais com URL pública: PUB-007 (iOS/Android), PUB-010 (WhatsApp/LinkedIn), PUB-012 (W3C).
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios.
