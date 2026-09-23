---
id: 04-lead-capture
status: approved
ui_status: pending-design
fase: 5
depends_on: [01-data-model.md, 02-security-rls.md, 03-public-site.md]
---

# 04 · Captura de lead

Fluxo: botão "Baixar artigo completo" ([PUB-005](03-public-site.md)) → modal → Server Action
→ lead persistido → URL assinada → download + tela de sucesso.

## Requisitos

### LEAD-001 · Campos do modal
Nome (2–120), e-mail, telefone brasileiro com máscara `(99) 99999-9999` / `(99) 9999-9999`,
normalizado para E.164 (`+55...`). O formulário sempre abre vazio.
**Aceite:** telefone sem DDD ou com país ≠ BR é rejeitado; e-mail é salvo em minúsculo.

### LEAD-002 · Schema Zod único
Um schema em `apps/web/lib/domain/lead` usado pelo form (client) e pela Server Action (server).
**Aceite:** a Server Action revalida tudo com o mesmo schema, mesmo que o client já tenha validado.

### LEAD-003 · Consentimento LGPD obrigatório
Aviso de coleta visível acima do botão (texto em LEAD-013), checkbox obrigatório desmarcado
por padrão, com link para `/privacidade` (nova aba).
**Aceite:** sem o checkbox o envio é bloqueado no client **e** no server.

### LEAD-004 · Opt-in de comunicações
Checkbox opcional, desmarcado: "Aceito receber novidades da Rio Negro por e-mail, telefone ou WhatsApp."
**Aceite:** gravado em `marketing_opt_in`; o download não depende dele.

### LEAD-005 · Cloudflare Turnstile
Widget no modal; token verificado no server (`siteverify`) antes de qualquer escrita.
**Aceite:** token ausente, inválido ou reutilizado → erro genérico, nenhum insert, nenhuma URL.

### LEAD-006 · Rate limit
Via `consume_rate_limit` ([DATA-005](01-data-model.md)), chaves com HMAC ([SEC-004](02-security-rls.md)):
- **20 envios por IP a cada 10 min** (tolera CGNAT de operadora móvel);
- **3 envios por e-mail a cada 10 min**.

O Turnstile é a defesa principal contra bot ([ADR 0011](../adr/0011-antispam-turnstile-rate-limit.md)).
**Aceite:** o 21º envio do mesmo IP e o 4º do mesmo e-mail na janela recebem "Muitas
tentativas, tente em alguns minutos"; a janela seguinte volta a aceitar.

### LEAD-007 · Server Action `requestArticleDownload`
Ordem obrigatória: (1) Zod → (2) Turnstile → (3) rate limit IP e e-mail → (4) artigo existe
→ (5) insert do lead → (6) URL assinada → (7) agendar webhook. Usa o client service role de
[SEC-002](02-security-rls.md). Orquestração em `lib/services`, não no componente.
**Aceite:** falha em qualquer etapa até (5) não gera URL; falha em (6) após insert retorna
erro e o lead permanece (o usuário pode tentar de novo).

### LEAD-008 · Persistência
Um registro por download, com `article_title_snapshot`, `consent_at = now()`,
`policy_version` (LEAD-013), `marketing_opt_in`, `ip_hash`
([ADR 0019](../adr/0019-lead-um-registro-por-download.md)).
**Aceite:** dois downloads da mesma pessoa geram dois registros.

### LEAD-009 · Entrega do arquivo
URL assinada de `article-files` (`full_pdf_path`) com validade de **60 s**, gerada só após o
insert confirmado. Sem e-mail ([ADR 0010](../adr/0010-entrega-url-assinada.md)).
**Aceite:** o download inicia automaticamente; a URL expira após 60 s; o path do bucket
privado nunca é enviado ao client antes do lead.

### LEAD-010 · Tela de sucesso
Após liberar o download, o modal mostra confirmação, link "Baixar novamente" (mesma URL, até
expirar) e o CTA "Conheça a Rio Negro" (`NEXT_PUBLIC_RIO_NEGRO_URL`, nova aba)
([ADR 0018](../adr/0018-cta-e-disclaimer-no-rodape.md)).
**Aceite:** o CTA só aparece no estado de sucesso.

### LEAD-011 · Sem dados pessoais no navegador
**Aceite:** nada de lead em `localStorage`, `sessionStorage`, cookies ou query string;
nenhum log do client com dados do formulário.

### LEAD-012 · Webhook para CRM
Se `LEAD_WEBHOOK_URL` estiver definida ([ADR 0015](../adr/0015-webhook-crm.md)):
- após o insert, `webhook_status = pending` e o envio roda em segundo plano (`after()`),
  sem atrasar a resposta;
- `POST` JSON `{ event: "lead.created", lead: { id, name, email, phone, marketing_opt_in,
  created_at }, article: { id, title } }`;
- headers `X-RioNegro-Timestamp` e `X-RioNegro-Signature: sha256=<HMAC(secret, timestamp + "." + body)>`;
- timeout 5 s; 2xx → `sent`; senão → `failed` + `webhook_last_error`; `webhook_attempts++`.

Sem a variável: `webhook_status = disabled`, nada é enviado. Reenvio: [ADM-014](05-admin-panel.md).
**Aceite:** com o endpoint fora do ar o download funciona e o lead fica `failed`;
teste unitário da assinatura.

### LEAD-013 · Textos LGPD — **rascunho pendente de validação (F7-006)**
`policy_version = "blog-2026-09-v1"` (constante em `lib/domain/lead`; mudar o texto exige nova versão).

**Aviso no modal:**
> Usaremos seu nome, e-mail e telefone para enviar este material e registrar seu interesse.
> Se você autorizar abaixo, também poderemos enviar novidades da Rio Negro.

**Checkbox obrigatório:** "Li e concordo com o [aviso de privacidade](/privacidade)."

**Página `/privacidade` (resumo, com link para a política completa):**
- Controlador: Rio Negro Assessoria de Investimentos Ltda., CNPJ 33.457.321/0001-79.
- Dados coletados: nome, e-mail, telefone, data/hora do aceite e identificador técnico
  anonimizado do dispositivo de rede (hash do IP) para segurança.
- Finalidades: entregar o material solicitado, contato comercial sobre investimentos e, com
  autorização, envio de novidades; prevenção de abuso.
- Base legal: consentimento (LGPD, art. 7º, I).
- Compartilhamento: operadores de infraestrutura (hospedagem e banco de dados) e o CRM da Rio Negro.
- Retenção: até o titular solicitar a exclusão ou revogar o consentimento.
- Direitos do titular (art. 18) e canal: **[contato do encarregado — pendente]**.
- Política completa: https://rionegroinvestimentos.com.br/politica-de-privacidade/

**Aceite:** textos acima implementados como conteúdo estático; marcados em código com a
versão; substituídos pelo texto validado na F7-006.

## UI · pending-design

Layout do modal, estados (idle, enviando, erro, rate limit, sucesso) e comportamento mobile
serão definidos na fase 2 ([06-design-system](06-design-system.md)).

## Fora de escopo

- Envio do material por e-mail, dupla confirmação (double opt-in).
- Lembrar o visitante ou pré-preencher o formulário.
- Fila de retry automática do webhook (reenvio é manual).
- Portal de autoatendimento do titular (pedidos vão pelo canal do encarregado).
