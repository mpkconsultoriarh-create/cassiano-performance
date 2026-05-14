import { supabase } from '../lib/supabase'
import type { Employee, EmployeeSummary, EmployeeFormData } from '../types'

// ── Read ──────────────────────────────────────────────────────
export async function getEmployees(filters?: {
  search?: string
  setor?: string
  status?: string
}): Promise<EmployeeSummary[]> {
  let query = supabase
    .from('v_employee_summary')
    .select('*')
    .is('deleted_at', null)
    .order('nome')

  if (filters?.setor) query = query.eq('setor', filters.setor)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.search) query = query.ilike('nome', `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  if (error) return null
  return data
}

// ── Write ─────────────────────────────────────────────────────
export async function createEmployee(data: EmployeeFormData): Promise<Employee> {
  const { data: created, error } = await supabase
    .from('employees')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return created
}

export async function updateEmployee(id: string, data: Partial<EmployeeFormData>): Promise<Employee> {
  const { data: updated, error } = await supabase
    .from('employees')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ── Real-time ─────────────────────────────────────────────────
export function subscribeToEmployees(callback: () => void) {
  return supabase
    .channel('employees-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, callback)
    .subscribe()
}
