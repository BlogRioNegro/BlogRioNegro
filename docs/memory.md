# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 5 na branch `fase-5`: F5-001 a F5-010 `[x]`. typecheck, lint, test e format:check verdes. Sem push.

## Próxima tarefa
F5-011 · LEAD-010 · tela de sucesso, depois F5-012 (LEAD-011) e F5-013 (E2E + visual). Gate da fase:
`pnpm build` + `pnpm test:e2e` (todos). Ler [docs/tasks/fase-5.md](tasks/fase-5.md) e a seção UI de
[docs/specs/04-lead-capture.md](specs/04-lead-capture.md).

## Onde está a UI do lead
- `apps/web/components/lead-dialog.tsx`: `LeadDialog` (gatilho + modal) e `LeadForm`, renderizado
  só com o modal aberto (fechar desmonta e limpa o estado). Validação com `leadSchema`, foco no
  primeiro campo inválido, erro do envio em `Alert` acima do botão e reset do Turnstile.
- `apps/web/components/turnstile.tsx`: widget explícito; o iframe fica em shadow root fechado, então
  os E2E conferem `page.frames()` e o input `cf-turnstile-response`.
- Máscara: `maskPhone` em `lib/domain/phone-mask.ts`. `LEAD_ERROR_MESSAGE` em `lib/domain/lead.ts`.
- E2E em `tests/e2e/lead-capture.spec.ts` (precisa de rede para o Turnstile de teste).

## Regras do loop
- Server: orquestração em `lib/services/article-download.ts` (ADR 0032); webhook copiado para o admin na F6-012.
- E2E sobem o `apps/web` em :3100; parar o `pnpm dev` antes (`taskkill //PID <pid da :3000> //T //F`).
- Visual: script Playwright do scratchpad compara `[data-screen-label="Modal de lead · <estado> · desktop|mobile"]`.
- F6: `requireAdmin()` + teste sem cookie em cada action; imagem do editor exige `alt` (ADR 0031).

## Ambiente
- Nunca ler `.env*`. `pnpm test` exige Docker Desktop aberto + `pnpm exec supabase start`.

## Pendências para o Rafael
- Conferir no `apps/web/.env.local` as chaves de TESTE do Turnstile.
- Confirmar o header de IP confiável na StayCloud (F3-002).
- Contato do encarregado (DPO) para `/privacidade`.
- Aceites manuais com URL pública: PUB-007 (iOS/Android), PUB-010 (WhatsApp/LinkedIn), PUB-012 (W3C).
- `corepack enable` como admin; push das branches; F3-002 (StayCloud); domínios.
