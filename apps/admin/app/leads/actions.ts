'use server'

import { z } from 'zod'
import {
  failAction,
  GENERIC_ERROR_MESSAGE,
  type ActionResult,
} from '../../lib/services/action-result'
import { deleteLeadRecord } from '../../lib/services/leads'
import { requireAdmin } from '../../lib/services/require-admin'

export type DeleteLeadResult = ActionResult<null>

/** ADM-013 · Exclui um lead (pedido do titular, LGPD). */
export async function deleteLead(leadId: string): Promise<DeleteLeadResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const id = z.uuid().safeParse(leadId)
  if (!id.success) return { ok: false, error: GENERIC_ERROR_MESSAGE }

  const deleteError = await deleteLeadRecord(auth.supabase, id.data)
  if (deleteError) return failAction('admin.lead_delete_failed', deleteError)
  return { ok: true, data: null }
}
