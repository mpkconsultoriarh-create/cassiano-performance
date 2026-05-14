import { useEffect, useState, useCallback } from 'react'
import { Radar, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement
} from 'chart.js'
import { TrendingUp, Users, Star, AlertTriangle, Eye, Download, Sparkles } from 'lucide-react'
import { getEvaluations, getDashboardStats, getCiclos } from '../../services/evaluationService'
import { DIMENSIONS, CONCEITOS, COLORS } from '../../lib/constants'
import { exportEvaluationsCSV, exportXLSX } from '../../utils/export'
import type { Evaluation } from '../../types'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement)

export function DashboardPage() {
  const [avals, setAvals] = useState<Evaluation[]>([])
  const [stats, setStats] = useState({ total: 0, media: 0, excepcionais: 0, pdiNeeded: 0, gaps: 0 })
  const [ciclos, setCiclos] = useState<string[]>([])
  const [filters, setFilters] = useState({ setor: '', tipo: '', ciclo: '', conceito: '' })
  const [loading, setLoading] = useState(true)
  const [setores, setSetores] = useState<string[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [avData, statsData, ciclosData] = await Promise.all([
        getEvaluations(filters),
        getDashboardStats(),
        getCiclos(),
      ])
      setAvals(avData)
      setStats(statsData)
      setCiclos(ciclosData)
      const s = [...new Set(avData.map(a => a.employee?.setor).filter(Boolean))] as string[]
      setSetores(s)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  // Concept distribution
  const conceitoCounts = [1, 2, 3, 4, 5].map(n =>
    avals.filter(a => Math.round(a.nota_final ?? 0) === n).length
  )

  // Radar avg
  const radarData = DIMENSIONS.map(dim => {
    const vals = avals.map(a => {
      const evs = (a as any).evaluators ?? []
      const scores = evs.flatMap((ev: any) => ev.scores ?? [])
      const dimScores = scores.filter((s: any) => s.dimension_id === dim.id)
      if (!dimScores.length) return 0
      return dimScores.reduce((sum: number, s: any) => sum + (s.score ?? 0), 0) / dimScores.length
    }).filter(v => v > 0)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  })

  const barChartData = {
    labels: ['Insatisfatório', 'Em desenv.', 'Esperado', 'Muito bom', 'Excepcional'],
    datasets: [{
      data: conceitoCounts,
      backgroundColor: ['#F09595', '#FAC775', '#85B7EB', '#C0DD97', '#5DCAA5'],
      borderColor: ['#E24B4A', '#EF9F27', '#378ADD', '#639922', '#1D9E75'],
      borderWidth: 1.5, borderRadius: 6,
    }],
  }

  const radarChartData = {
    labels: DIMENSIONS.map(d => d.name.split(' ').slice(0, 2).join(' ')),
    datasets: [{
      label: 'Média', data: radarData,
      backgroundColor: 'rgba(13,43,85,.15)',
      borderColor: '#0D2B55', borderWidth: 2,
      pointBackgroundColor: '#B8973A', pointRadius: 4,
    }],
  }

  const kpis = [
    { label: 'Total avaliações', value: stats.total,        color: COLORS.navy,  icon: TrendingUp },
    { label: 'Nota média',       value: stats.media.toFixed(1), color: COLORS.blue, icon: TrendingUp },
    { label: 'Excepcionais',     value: stats.excepcionais, color: COLORS.green, icon: Star },
    { label: 'Precisam PDI',     value: stats.pdiNeeded,    color: COLORS.red,   icon: AlertTriangle },
    { label: 'Gaps percepção',   value: stats.gaps,         color: '#EF9F27',    icon: Eye },
  ]

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>Dashboard executivo</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Visão consolidada de todas as avaliações</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exportEvaluationsCSV(avals)} style={btnStyle('ghost')}>
            <Download size={13} /> Exportar CSV
          </button>
          <button onClick={() => {/* AI prompt */}} style={btnStyle('gold')}>
            <Sparkles size={13} /> Análise IA ↗
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '10px 12px', background: '#fff', border: '.5px solid #e5e7eb', borderRadius: 12 }}>
        {[
          { key: 'setor', placeholder: 'Todos os setores', options: setores },
          { key: 'tipo', placeholder: 'Todos os tipos', options: ['90', '180', '360'] },
          { key: 'ciclo', placeholder: 'Todos os ciclos', options: ciclos },
          { key: 'conceito', placeholder: 'Todos os conceitos', options: ['Excepcional', 'Muito bom', 'Atende ao esperado', 'Em desenvolvimento', 'Insatisfatório'] },
        ].map(f => (
          <select key={f.key} value={(filters as any)[f.key]}
            onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
            style={{ padding: '6px 9px', border: '.5px solid #d1d5db', borderRadius: 8, fontSize: 12, background: '#fff', color: '#374151', minWidth: 120 }}>
            <option value="">{f.placeholder}</option>
            {f.options.map(o => <option key={o} value={o}>{o}{f.key === 'tipo' ? '°' : ''}</option>)}
          </select>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 16 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <k.icon size={14} color={k.color} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={cardStyle}>
          <div style={cardTitle}><TrendingUp size={14} color={COLORS.gold} /> Distribuição de conceitos</div>
          <div style={{ position: 'relative', height: 200 }}>
            <Bar data={barChartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0, font: { size: 10 } }, grid: { color: '#f3f4f6' } }, x: { ticks: { font: { size: 10 } }, grid: { display: false } } }
            }} />
          </div>
        </div>
        <div style={cardStyle}>
          <div style={cardTitle}><Eye size={14} color={COLORS.gold} /> Radar de dimensões</div>
          <div style={{ position: 'relative', height: 200 }}>
            <Radar data={radarChartData} options={{
              responsive: true, maintainAspectRatio: false,
              scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, font: { size: 9 } }, grid: { color: '#f3f4f6' } } },
              plugins: { legend: { display: false } }
            }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '.5px solid #e5e7eb' }}>
          <div style={cardTitle}>Tabulação completa ({avals.length} avaliações)</div>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Carregando...</div>
        ) : !avals.length ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Nenhuma avaliação encontrada</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Funcionário', 'Setor', 'Cargo', 'Tipo', 'Ciclo', 'Nota', 'Conceito', 'Ação'].map(h => (
                    <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: '#6B7280', borderBottom: '.5px solid #E5E7EB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...avals].sort((a, b) => (b.nota_final ?? 0) - (a.nota_final ?? 0)).map((a, i) => {
                  const rounded = Math.round(a.nota_final ?? 0)
                  const conc = CONCEITOS[rounded] ?? CONCEITOS[3]
                  return (
                    <tr key={a.id} style={{ background: i % 2 ? '#FAFAFA' : '#fff' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 500 }}>{a.employee?.nome}</td>
                      <td style={{ padding: '7px 10px' }}><span style={{ background: '#E6F1FB', color: '#185FA5', fontSize: 10, padding: '2px 7px', borderRadius: 99 }}>{a.employee?.setor}</span></td>
                      <td style={{ padding: '7px 10px', color: '#6B7280', fontSize: 11 }}>{a.employee?.cargo}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'center' }}><span style={{ background: '#F3F4F6', color: '#374151', fontSize: 10, padding: '2px 7px', borderRadius: 99 }}>{a.tipo}°</span></td>
                      <td style={{ padding: '7px 10px', color: '#6B7280', fontSize: 11 }}>{a.ciclo}</td>
                      <td style={{ padding: '7px 10px', fontSize: 15, fontWeight: 500, color: a.nota_final! >= 4 ? '#1A5C35' : a.nota_final! >= 3 ? '#185FA5' : '#A32D2D' }}>{a.nota_final?.toFixed(1)}</td>
                      <td style={{ padding: '7px 10px' }}><span style={{ background: conc.bg, color: conc.color, fontSize: 10, padding: '2px 7px', borderRadius: 99 }}>{a.conceito}</span></td>
                      <td style={{ padding: '7px 10px', fontSize: 11, color: '#6B7280', maxWidth: 180 }}>{a.acao_recomendada}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = { background: '#fff', border: '.5px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 0 }
const cardTitle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: '#0D2B55', display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8, marginBottom: 10, borderBottom: '.5px solid #E5E7EB' }
const btnStyle = (variant: 'ghost' | 'gold'): React.CSSProperties => ({
  padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  ...(variant === 'gold'
    ? { background: 'transparent', border: '.5px solid #B8973A', color: '#B8973A' }
    : { background: 'transparent', border: '.5px solid #D1D5DB', color: '#6B7280' })
})
