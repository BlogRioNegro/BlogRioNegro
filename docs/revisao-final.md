# Revisão final · Fase 7

Auditoria somente leitura da branch `fase-7` (a partir da `fase-6`, commit `00afb7b`), em
2026-09-25, contra o Supabase local. Nenhum código de `apps/`, `packages/` ou `supabase/` foi
alterado. Dados de exemplo nos testes e scripts são fictícios.

Tarefas: [F7-001](tasks/fase-7.md) (security review), F7-003 (QA exploratório) e F7-004
(acessibilidade).

## 1. Resumo

| Severidade | Qtde |
|---|---|
| Crítico | 0 |
| Alto | 0 |
| Médio | 1 |
| Baixo | 6 |

**Pronto para deploy: _em andamento_** (veredito final ao fim da F7-004).

## 2. Achados

Ordenados do mais grave para o menos grave. Esforço: P (< 1 h), M (meio dia), G (> 1 dia).

| ID | Sev. | Onde | Evidência | Correção sugerida | Esf. | Bloqueia? |
|---|---|---|---|---|---|---|
| SEC-1 | Médio | `apps/web/lib/domain/client-ip.ts:10` | O rate limit por IP (LEAD-006) usa o 1º valor de `X-Forwarded-For`, que o cliente controla se o proxy da hospedagem não o sobrescrever. Trocando o header a cada envio, o limite de 20/10 min por IP deixa de valer; restam o Turnstile e o limite por e-mail. Não verificado em produção: depende do header que o Deploy Pro entrega (pendência F3-002). | Ler o IP do header que o Deploy Pro garante (ou do último salto confiável) e testar isso no 1º deploy. | P | não (confirmar no deploy) |
| SEC-2 | Baixo | `apps/web/lib/domain/redact.ts:14` e `apps/web/lib/domain/lead.ts:45` | O redact mascara e-mail, telefone e IP, mas não o nome dentro do `details` do Postgres ("Failing row contains (…)"): script temporário com um erro 23514 no formato do Postgres manteve o nome em claro. O caminho é alcançável: `'😀'.length === 2` no JS (passa no `min(2)` do Zod) e `char_length = 1` no Postgres (viola o CHECK), então o insert falha e `lead.request_failed` loga o `details`. | Não logar `details` de erro do banco (só `code` e `message`) e validar o nome por code points (`[...name].length`). | P | não |
| SEC-3 | Baixo | `apps/web/next.config.ts`, `apps/admin/next.config.ts` | `X-Powered-By: Next.js` nas páginas dos dois apps (`next start`, script de headers). | `poweredByHeader: false` nos dois `next.config.ts`. | P | não |
| SEC-4 | Baixo | build de produção dos dois apps | Sem `Strict-Transport-Security` em nenhuma rota (script de headers). A CSP já tem `upgrade-insecure-requests`. | Adicionar HSTS no `next.config.ts` ou confirmar que o Deploy Pro envia. | P | não |
| SEC-5 | Baixo | `supabase/config.toml:228` | SEC-001 cumprido localmente (`POST /auth/v1/signup` → 422 `signup_disabled`), mas não há teste automatizado de `signUp`, e `[auth.email] enable_signup = true` contradiz o `[auth] enable_signup = false` que prevalece. | Pôr `false` também em `[auth.email]` e criar teste de integração do `signUp`. | P | não |
| SEC-6 | Baixo | `apps/web/lib/services/turnstile.ts:31` | O `siteverify` confere só `success`; `hostname` e `action` da resposta não são checados. | Recusar token cujo `hostname` não seja o de `NEXT_PUBLIC_SITE_URL`. | P | não |
| SEC-7 | Baixo | `apps/admin/app/auth-actions.ts:16` | O login do admin não tem limite próprio. O limite do Supabase Auth (`sign_in_sign_ups = 30`, por IP) vê o IP do servidor Next, compartilhado por todos: um atacante pode esgotar o limite e travar o login do admin. Não verificado empiricamente. | Limite por IP do cliente na action de login (mesma tabela `lead_rate_limits`, chave própria). | M | não |

## 3. Matriz RLS-* / SEC-*

