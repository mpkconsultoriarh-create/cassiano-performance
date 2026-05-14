import { DIMENSIONS, CONCEITOS, ACOES_RECOMENDADAS } from '../lib/constants'
import type {
  DimensionId, EvaluatorRole, EvaluationResult,
  EvaluatorResult, Evaluator, DimensionScore
} from '../types'

// ── Score avg helpers ─────────────────────────────────────────
export function avgScores(scores: number[]): number {
  const valid = scores.filter(s => s > 0)
  if (!valid.length) return 0
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export function getDimAvg(
  scores: DimensionScore[],
  dimId: DimensionId
): number {
  const dim = DIMENSIONS.find(d => d.id === dimId)
  if (!dim) return 0
  const vals = dim.crits
    .map(c => scores.find(s => s.dimension_id === dimId && s.criterion_id === c.id)?.score ?? 0)
    .filter(v => v > 0)
  return vals.length ? avgScores(vals) : 0
}

export function getEvaluatorNota(scores: DimensionScore[]): number {
  let weighted = 0
  let totalPeso = 0
  for (const dim of DIMENSIONS) {
    const avg = getDimAvg(scores, dim.id)
    if (avg > 0) {
      weighted += avg * dim.peso
      totalPeso += dim.peso
    }
  }
  return totalPeso > 0 ? weighted / totalPeso : 0
}

// ── Main calculation ──────────────────────────────────────────
export function calcEvaluationResult(
  evaluators: Array<Evaluator & { scores: DimensionScore[] }>,
  pesos: Record<EvaluatorRole, number>
): EvaluationResult {

  const evaluatorResults: EvaluatorResult[] = evaluators.map(ev => {
    const nota = getEvaluatorNota(ev.scores)
    const dimScores = {} as Record<DimensionId, number>
    for (const dim of DIMENSIONS) {
      dimScores[dim.id] = getDimAvg(ev.scores, dim.id)
    }
    return {
      role: ev.role,
      label: ev.role,
      peso: pesos[ev.role] ?? ev.peso,
      nota,
      dimScores,
    }
  })

  // Weighted final note
  const totalPeso = evaluatorResults.reduce((s, r) => s + r.peso, 0)
  const notaFinal = totalPeso > 0
    ? evaluatorResults.reduce((s, r) => s + r.nota * (r.peso / totalPeso), 0)
    : 0

  // Dimension finals
  const dimFinal = {} as EvaluationResult['dimFinal']
  for (const dim of DIMENSIONS) {
    const byEvaluator = {} as Record<EvaluatorRole, number>
    let weighted = 0
    for (const r of evaluatorResults) {
      byEvaluator[r.role] = r.dimScores[dim.id] ?? 0
      weighted += (r.dimScores[dim.id] ?? 0) * (r.peso / totalPeso)
    }
    dimFinal[dim.id] = { avg: weighted, byEvaluator }
  }

  // Gap detection
  const autoResult = evaluatorResults.find(r => r.role === 'auto')
  const gestorResult = evaluatorResults.find(r => r.role === 'gestor')
  const gaps: EvaluationResult['gaps'] = []

  if (autoResult && gestorResult) {
    for (const dim of DIMENSIONS) {
      const autoVal = autoResult.dimScores[dim.id] ?? 0
      const gestorVal = gestorResult.dimScores[dim.id] ?? 0
      if (Math.abs(autoVal - gestorVal) >= 1.5) {
        gaps.push({ dim: dim.name, auto: autoVal, gestor: gestorVal, gap: autoVal - gestorVal })
      }
    }
  }

  const rounded = Math.round(notaFinal)
  const conceito = CONCEITOS[rounded]?.label ?? '—'
  const acaoRecomendada = ACOES_RECOMENDADAS[rounded] ?? '—'

  return {
    notaFinal: parseFloat(notaFinal.toFixed(2)),
    conceito,
    acaoRecomendada,
    hasGap: gaps.length > 0,
    evaluatorResults,
    dimFinal,
    gaps,
  }
}

// ── Formatting ────────────────────────────────────────────────
export function getNotaColor(nota: number): string {
  if (nota >= 4.5) return '#1D9E75'
  if (nota >= 3.5) return '#3B6D11'
  if (nota >= 2.5) return '#378ADD'
  if (nota >= 1.5) return '#EF9F27'
  return '#E24B4A'
}

export function getBarColor(nota: number): string {
  if (nota >= 4) return '#1D9E75'
  if (nota >= 3) return '#378ADD'
  if (nota >= 2) return '#EF9F27'
  return '#E24B4A'
}

export function getConceitoStyle(nota: number) {
  const rounded = Math.round(nota)
  return CONCEITOS[rounded] ?? CONCEITOS[3]
}
