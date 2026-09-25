# Memory · estado atual

_Sobrescrever inteiro ao fim de cada sessão. Máx. ~40 linhas. Sem histórico._

## Fase
Fase 7 na branch `fase-7` (criada da `fase-6`). Revisão concluída; aguardando o Rafael decidir as
correções de `docs/revisao-final.md`. F7-001, F7-003 e F7-004 `[x]`. Sem push.

## Próxima tarefa
Aguardar a decisão do Rafael sobre quais achados corrigir (cada correção vira task e commit
próprios). Depois, as tarefas de produção: F7-002, F7-005 a F7-009.

## Resultado da revisão (`docs/revisao-final.md`)
- 0 crítico, 0 alto, 2 médios, 9 baixos; nenhum bloqueia o deploy. Veredito: pronto para deploy,
  condicionado ao SEC-1 no 1º deploy e às tarefas de produção.
- Médios: QA-1 (`StyleNonce` troca o nonce após navegação por Server Action; o 1º Dialog depois
  do login viola a CSP) e SEC-1 (IP do `X-Forwarded-For` falsificável se o proxy não sobrescrever).
- Baixos: SEC-2 (nome em `details` do log; nome de 1 emoji passa no Zod e falha no CHECK), SEC-3
  (`X-Powered-By`), SEC-4 (sem HSTS), SEC-5 (`[auth.email] enable_signup = true`, sem teste de
  signUp), SEC-6 (Turnstile sem `hostname`), SEC-7 (login do admin sem limite próprio), QA-2
  (sonda `eval` do Zod), QA-3 (imagens órfãs do editor), QA-4 (seed sem PDFs completos).
- Matriz RLS-*/SEC-* toda ✅; `.env.example` não verificado (regra de não ler `.env*`).
- A11Y: `A11Y=1 pnpm test:e2e a11y` → 22 cenários, 0 violações (sanidade do axe confirmada).

## Regras do loop
- A skill `security-review` exige `origin/HEAD`; sem remote, a revisão do diff foi manual.
- Build de produção para QA: `pnpm build`; web `next start --port 3200`, admin `--port 3201`.
  E2E: web :3100/:3102, admin :3101; parar servidores antes.
- Scripts de investigação ficam no scratchpad da sessão, nunca no repo.
- Nunca ler `.env*`. `pnpm test` exige Docker + `pnpm exec supabase start`.

## Pendências para o Rafael
- Decidir as correções da revisão (sugestão de ordem: QA-1, SEC-1, SEC-2).
- ADR 0039: reenvio de lead de artigo excluído manda `article.id = null`; confirmar com o CRM.
- Deploy Pro: validar se o install do pnpm roda na raiz do monorepo; se falhar, VPS.
- F3-002: confirmar em qual header o Deploy entrega o IP real do visitante (SEC-1).
- Comando de start no Deploy Pro: `node .next/standalone/server.js` (`next start` avisa).
- Turnstile de teste no `.env.local`; DPO; aceites PUB-007/010/012; `corepack enable`; domínios.
