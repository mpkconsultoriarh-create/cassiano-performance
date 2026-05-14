import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, ClipboardCheck, RefreshCw } from 'lucide-react'
import { getEmployees, deleteEmployee, subscribeToEmployees } from '../../services/employeeService'
import type { EmployeeSummary } from '../../types'
import { SETORES } from '../../lib/constants'
import { EmployeeFormModal } from './EmployeeFormModal'

export function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [setor, setSetor] = useState('')
  const [status, setStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getEmployees({ search, setor, status })
      setEmployees(data)
    } finally {
      setLoading(false)
    }
  }, [search, setor, status])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const channel = subscribeToEmployees(load)
    return () => { channel.unsubscribe() }
  }, [load])

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Remover ${nome}?`)) return
    await deleteEmployee(id)
    load()
  }

  const ativos = employees.filter(e => e.status === 'Ativo').length
  const avaliados = employees.filter(e => e.ultima_nota !== null).length

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>Funcionários</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Cadastro e gerenciamento da equipe</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={ghostBtn}><RefreshCw size={13} /></button>
          <button onClick={() => { setEditingId(null); setShowForm(true) }} style={primaryBtn}>
            <Plus size={13} /> Novo funcionário
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Total', value: employees.length, color: '#0D2B55' },
          { label: 'Ativos', value: ativos, color: '#1D9E75' },
          { label: 'Já avaliados', value: avaliados, color: '#B8973A' },
          { label: 'Setores', value: new Set(employees.map(e => e.setor)).size, color: '#378ADD' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '.5px solid #E5E7EB', borderRadius: 12, padding: '10px 12px', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, padding: '10px 12px', background: '#fff', border: '.5px solid #e5e7eb', borderRadius: 12 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            style={{ width: '100%', padding: '6px 9px 6px 28px', border: '.5px solid #D1D5DB', borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={setor} onChange={e => setSetor(e.target.value)} style={selectStyle}>
          <option value="">Todos os setores</option>
          {SETORES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
          <option value="">Todos os status</option>
          <option>Ativo</option><option>Licença</option><option>Desligado</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '.5px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Carregando...</div>
        ) : !employees.length ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Nenhum funcionário</div>
            <div style={{ fontSize: 12 }}>Cadastre o primeiro funcionário</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Funcionário', 'Setor', 'Cargo', 'Nível', 'Gestor', 'Status', 'Última avaliação', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: '#6B7280', borderBottom: '.5px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((e, i) => (
                  <tr key={e.id} style={{ background: i % 2 ? '#FAFAFA' : '#fff', cursor: 'pointer' }}
                    onClick={() => navigate(`/funcionarios/${e.id}`)}>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E6EFF9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#0D2B55', flexShrink: 0 }}>
                          {e.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{e.nome}</div>
                          <div style={{ fontSize: 10, color: '#9CA3AF' }}>{e.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px' }}><span style={{ background: '#E6F1FB', color: '#185FA5', fontSize: 10, padding: '2px 7px', borderRadius: 99 }}>{e.setor}</span></td>
                    <td style={{ padding: '8px 10px', color: '#6B7280', fontSize: 11 }}>{e.cargo}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ background: 'rgba(13,43,85,.1)', color: '#0D2B55', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500 }}>{e.nivel}</span>
                    </td>
                    <td style={{ padding: '8px 10px', color: '#6B7280', fontSize: 11 }}>{e.gestor_nome || '—'}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 99,
                        background: e.status === 'Ativo' ? '#E2F5EB' : e.status === 'Licença' ? '#FBF3DC' : '#FCEBEB',
                        color: e.status === 'Ativo' ? '#1A5C35' : e.status === 'Licença' ? '#8C6D1F' : '#A32D2D',
                      }}>{e.status}</span>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      {e.ultima_nota ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: e.ultima_nota >= 4 ? '#1A5C35' : e.ultima_nota >= 3 ? '#185FA5' : '#A32D2D' }}>
                            {e.ultima_nota.toFixed(1)}
                          </span>
                          <span style={{ fontSize: 9, color: '#9CA3AF' }}>{e.total_avaliacoes} av.</span>
                        </div>
                      ) : <span style={{ color: '#D1D5DB', fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ padding: '8px 10px' }} onClick={e2 => e2.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={ev => { ev.stopPropagation(); navigate(`/avaliacoes/nova?emp=${e.id}`) }} style={iconBtn} title="Iniciar avaliação"><ClipboardCheck size={12} /></button>
                        <button onClick={ev => { ev.stopPropagation(); setEditingId(e.id); setShowForm(true) }} style={iconBtn} title="Editar"><Edit2 size={12} /></button>
                        <button onClick={ev => { ev.stopPropagation(); handleDelete(e.id, e.nome) }} style={iconBtn} title="Remover"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <EmployeeFormModal
          employeeId={editingId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load() }}
        />
      )}
    </div>
  )
}

const primaryBtn: React.CSSProperties = { padding: '8px 16px', background: '#0D2B55', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }
const ghostBtn: React.CSSProperties = { padding: '8px 10px', background: 'transparent', color: '#6B7280', border: '.5px solid #D1D5DB', borderRadius: 8, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }
const selectStyle: React.CSSProperties = { padding: '6px 9px', border: '.5px solid #D1D5DB', borderRadius: 8, fontSize: 12, background: '#fff', color: '#374151', minWidth: 130, outline: 'none' }
const iconBtn: React.CSSProperties = { width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '.5px solid #E5E7EB', borderRadius: 6, background: 'transparent', color: '#9CA3AF', cursor: 'pointer' }
