import { supabase } from '../lib/supabase'
import { calcEvaluationResult } from '../utils/calculator'
import { EVALUATORS_BY_TYPE } from '../lib/constants'
import type {
  Evaluation, EvaluationFormData, Evaluator,
  DimensionScore, EvaluatorRole, DimensionId
} from '../types'

// ── Read ──────────────────────────────────────────────────────
export async function getEvaluations(filters?: {
  setor?: string
  tipo?: string
  ciclo?: string
  conceito?: string
}): Promise<Evaluation[]> {
  let query = supabase
    .from('evaluations')
    .select(`*, employee:employees(*)`)
    .is('deleted_at', null)
    .eq('finalizada', true)
    .order('created_at', { ascending: false })

  if (filters?.tipo) query = query.eq('tipo', filters.tipo)
  if (filters?.ciclo) query = query.eq('ciclo', filters.ciclo)
  if (filters?.conceito) query = query.eq('conceito', filters.conceito)

  const { data, error } = await query
  if (error) throw error

  let result = data ?? []
  if (filters?.setor) result = result.filter((e: any) => e.employee?.setor === filters.setor)
  return result
}

export async function getEvaluationById(id: string): Promise<Evaluation | null> {
  const { data, error } = await supabase
    .from('evaluations')
    .select(`*, employee:employees(*), evaluators(*, scores:dimension_scores(*))`)
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getEmployeeEvaluations(employeeId: string): Promise<Evaluation[]> {
  const { data, error } = await supabase
    .from('evaluations')
    .select(`*, evaluators(*, scores:dimension_scores(*))`)
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .eq('finalizada', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── Create ────────────────────────────────────────────────────
export async function createEvaluation(formData: EvaluationFormData): Promise<string> {
  // 1. Create evaluation record
  const { data: evaluation, error: evalError } = await supabase
    .from('evaluations')
    .insert({
      employee_id: formData.employee_id,
      tipo: formData.tipo,
      ciclo: formData.ciclo,
      finalizada: false,
    })
    .select()
    .single()
  if (evalError) throw evalError

  // 2. Create evaluators
  const evaluatorDefs = EVALUATORS_BY_TYPE[formData.tipo]
  const evaluatorsToInsert = evaluatorDefs.map(ev => ({
    evaluation_id: evaluation.id,
    role: ev.id,
    peso: formData.pesos[ev.id] ?? ev.defaultPeso,
  }))

  const { error: evtrError } = await supabase
    .from('evaluators')
    .insert(evaluatorsToInsert)
  if (evtrError) throw evtrError

  return evaluation.id
}

// ── Save scores ───────────────────────────────────────────────
export async function saveEvaluatorScores(
  evaluatorId: string,
  scores: Record<string, number>,
  obs?: string
): Promise<void> {
  // Upsert each score
  const scoresToUpsert = Object.entries(scores).map(([key, score]) => {
    const [dimId, critId] = key.split('.')
    return {
      evaluator_id: evaluatorId,
      dimension_id: dimId as DimensionId,
      criterion_id: critId,
      score,
    }
  })

  const { error: scoreError } = await supabase
    .from('dimension_scores')
    .upsert(scoresToUpsert, { onConflict: 'evaluator_id,dimension_id,criterion_id' })
  if (scoreError) throw scoreError

  // Mark evaluator as confirmed
  const { error: confirmError } = await supabase
    .from('evaluators')
    .update({ confirmado: true, nota_media: null, obs })
    .eq('id', evaluatorId)
  if (confirmError) throw confirmError
}

// ── Finalize ──────────────────────────────────────────────────
export async function finalizeEvaluation(evaluationId: string): Promise<void> {
  // Load all evaluators + scores
  const { data: evaluators, error } = await supabase
    .from('evaluators')
    .select('*, scores:dimension_scores(*)')
    .eq('evaluation_id', evaluationId)
  if (error) throw error

  const pesos = evaluators.reduce((acc: any, ev: any) => {
    acc[ev.role as EvaluatorRole] = ev.peso
    return acc
  }, {} as Record<EvaluatorRole, number>)

  const result = calcEvaluationResult(
    evaluators.map((ev: any) => ({ ...ev, scores: ev.scores ?? [] })),
    pesos
  )

  // Update evaluator nota_media
  for (const r of result.evaluatorResults) {
    await supabase
      .from('evaluators')
      .update({ nota_media: r.nota })
      .eq('evaluation_id', evaluationId)
      .eq('role', r.role)
  }

  // Finalize evaluation
  const { error: finalError } = await supabase
    .from('evaluations')
    .update({
      nota_final: result.notaFinal,
      conceito: result.conceito,
      acao_recomendada: result.acaoRecomendada,
      has_gap: result.hasGap,
      pdi_needed: result.notaFinal <= 2,
      finalizada: true,
    })
    .eq('id', evaluationId)
  if (finalError) throw finalError
}

// ── Dashboard stats ───────────────────────────────────────────
export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('evaluations')
    .select('nota_final, conceito, has_gap, pdi_needed')
    .is('deleted_at', null)
    .eq('finalizada', true)
  if (error) throw error

  const avs = data ?? []
  const total = avs.length
  const media = total ? avs.reduce((s: number, a: any) => s + (a.nota_final ?? 0), 0) / total : 0
  const excepcionais = avs.filter((a: any) => Math.round(a.nota_final) === 5).length
  const pdiNeeded = avs.filter((a: any) => a.pdi_needed).length
  const gaps = avs.filter((a: any) => a.has_gap).length

  return { total, media: parseFloat(media.toFixed(2)), excepcionais, pdiNeeded, gaps }
}

export async function getCiclos(): Promise<string[]> {
  const { data } = await supabase
    .from('evaluations')
    .select('ciclo')
    .is('deleted_at', null)
    .eq('finalizada', true)
  const ciclos = [...new Set((data ?? []).map((d: any) => d.ciclo).filter(Boolean))]
  return ciclos as string[]
}

// ── Real-time ─────────────────────────────────────────────────
export function subscribeToEvaluations(callback: () => void) {
  return supabase
    .channel('evaluations-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluations' }, callback)
    .subscribe()
}
