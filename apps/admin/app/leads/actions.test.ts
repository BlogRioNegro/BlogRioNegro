import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GENERIC_ERROR_MESSAGE } from '../../lib/services/action-result'

const requireAdmin = vi.fn()
const deleteLeadRecord = vi.fn()

vi.mock('../../lib/services/require-admin', () => ({ requireAdmin }))
vi.mock('../../lib/services/leads', () => ({ deleteLeadRecord }))

const { deleteLead } = await import('./actions')

const ID = '4b4f7c5e-2d7a-4c1e-9d55-0a3f5c1e8b21'
const supabase = { marker: 'supabase' }

describe('deleteLead', () => {
  beforeEach(() => {
    vi.spyOn(process.stderr, 'write').mockReturnValue(true)
    requireAdmin.mockResolvedValue({ ok: true, supabase, userId: 'admin' })
    deleteLeadRecord.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('devolve a negação do requireAdmin sem excluir', async () => {
    requireAdmin.mockResolvedValue({ ok: false, error: 'Sessão expirada' })

    expect(await deleteLead(ID)).toEqual({ ok: false, error: 'Sessão expirada' })
    expect(deleteLeadRecord).not.toHaveBeenCalled()
  })

  it('recusa id inválido', async () => {
    expect(await deleteLead('1; drop table leads')).toEqual({
      ok: false,
      error: GENERIC_ERROR_MESSAGE,
    })
    expect(deleteLeadRecord).not.toHaveBeenCalled()
  })

  it('exclui o lead', async () => {
    expect(await deleteLead(ID)).toEqual({ ok: true, data: null })
    expect(deleteLeadRecord).toHaveBeenCalledWith(supabase, ID)
  })

  it('falha no banco vira erro genérico', async () => {
    deleteLeadRecord.mockResolvedValue({ code: 'XX000', message: 'internal' })

    expect(await deleteLead(ID)).toEqual({ ok: false, error: GENERIC_ERROR_MESSAGE })
  })
})
