---
id: 06-design-system
status: pending-design
fase: 2
depends_on: [00-overview.md]
---

# 06 · Design system

Placeholder até a fase 2. O protótipo do Claude Design é **referência visual**: tokens vão para
o código via `/design-sync`; telas são reimplementadas como componentes seguindo as specs
03, 04 e 05, não copiadas.

## Requisitos

### DS-001 · Design system no Claude Design (fase 1)
Cores, tipografia, espaçamento, raio, sombras e componentes base, alinhados à identidade de
rionegroinvestimentos.com.br.
**Aceite:** design system publicado no Claude Design e aprovado pelo responsável do projeto.

### DS-002 · Protótipos (fase 1)
Home, listagem, artigo (prévia pdf e rich_text), modal de lead (todos os estados de
[04-lead-capture](04-lead-capture.md)), `/privacidade` e painel admin (login, lista, formulário, leads).
**Aceite:** cada tela listada existe no protótipo, em desktop e mobile.

### DS-003 · Tokens em `packages/ui` (fase 2)
Sincronizar tokens via `/design-sync` para `packages/ui` (CSS variables + tema Tailwind).
**Aceite:** os dois apps consomem os tokens de `@rio-negro/ui`; nenhum valor de cor ou fonte
hard-coded fora do pacote.

### DS-004 · Componentes base (fase 2)
shadcn/ui customizado com os tokens em `packages/ui`.
**Aceite:** lista de componentes registrada nesta spec; cada um com responsabilidade única.

### DS-005 · Seções de UI das specs (fase 2)
Preencher as seções "UI · pending-design" de 03, 04 e 05 e mudar `ui_status` para `approved`.
**Aceite:** nenhuma seção `pending-design` restante ao fim da fase 2.

### DS-006 · Acessibilidade
Contraste AA, foco visível, modal com foco preso e fechamento por Esc, labels em todos os campos.
**Aceite:** axe sem violações críticas nas telas da fase 4–6.

## Tokens · pending-design

## Componentes · pending-design

## Fora de escopo

- Tema escuro, animações elaboradas, ilustrações customizadas.
- Copiar código gerado pelo Claude Design para os apps.
