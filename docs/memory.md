# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 5 na branch `fase-5` (criada da `fase-4`): F5-001 a F5-004 `[x]`. typecheck, lint, test e format:check verdes. Sem push.

## Próxima tarefa
F5-005 · LEAD-008 · teste de integração da persistência (depois F5-006 e F5-007, sem UI).
A orquestração (`lib/services/article-download.ts`), `insertLead`/`createDownloadUrl` (`lib/services/leads.ts`)
e a action (`app/artigos/[slug]/actions.ts`) já existem; o insert grava `webhook_status: disabled` até a F5-007.
Ler [docs/tasks/fase-5.md](tasks/fase-5.md) e [docs/specs/04-lead-capture.md](specs/04-lead-capture.md).

## Plano combinado para F5-004 a F5-007
- Orquestração em `lib/services/article-download.ts`, recebendo `{ ip, schedule }` (a action passa
  `clientIp(await headers())` e o `after` do Next) para testar sem o runtime do Next.
- Ordem: Zod (`leadSchema`) → `verifyTurnstile` → `consumeLeadRateLimits` → artigo existe →
  insert (service role) → URL assinada de 60 s (`download: true`) → agendar webhook.
- Erro genérico do lead: "Não foi possível concluir. Tente novamente." (spec 04), diferente do
  `GENERIC_ERROR_MESSAGE` atual: dar ao `failAction` uma mensagem opcional. Rate limit: `RATE_LIMIT_MESSAGE`.
- Logar só `code`/`message` de erro do PostgREST: o `details` traz a linha com dados pessoais.
- Webhook (decisão 2): `lib/services/lead-webhook.ts`, copiado para o admin na F6-012. Vetor fixo
  (secret, timestamp, body → assinatura) num fixture usado pelos testes dos dois apps. Registrar na
  ADR 0032 e na nota da ADM-014. URL e secret por parâmetro para testar com servidor HTTP local
  (o env exige https). Timeout 5 s por parâmetro (teste com valor curto).
- Se a etapa 6 falhar após o insert: decidir se o webhook ainda é agendado (lead fica `pending`).

## Regras do loop
- Env do web nos testes de integração: `stubWebEnv()` em `tests/integration/support/web-env.ts`.
- E2E sobem o `apps/web` em :3100; parar o `pnpm dev` antes (`taskkill //PID <pid da :3000> //T //F`).
- Ícones via `@rio-negro/ui/icons` (ADR 0024). Rich text só por `parseRichText` + `RichText` (ADR 0025).
- F5-008: o `Button` "Baixar artigo completo" da página do artigo vira `DialogTrigger`.
- F6: `requireAdmin()` + teste sem cookie em cada action; imagem do editor exige `alt` (ADR 0031).

## Ambiente
- `.env.local` e `.env.example` não podem ser lidos (regra de deny `.env*`, inclusive `grep -c`).
- `pnpm test` exige Docker + `pnpm exec supabase start`. `supabase db reset` restaura seed e arquivos.

## Pendências para o Rafael
- Confirmar que `apps/web/.env.local` usa as chaves de TESTE do Turnstile (site
  `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`); não foi possível
  verificar sem ler o arquivo, e as variáveis já existem (não foram duplicadas).
- Confirmar o header de IP confiável na StayCloud (F3-002); hoje: 1º `x-forwarded-for`, `x-real-ip`, "unknown".
- Contato do encarregado (DPO) para `/privacidade`.
- Aceites manuais com URL pública: PUB-007 (iOS/Android), PUB-010 (WhatsApp/LinkedIn), PUB-012 (W3C).
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios.
