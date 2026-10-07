// ADR 0047 · "Voltar" do cabeçalho: para onde ir quando não há tela anterior dentro do blog, e a
// trilha das telas visitadas nesta visita (só em memória).

/** Destino de reserva, um nível acima: do artigo para a lista; das demais páginas para a home. */
export function backFallback(pathname: string): string {
  return /^\/artigos\/[^/]+/.test(pathname) ? '/artigos' : '/'
}

/**
 * Trilha depois de uma mudança de rota. `viaHistory` diz que a mudança veio do histórico do
 * navegador (voltar ou avançar): se o destino é a tela anterior da trilha, foi um "voltar".
 */
export function nextTrail(
  trail: readonly string[],
  pathname: string,
  viaHistory: boolean,
): string[] {
  if (trail.at(-1) === pathname) return [...trail]
  if (viaHistory && trail.at(-2) === pathname) return trail.slice(0, -1)
  return [...trail, pathname]
}

/** Há tela anterior dentro do blog: a página atual não foi a primeira aberta. */
export function canGoBack(trail: readonly string[]): boolean {
  return trail.length > 1
}
