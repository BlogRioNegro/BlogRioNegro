import { describe, expect, it } from 'vitest'
import { backFallback, canGoBack, nextTrail } from './back-navigation'

describe('backFallback', () => {
  it('do artigo volta para a lista', () => {
    expect(backFallback('/artigos/renda-fixa-em-2026')).toBe('/artigos')
  })

  it.each(['/artigos', '/artigos/', '/privacidade', '/nao-existe', '/'])(
    'de %s volta para a home',
    (pathname) => {
      expect(backFallback(pathname)).toBe('/')
    },
  )
})

describe('nextTrail', () => {
  const visit = (paths: [string, boolean][]) =>
    paths.reduce<string[]>((trail, [path, viaHistory]) => nextTrail(trail, path, viaHistory), [])

  it('a primeira página aberta não tem tela anterior', () => {
    const trail = visit([['/artigos/a', false]])

    expect(trail).toEqual(['/artigos/a'])
    expect(canGoBack(trail)).toBe(false)
  })

  it('navegar por links empilha as telas', () => {
    const trail = visit([
      ['/', false],
      ['/artigos', false],
      ['/artigos/a', false],
    ])

    expect(trail).toEqual(['/', '/artigos', '/artigos/a'])
    expect(canGoBack(trail)).toBe(true)
  })

  it('voltar pelo histórico desempilha até a primeira tela', () => {
    const trail = visit([
      ['/', false],
      ['/artigos', false],
      ['/artigos/a', false],
      ['/artigos', true],
      ['/', true],
    ])

    expect(trail).toEqual(['/'])
    expect(canGoBack(trail)).toBe(false)
  })

  it('avançar pelo histórico empilha de novo', () => {
    const trail = visit([
      ['/artigos', false],
      ['/artigos/a', false],
      ['/artigos', true],
      ['/artigos/a', true],
    ])

    expect(trail).toEqual(['/artigos', '/artigos/a'])
  })

  it('link para a tela anterior é uma tela nova, não um voltar', () => {
    const trail = visit([
      ['/artigos/a', false],
      ['/artigos', false],
      ['/artigos/a', false],
    ])

    expect(trail).toEqual(['/artigos/a', '/artigos', '/artigos/a'])
  })

  it('a mesma rota de novo não muda a trilha', () => {
    expect(nextTrail(['/artigos'], '/artigos', false)).toEqual(['/artigos'])
  })
})
