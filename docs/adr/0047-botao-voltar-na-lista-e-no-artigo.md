# 0047 · Botão "Voltar" na lista e no artigo

- Status: accepted · Data: 2026-10-07
- Specs: [PUB-003, PUB-005](../specs/03-public-site.md)
- Supersedes, em parte: [0026](0026-ordem-da-pagina-do-artigo.md) (posição da data e link de voltar)

## Contexto
Da lista de artigos só se voltava à página inicial pela logo. O cliente pediu um botão "Voltar" na
lista e na página do artigo, discreto e sempre na primeira linha do conteúdo.

## Decisão
- **Lista (`/artigos`)**: H1 "Artigos" à esquerda e "Voltar" na mesma linha, à direita → `/`.
- **Artigo (`/artigos/[slug]`)**: a data de publicação sobe para a primeira linha, à esquerda, com
  "Voltar" à direita → `/artigos`; o título vem logo abaixo. O link "Todos os artigos" sai, para não
  haver dois caminhos de volta. Abaixo da capa fica só o `TypeBadge`.
- **Aparência**: `Button` `secondary` `sm` (a variante de contorno que já existia), ícone
  `ArrowLeft` e o texto "Voltar". Não é a ação principal: fica no peso de um controle secundário.
- **Implementação**: `BackButton` em `apps/web/components`, um `next/link` com `Button asChild`.
  Sem `history.back()`: funciona sem JavaScript e o destino é sempre o mesmo.
- **Acessibilidade**: `aria-label` "Voltar para a página inicial" / "Voltar para a lista de
  artigos" (começa pelo texto visível); os 36 px do `sm` ganham área de toque de 44 px por um
  pseudo-elemento; foco visível global; é o primeiro foco depois do cabeçalho.
- **Fora**: home, privacidade, 404, erro e admin.

## Consequências
- A data deixou de ficar ao lado do `TypeBadge`, abaixo da capa: a página do artigo diverge do
  protótipo nesse ponto (ADR 0026).
- A 390 px o botão continua na mesma linha, com pelo menos 16 px de folga
  (`tests/e2e/public-site.spec.ts`).