| Critério | Status | Evidência |
|---|---|---|
| RLS-001 · RLS em todas as tabelas, sem `using (true)` para escrita | ✅ | `tests/integration/rls-enabled.test.ts` (3 testes verdes) |
| RLS-002 · `is_admin()` | ✅ | `tests/integration/is-admin.test.ts` (anon, autenticado comum e admin); escrita negada na matriz |
| RLS-003 · Matriz de acesso (anon, autenticado, admin) | ✅ | `tests/integration/rls-matrix.test.ts`: 18 testes cobrindo as 6 tabelas, permitido e negado; leads sem INSERT de anon nem admin. Produção fica para a F7-002 |
| RLS-004 · Storage | ✅ | `tests/integration/storage-policies.test.ts`: `article-files` 400/404 para anon, URL assinada funciona e expira, escrita só do admin em todos os buckets |
| SEC-001 · Signup desligado | ✅ local / produção na F7-008 | `POST /auth/v1/signup` local → 422 `signup_disabled`; ver SEC-5 |
| SEC-002 · Service role só no server do web | ✅ | Só `apps/web/lib/services/supabase-service-role.ts` (com `import 'server-only'`) cria o client; importado só por `leads.ts`, `rate-limit.ts` e `lead-webhook.ts` (todos `server-only`). Nenhuma referência em `apps/admin`. Varredura de `.next/static` dos dois apps: nem a chave local nem os nomes das variáveis secretas |
| SEC-003 · Env validado no boot | ✅ (exceto `.env.example`) | `lib/env.ts` + `instrumentation.ts` nos dois apps; `next start` com `LEAD_HASH_SECRET` curto (web) e `LEAD_WEBHOOK_URL` http (admin) aborta com "Variáveis de ambiente ausentes ou inválidas: …", sem o valor. `.env.example`: **não verificado** (regra: nunca ler `.env*`) |
| SEC-004 · Hash de identificadores | ✅ | `identifier-hash.test.ts`; `rate-limit.ts` usa HMAC para IP e e-mail; nenhum log com IP (lista de chamadas do logger revisada) |
| SEC-005 · Autorização em profundidade | ✅ | `require-admin-usage.test.ts` acha as 3 entradas de server (`artigos/actions.ts`, `leads/actions.ts`, `leads/exportar/route.ts`) e exige `requireAdmin()` na 1ª linha; `admin-article-actions.test.ts` chama cada uma sem cookie |
| SEC-006 · Headers de segurança | ✅ | `proxy.test.ts` dos dois apps; build de produção: CSP com nonce e `strict-dynamic`, sem `'unsafe-inline'` em script, nonce diferente em 3 requests, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`, admin com `X-Robots-Tag: noindex`. Ver SEC-3 e SEC-4 |
| SEC-007 · Renderização segura | ✅ | `apps/web/lib/domain/rich-text.test.ts` e `components/rich-text.test.tsx` (`<script>`, `javascript:`, `on*`, `rel="noopener noreferrer nofollow"`); nenhum `dangerouslySetInnerHTML` em `apps/` e `packages/` |
| SEC-008 · Erros genéricos | ✅ com ressalva | `failAction` nos dois apps devolve mensagem fixa; detalhes só no log. Ver SEC-2 (nome no log) |

### Outras verificações da F7-001

- **Skill `security-review`:** não rodou. Ela exige `origin/HEAD`, e o repositório não tem remote.
  O diff `main...fase-7` (417 arquivos) foi revisado à mão nos pontos de entrada: Server Actions,
  route handler, `proxy.ts`, upload, Turnstile, rate limit, webhook, CSV e renderer.
- **`pnpm audit --prod`:** "No known vulnerabilities found".
- **Segredos no histórico:** `git log -p --all`, excluindo `.env*` e o lockfile, buscando JWT,
  `sb_secret_`, `sb_publishable_`, `SUPABASE_SERVICE_ROLE_KEY=` e chaves privadas: nenhuma
  ocorrência. Os únicos `.env*` versionados são os dois `.env.example` (não lidos).
- **PII em log:** todas as chamadas de `logger`/`failAction` revisadas; o logger passa tudo por
  `redactPersonalData`. Único vazamento encontrado: SEC-2.

## 4. Fora do escopo

- **Header de IP no Deploy Pro** (SEC-1) e HSTS (SEC-4): dependem da infraestrutura da StayCloud
  (F3-002, F7-007).
- **Signup e allowlist em produção:** F7-008. **Matriz RLS em produção:** F7-002.
- **`next start` com `output: 'standalone'`:** o Next avisa que o servidor certo é
  `node .next/standalone/server.js`. Definir o comando de start no Deploy Pro (F7-007).
