// PUB-010 · PUB-012 · ADR 0046: título do artigo numa linha só (aba do navegador, Open Graph e
// RSS). Na página o subtítulo é a segunda linha; aqui entra depois de dois-pontos.

type Titled = { title: string; subtitle: string | null }

export function articleFullTitle(article: Titled): string {
  const subtitle = article.subtitle?.trim()
  return subtitle ? `${article.title}: ${subtitle}` : article.title
}
