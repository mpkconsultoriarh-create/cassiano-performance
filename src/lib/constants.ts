import type { Dimension, EvaluatorRole, EvaluationType } from '../types'

// ── Dimensions ────────────────────────────────────────────────
export const DIMENSIONS: Dimension[] = [
  {
    id: 'kpi',
    name: 'Resultados e KPIs',
    peso: 0.40,
    icon: 'Target',
    crits: [
      { id: 'k1', name: 'Atingimento das metas principais', sub: 'Volume, quantidade e resultados' },
      { id: 'k2', name: 'Qualidade das entregas', sub: 'Precisão, profundidade, conformidade' },
      { id: 'k3', name: 'Cumprimento de prazos', sub: 'Disciplina processual e agenda' },
      { id: 'k4', name: 'Orientação ao cliente', sub: 'Satisfação e relacionamento' },
      { id: 'k5', name: 'Resultado técnico / comercial', sub: 'Conforme a função específica' },
    ],
  },
  {
    id: 'tec',
    name: 'Competências Técnicas',
    peso: 0.25,
    icon: 'BookOpen',
    crits: [
      { id: 't1', name: 'Conhecimento técnico-jurídico', sub: 'Expertise da área de atuação' },
      { id: 't2', name: 'Uso de tecnologia e ferramentas', sub: 'Sistemas, CRM, pesquisa jurídica' },
      { id: 't3', name: 'Gestão de processos e procedimentos', sub: 'Domínio do fluxo de trabalho' },
    ],
  },
  {
    id: 'beh',
    name: 'Comportamental',
    peso: 0.25,
    icon: 'Heart',
    crits: [
      { id: 'b1', name: 'Colaboração e trabalho em equipe' },
      { id: 'b2', name: 'Comunicação e assertividade' },
      { id: 'b3', name: 'Ética, integridade e confidencialidade' },
      { id: 'b4', name: 'Iniciativa e proatividade' },
      { id: 'b5', name: 'Adaptabilidade e resiliência' },
    ],
  },
  {
    id: 'dev',
    name: 'Desenvolvimento',
    peso: 0.10,
    icon: 'GraduationCap',
    crits: [
      { id: 'd1', name: 'Participação em treinamentos e certificações' },
      { id: 'd2', name: 'Mentoria e projetos voluntários' },
    ],
  },
]

// ── Evaluators per type ───────────────────────────────────────
export const EVALUATORS_BY_TYPE: Record<EvaluationType, Array<{ id: EvaluatorRole; label: string; defaultPeso: number }>> = {
  '90':  [
    { id: 'auto',       label: 'Autoavaliação', defaultPeso: 40 },
    { id: 'gestor',     label: 'Gestor',        defaultPeso: 60 },
  ],
  '180': [
    { id: 'auto',       label: 'Autoavaliação', defaultPeso: 30 },
    { id: 'gestor',     label: 'Gestor',        defaultPeso: 50 },
    { id: 'par',        label: 'Par / Colega',  defaultPeso: 20 },
  ],
  '360': [
    { id: 'auto',       label: 'Autoavaliação', defaultPeso: 20 },
    { id: 'gestor',     label: 'Gestor',        defaultPeso: 40 },
    { id: 'par',        label: 'Par / Colega',  defaultPeso: 20 },
    { id: 'subordinado',label: 'Subordinado',   defaultPeso: 10 },
    { id: 'cliente',    label: 'Cliente',       defaultPeso: 10 },
  ],
}

// ── Score scale ───────────────────────────────────────────────
export const SCORE_LABELS: Record<number, string> = {
  1: 'Insatisfatório',
  2: 'Em Desenvolvimento',
  3: 'Atende ao Esperado',
  4: 'Muito Bom',
  5: 'Excepcional',
}

export const CONCEITOS: Record<number, { label: string; color: string; bg: string }> = {
  5: { label: 'Excepcional',        color: '#1A5C35', bg: '#E2F5EB' },
  4: { label: 'Muito bom',          color: '#3B6D11', bg: '#EAF3DE' },
  3: { label: 'Atende ao esperado', color: '#185FA5', bg: '#E6F1FB' },
  2: { label: 'Em desenvolvimento', color: '#8C6D1F', bg: '#FBF3DC' },
  1: { label: 'Insatisfatório',     color: '#A32D2D', bg: '#FCEBEB' },
}

export const ACOES_RECOMENDADAS: Record<number, string> = {
  5: 'Progressão acelerada — reconhecimento formal',
  4: 'Progressão de nível conforme elegibilidade',
  3: 'Manutenção do nível atual',
  2: 'PDI obrigatório em 90 dias',
  1: 'PDI imediato e advertência formal',
}

// ── Setores ───────────────────────────────────────────────────
export const SETORES = [
  'Jurídico Trabalhista',
  'Jurídico Cível',
  'Jurídico Tributário',
  'Comercial',
  'Administrativo',
  'Financeiro',
  'RH',
]

// ── Cargos ────────────────────────────────────────────────────
export const CARGOS = [
  'SDR',
  'Closer',
  'Estagiário Jurídico',
  'Advogado Associado Júnior',
  'Advogado Associado Pleno',
  'Advogado Associado Sênior',
  'Advogado Coordenador',
  'Analista Administrativo',
  'Analista Financeiro',
  'Analista de RH',
]

// ── Brand Colors ──────────────────────────────────────────────
export const COLORS = {
  navy:    '#0D2B55',
  navy2:   '#1A3F6F',
  gold:    '#B8973A',
  lgold:   '#FBF3DC',
  green:   '#1D9E75',
  red:     '#E24B4A',
  amber:   '#EF9F27',
  blue:    '#378ADD',
}
