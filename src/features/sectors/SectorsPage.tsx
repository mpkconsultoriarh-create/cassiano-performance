import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { supabase } from '../../lib/supabase'
import type { SectorSummary } from '../../types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

function barCor(n: number) {
  if (n >= 4) return '#1D9E75'
  if (n >= 3) return '#378ADD'
  if (n >= 2) return '#EF9F27'
  return '#E24B4A'
}
function nCor(n: number) {
  if (n >= 4) return '#1A5C35'
  if (n >= 3) return '#185FA5'
  if (n >= 2) return '#8C6D1F'
  return '#A32D2D'
}
function cLabel(n: number) {
  if (n >= 4.5) return 'Excepcional'
  if (n >= 3.5) return 'Muito bom'
  if (n >= 2.5) return 'Atende ao esperado'
  if (n >= 1.5) return 'Em desenvolvimento'
  return 'Insatisfatório'
}

export function SectorsPage() {
  const [sectors, setSectors] = useState<SectorSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase.from('v_sector_summary').select('*')
      setSectors(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const chartData = {
    labels: sectors.map(s => s.setor),
    datasets: [{
      label: 'Nota média',
      data: sectors.map(s => parseFloat((s.media_nota ?? 0).toFixed(2))),
      backgroundColor: sectors.map(s => barCor(s.media_nota ?? 0) + '44'),
      borderColor: sectors.map(s => barCor(s.media_nota ?? 0)),
      borderWidth: 2, borderRadius: 6,
    }],
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Resultado por setor</div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>Comparativo de desempenho entre áreas</div>

      {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>Carregando...</div> : (
        <>
          {sectors.length > 0 && (
            <div style={{ background: '#fff', border: '.5px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#0D2B55', marginBottom: 12 }}>Nota média por setor</div>
              <div style={{ position: 'relative', height: Math.max(200, sectors.length * 50 + 60) }}>
                <Bar data={chartData} options={{
                  indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { min: 0, max: 5, ticks: { stepSize: 1, font: { size: 10 } } }, y: { ticks: { font: { size: 11 } } } }
                }} />
              </div>
            </div>
          )}

          {sectors.map(s => (
            <div key={s.setor} style={{ background: '#fff', border: '.5px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 10, borderLeft: `3px solid ${barCor(s.media_nota ?? 0)}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{s.setor}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 500, color: nCor(s.media_nota ?? 0) }}>{(s.media_nota ?? 0).toFixed(1)}</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: barCor(s.media_nota ?? 0) + '22', color: nCor(s.media_nota ?? 0) }}>{cLabel(s.media_nota ?? 0)}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
                {[
                  { l: 'Funcionários', v: s.total_funcionarios, c: '#0D2B55' },
                  { l: 'Avaliados', v: s.total_avaliados, c: '#1A5C35' },
                  { l: 'Avaliações', v: s.total_avaliacoes, c: '#B8973A' },
                  { l: 'Críticos', v: s.casos_criticos, c: '#A32D2D' },
                ].map(k => (
                  <div key={k.l} style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 500, color: k.c }}>{k.v}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{k.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#F3F4F6', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((s.media_nota ?? 0) / 5 * 100)}%`, height: 5, borderRadius: 99, background: barCor(s.media_nota ?? 0) }} />
              </div>
            </div>
          ))}

          {!sectors.length && (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9CA3AF' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Sem dados de setores</div>
              <div style={{ fontSize: 12 }}>Cadastre funcionários e realize avaliações</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
