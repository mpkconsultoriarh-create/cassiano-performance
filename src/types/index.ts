// ============================================================
// CASSIANO — Core Types
// ============================================================

export type UserRole = 'admin' | 'rh' | 'gestor' | 'colaborador'
export type EmployeeStatus = 'Ativo' | 'Licença' | 'Desligado'
export type EvaluationType = '90' | '180' | '360'
export type EvaluatorRole = 'auto' | 'gestor' | 'par' | 'subordinado' | 'cliente'
export type PDIStatus = 'Em andamento' | 'Concluído' | 'Prorrogado' | 'Cancelado'

// ── User ──────────────────────────────────────────────────────
export interface User {
  id: string
  nome: string
  email: string
  role: UserRole
  employee_id?: string
  avatar_url?: string
  active: boolean
  created_at: string
  updated_at: string
}

// ── Employee ──────────────────────────────────────────────────
export interface Employee {
  id: string
  nome: string
  email?: string
  setor: string
  cargo: string
  nivel: number
  gestor_id?: string
  gestor_nome?: string
  admissao?: string
  oab?: string
  status: EmployeeStatus
  deleted_at?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface EmployeeSummary extends Employee {
  total_avaliacoes: number
  media_geral: number | null
  melhor_nota: number | null
  pior_nota: number | null
  ultima_nota: number | null
  ultimo_conceito: string | null
  ultimo_tipo: EvaluationType | null
}

// ── Evaluation ────────────────────────────────────────────────
export interface Evaluation {
  id: string
  employee_id: string
  tipo: EvaluationType
  ciclo: string
  nota_final: number | null
  conceito: string | null
  acao_recomendada: string | null
  has_gap: boolean
  pdi_needed: boolean
  obs_geral?: string
  finalizada: boolean
  created_by?: string
  deleted_at?: string
  created_at: string
  updated_at: string
  // joined
  employee?: Employee
  evaluators?: Evaluator[]
}

// ── Evaluator ─────────────────────────────────────────────────
export interface Evaluator {
  id: string
  evaluation_id: string
  role: EvaluatorRole
  peso: number
  nota_media: number | null
  obs?: string
  confirmado: boolean
  created_at: string
  updated_at: string
  // joined
  scores?: DimensionScore[]
}

// ── DimensionScore ────────────────────────────────────────────
export interface DimensionScore {
  id: string
  evaluator_id: string
  dimension_id: DimensionId
  criterion_id: string
  score: number | null
  created_at: string
  updated_at: string
}

// ── Dimensions & Criteria ─────────────────────────────────────
export type DimensionId = 'kpi' | 'tec' | 'beh' | 'dev'

export interface Criterion {
  id: string
  name: string
  sub?: string
}

export interface Dimension {
  id: DimensionId
  name: string
  peso: number
  icon: string
  crits: Criterion[]
}

// ── PDI ───────────────────────────────────────────────────────
export interface PDIObjective {
  id: string
  descricao: string
  prazo: string
  criterio: string
}

export interface PDIAction {
  id: string
  descricao: string
  recurso: string
  prazo: string
  status: string
}

export interface PDICheckin {
  dia: number
  data: string
  notas: string
  status: 'Pendente' | 'Realizado' | 'Cancelado'
}

export interface PDI {
  id: string
  evaluation_id?: string
  employee_id: string
  tipo: string
  nota_origem?: number
  lacunas?: string
  causa_raiz?: string
  status: PDIStatus
  resultado?: string
  data_inicio?: string
  data_fim?: string
  objetivos: PDIObjective[]
  acoes: PDIAction[]
  checkins: PDICheckin[]
  created_by?: string
  deleted_at?: string
  created_at: string
  updated_at: string
  // joined
  employee?: Employee
}

// ── Dashboard ─────────────────────────────────────────────────
export interface DashboardStats {
  total_avaliacoes: number
  media_geral: number
  excepcionais: number
  pdi_needed: number
  gaps_percepção: number
}

export interface SectorSummary {
  setor: string
  total_funcionarios: number
  total_avaliados: number
  total_avaliacoes: number
  media_nota: number | null
  casos_criticos: number
  excepcionais: number
}

// ── Calculated result types ───────────────────────────────────
export interface EvaluatorResult {
  role: EvaluatorRole
  label: string
  peso: number
  nota: number
  dimScores: Record<DimensionId, number>
}

export interface EvaluationResult {
  notaFinal: number
  conceito: string
  acaoRecomendada: string
  hasGap: boolean
  evaluatorResults: EvaluatorResult[]
  dimFinal: Record<DimensionId, { avg: number; byEvaluator: Record<EvaluatorRole, number> }>
  gaps: Array<{ dim: string; auto: number; gestor: number; gap: number }>
}

// ── Form schemas ──────────────────────────────────────────────
export interface EmployeeFormData {
  nome: string
  email?: string
  setor: string
  cargo: string
  nivel: number
  gestor_id?: string
  gestor_nome?: string
  admissao?: string
  oab?: string
  status: EmployeeStatus
}

export interface EvaluationFormData {
  employee_id: string
  tipo: EvaluationType
  ciclo: string
  pesos: Record<EvaluatorRole, number>
}
