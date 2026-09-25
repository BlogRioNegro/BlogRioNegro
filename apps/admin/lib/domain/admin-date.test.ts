import { describe, expect, it } from 'vitest'
import { dateInputValue, formatDate, publishedAtFromDate } from './admin-date'

describe('formatDate', () => {
  it('formata em dd/mm/aaaa', () => {
    expect(formatDate('2026-09-22T15:00:00Z')).toBe('22/09/2026')
  })

  it('usa o fuso de Brasília na virada do dia', () => {
    expect(formatDate('2026-09-23T02:00:00Z')).toBe('22/09/2026')
  })
})

describe('dateInputValue', () => {
  it('devolve aaaa-mm-dd no dia de Brasília', () => {
    expect(dateInputValue(new Date('2026-09-23T02:00:00Z'))).toBe('2026-09-22')
  })
})

describe('publishedAtFromDate', () => {
  const now = new Date('2026-09-25T17:30:15Z')

  it('na criação, usa o dia escolhido com o horário de agora', () => {
    expect(publishedAtFromDate('2026-09-25', null, now)).toBe('2026-09-25T17:30:15.000Z')
  })

  it('aceita data retroativa ou futura', () => {
    expect(publishedAtFromDate('2026-01-10', null, now)).toBe('2026-01-10T17:30:15.000Z')
    expect(publishedAtFromDate('2027-03-01', null, now)).toBe('2027-03-01T17:30:15.000Z')
  })

  it('mantém o instante anterior se o dia não mudou', () => {
    const previous = '2026-09-20T12:00:00.000Z'

    expect(publishedAtFromDate('2026-09-20', previous, now)).toBe(previous)
  })

  it('troca o dia quando a data foi editada', () => {
    expect(publishedAtFromDate('2026-09-18', '2026-09-20T12:00:00.000Z', now)).toBe(
      '2026-09-18T17:30:15.000Z',
    )
  })
})
