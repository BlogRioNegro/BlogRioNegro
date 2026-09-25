import { describe, expect, it } from 'vitest'
import { formatDate } from './admin-date'

describe('formatDate', () => {
  it('formata em dd/mm/aaaa', () => {
    expect(formatDate('2026-09-22T15:00:00Z')).toBe('22/09/2026')
  })

  it('usa o fuso de Brasília na virada do dia', () => {
    expect(formatDate('2026-09-23T02:00:00Z')).toBe('22/09/2026')
  })
})
