---
id: 05-admin-panel
status: approved
ui_status: pending-design
fase: 6
depends_on: [01-data-model.md, 02-security-rls.md, 04-lead-capture.md, 06-design-system.md]
---

# 05 · Painel admin (`apps/admin`)

Autorização: [SEC-005](02-security-rls.md) vale para todos os requisitos abaixo.

## Autenticação

### ADM-001 · Login
E-mail e senha da conta fixa via Supabase Auth (`@supabase/ssr`, sessão em cookie httpOnly).
Sem cadastro, convite ou "esqueci a senha" (troca de senha pelo dashboard do Supabase).
**Aceite:** credencial válida de um usuário fora de `admin_users` é deslogada com
"Acesso negado"; logout limpa a sessão.

### ADM-002 · Proteção de rotas
Todas as rotas exceto `/login` exigem sessão de admin.
**Aceite:** acesso anônimo a qualquer rota redireciona para `/login`; página com `noindex`.

## Artigos

### ADM-003 · Lista de artigos
Tabela com título, tipo, data de publicação, nº de leads e ações (editar, ver leads, excluir),
ordenada por `published_at desc`.
**Aceite:** o artigo em destaque (mais recente) é sinalizado apenas como informação.

### ADM-004 · Formulário de artigo
Campos: título, slug, resumo (opcional), capa, `content_type`, conteúdo (editor **ou**
upload de PDF, conforme o tipo), data de publicação. Salvar = publicar
([ADR 0005](../adr/0005-publicacao-imediata.md)). Validação Zod no client e na Server Action.
**Aceite:** erros por campo; salvar com sucesso deixa o artigo visível no site no próximo request.

### ADM-005 · Editor rich text
Tiptap com: títulos (H2, H3), negrito, itálico, listas ordenada e não ordenada, link, citação
e imagem inline (upload para `article-images`). Sem tabelas. Salva JSON
([ADR 0009](../adr/0009-editor-tiptap.md)).
**Aceite:** colar HTML externo mantém só nós/marcas permitidos.

### ADM-006 · Uploads
Tipos e tamanhos conforme [DATA-007](01-data-model.md). MIME validado por magic bytes na
Server Action, além do limite configurado no bucket.
**Aceite:** arquivo renomeado (`.exe` → `.pdf`) é rejeitado; upload acima do limite é rejeitado.

### ADM-007 · Processamento de artigo `pdf`
Ao salvar: PDF original → `article-files`; `pdf-lib` copia as **2 primeiras páginas** para
um novo PDF → `article-previews` ([ADR 0008](../adr/0008-geracao-pdf.md)).
**Aceite:** PDF com 1 página gera prévia de 1 página; PDF protegido por senha ou corrompido
é rejeitado com mensagem clara; trocar o PDF substitui os dois arquivos e remove os antigos.

### ADM-008 · Processamento de artigo `rich_text`
Ao salvar: documento completo → `article_contents.body_json`; os **3 primeiros blocos** de
nível superior → `articles.preview_json`; PDF completo gerado com `@react-pdf/renderer`
(título, capa, conteúdo) → `article-files`.
**Aceite:** a regra de corte é função pura testada; o PDF gerado contém todo o texto e as
imagens; editar o conteúdo regenera prévia e PDF.

### ADM-009 · Slug
Gerado do título na criação (minúsculo, sem acento, hífens). **Editável** a qualquer momento.
Ao editar, o slug anterior vai para `article_slug_history` e redireciona com 301
([ADR 0006](../adr/0006-slug-editavel-historico-301.md), [DATA-003](01-data-model.md), [PUB-008](03-public-site.md)).
Editar o título **não** altera o slug.
**Aceite:** slug em uso (atual ou histórico de outro artigo) é rejeitado; o formulário
avisa que links antigos continuarão funcionando.

### ADM-010 · Data de publicação
Preenchida com agora na criação; editável (inclusive retroativa). Data futura é permitida mas
o artigo aparece imediatamente (sem agendamento).
**Aceite:** a data editada muda a ordem da listagem e o destaque.

### ADM-011 · Troca de `content_type`
Ao trocar o tipo na edição, conteúdo e arquivos do tipo anterior são removidos após salvar.
**Aceite:** nenhum arquivo órfão no Storage após a troca.

### ADM-012 · Exclusão de artigo
Confirmação explícita. Remove artigo, `article_contents`, histórico de slug e arquivos do
Storage; **leads permanecem** com `article_id = null` e `article_title_snapshot`
([ADR 0013](../adr/0013-exclusao-preserva-leads.md)).
**Aceite:** após excluir, os leads do artigo seguem na lista geral com o título original.

## Leads

### ADM-013 · Lista e exportação
- Lista por artigo e lista geral (inclui leads de artigos excluídos), ordem `created_at desc`,
  paginada.
- Exportar CSV por artigo e geral: UTF-8 com BOM, separador `;` (Excel pt-BR), colunas
  `data, artigo, nome, email, telefone, aceite_comunicacoes, status_webhook`.
- Excluir lead individual com confirmação (pedido do titular).

**Aceite:** CSV abre corretamente no Excel com acentos; CSV é gerado em route handler que
revalida admin; valores iniciados por `= + - @` são escapados (CSV injection).

### ADM-014 · Reenviar falhas do webhook
Botão "Reenviar falhas" visível só com `LEAD_WEBHOOK_URL` definida; reenvia leads `failed`
usando o mesmo payload e assinatura de [LEAD-012](04-lead-capture.md). O código de envio é
compartilhado entre web e admin (local definido em ADR na F5-007). O padrão para código de
server é duplicar por app ([ADR 0021](../adr/0021-codigo-de-server-duplicado-por-app.md)); a F5-007 reavalia só o webhook.
**Aceite:** mostra quantos foram enviados e quantos falharam; atualiza status e tentativas.

## UI · pending-design

Layout do painel, formulário, editor, tabelas e estados serão definidos na fase 2
([06-design-system](06-design-system.md)).

## Fora de escopo

- Múltiplos admins, papéis, logs de auditoria.
- Rascunho, agendamento, pré-visualização antes de salvar.
- Edição do hero da home e dos textos legais pelo painel.
- Dashboard de métricas.
