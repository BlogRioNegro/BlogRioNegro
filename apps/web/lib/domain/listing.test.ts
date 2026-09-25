import { describe, expect, it } from 'vitest'
import { ARTICLES_PER_LOT, FEATURED_RANGE, lotRange, splitLot } from './listing'

describe('lotRange', () => {
  it('o 1º lote começa depois do destaque e pede um artigo a mais', () => {
    expect(lotRange(1)).toEqual({ from: 1, to: 11 })
  })

  it('lotes seguintes não se sobrepõem nem incluem o destaque', () => {
    expect(lotRange(2)).toEqual({ from: 11, to: 21 })
    expect(lotRange(3)).toEqual({ from: 21, to: 31 })
    expect(lotRange(2).from).toBeGreaterThan(FEATURED_RANGE.to)
  })
})

describe('splitLot', () => {
  const rows = (count: number) => Array.from({ length: count }, (_, index) => index)

  it('com o artigo extra, corta em 10 e indica que há mais', () => {
    expect(splitLot(rows(ARTICLES_PER_LOT + 1))).toEqual({
      articles: rows(ARTICLES_PER_LOT),
      hasMore: true,
    })
  })

  it('sem o artigo extra, é o último lote', () => {
    expect(splitLot(rows(ARTICLES_PER_LOT))).toEqual({
      articles: rows(ARTICLES_PER_LOT),
      hasMore: false,
    })
    expect(splitLot([])).toEqual({ articles: [], hasMore: false })
  })
})
