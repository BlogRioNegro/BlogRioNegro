# 0047 · "Voltar" no cabeçalho do blog

- Status: accepted · Data: 2026-10-07
- Specs: [03 · UI · Estrutura comum](../specs/03-public-site.md)

## Contexto
Da lista de artigos só se voltava à página inicial pela logo. A primeira tentativa, no mesmo dia,
pôs um botão "Voltar" no conteúdo (na linha do título da lista e na linha da data do artigo); o
cliente preferiu não mexer nas páginas e usar o menu do cabeçalho.

## Decisão
- **Menu do cabeçalho**: na home o item é "Artigos" → `/artigos`. Em todas as outras páginas (lista,
  artigo, privacidade, 404 e erro) o item é "Voltar", na mesma posição e com o mesmo estilo de
  texto (fonte, peso, maiúsculas, cor e hover). Sem seta, fundo ou contorno, e sem o sublinhado de
  página ativa: "Voltar" não é uma página. O item "Artigos" deixa de ter `aria-current`, porque só
  aparece na home.
- **Destino de reserva**: "Voltar" é um `next/link` para o nível acima (`backFallback`): do artigo
  para `/artigos`, das demais páginas para `/`. Funciona sem JavaScript e para quem abriu a página
  direto por um link externo.
- **Com JavaScript**: se a pessoa já navegou dentro do blog nesta visita, o clique chama
  `router.back()`. A trilha de telas (`nextTrail`) fica numa variável de módulo, alimentada pelo
  `NavigationTrail` no layout raiz: um push empilha, um voltar pelo histórico desempilha. Nada de
  `localStorage`, `sessionStorage` ou cookie: recarregar a página zera a trilha.
- Ctrl/Cmd, Shift ou Alt + clique e o botão do meio seguem o link normal (destino de reserva).
- **Acessibilidade**: `aria-label` "Voltar para a página anterior" (começa pelo texto visível),
  área de toque de 44 px e o foco visível global.
- As páginas da lista e do artigo ficam como antes: o link "Todos os artigos" e a data ao lado do
  `TypeBadge` (ADR 0026) continuam. O cabeçalho do admin não muda.

## Consequências
- A regra da trilha é função pura em `lib/domain/back-navigation.ts`, com teste; o componente
  client (`components/back-link.tsx`) só liga a rota e o clique.
- Depois de recarregar a página, "Voltar" usa o destino de reserva mesmo que o navegador ainda
  tenha histórico do blog.
- Na página do artigo há dois caminhos para a lista: "Voltar" no menu e "Todos os artigos".
