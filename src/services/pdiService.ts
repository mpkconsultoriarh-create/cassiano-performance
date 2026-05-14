import { supabase } from '../lib/supabase'
import type { PDI } from '../types'

export async function getPDIs(employeeId?: string): Promise<PDI[]> {
  let query = supabase
    .from('pdis')
    .select('*, employee:employees(nome, cargo, setor)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (employeeId) query = query.eq('employee_id', employeeId)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createPDI(pdi: Partial<PDI>): Promise<PDI> {
  const { data, error } = await supabase
    .from('pdis')
    .insert({
      ...pdi,
      objetivos: pdi.objetivos ?? [],
      acoes: pdi.acoes ?? [],
      checkins: pdi.checkins ?? [],
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePDI(id: string, updates: Partial<PDI>): Promise<PDI> {
  const { data, error } = await supabase
    .from('pdis')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePDI(id: string): Promise<void> {
  const { error } = await supabase
    .from('pdis')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
