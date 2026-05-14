import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { getEmployee, createEmployee, updateEmployee } from '../../services/employeeService'
import { SETORES, CARGOS } from '../../lib/constants'
import type { EmployeeFormData } from '../../types'

interface Props {
  employeeId: string | null
  onClose: () => void
  onSaved: () => void
}

const EMPTY: EmployeeFormData = {
  nome: '', email: '', setor: '', cargo: '',
  nivel: 1, gestor_nome: '', admissao: '', oab: '', status: 'Ativo',
}

export function EmployeeFormModal({ employeeId, onClose, onSaved }: Props) {
  const [form, setForm] = useState<EmployeeFormData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!employeeId) { setForm(EMPTY); return }
    setLoading(true)
    getEmployee(employeeId).then(emp => {
      if (emp) setForm({
        nome: emp.nome, email: emp.email ?? '', setor: emp.setor,
        cargo: emp.cargo, nivel: emp.nivel, gestor_nome: emp.gestor_nome ?? '',
        admissao: emp.admissao ?? '', oab: emp.oab ?? '', status: emp.status,
      })
      setLoading(false)
    })
  }, [employeeId])

  const handleSave = async () => {
    if (!form.nome || !form.setor || !form.cargo) { setError('Preencha nome, setor e cargo.'); return }
    setSaving(true); setError('')
    try {
      if (employeeId) await updateEmployee(employeeId, form)
      else await createEmployee(form)
      onSaved()
    } catch (e: any) {
      setError(e.message ?? 'Erro ao salvar.')
      setSaving(false)
    }
  }

  const set = (key: keyof EmployeeFormData, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', borderLeft: '3px solid #B8973A' }}>
        <div style={{ padding: '16px 20px', borderBottom: '.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#0D2B55' }}>{employeeId ? 'Editar funcionário' : 'Novo funcionário'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}><X size={16} /></button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>Carregando...</div> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ gridColumn: 'span 2' }}><Label>Nome completo</Label><Input value={form.nome} onChange={v => set('nome', v)} placeholder="Nome completo" /></div>
                <div><Label>E-mail</Label><Input type="email" value={form.email ?? ''} onChange={v => set('email', v)} placeholder="email@cassiano.com" /></div>
                <div><Label>OAB</Label><Input value={form.oab ?? ''} onChange={v => set('oab', v)} placeholder="SP 123456" /></div>
                <div>
                  <Label>Setor</Label>
                  <select value={form.setor} onChange={e => set('setor', e.target.value)} style={selStyle}>
                    <option value="">Selecione...</option>
                    {SETORES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Cargo</Label>
                  <select value={form.cargo} onChange={e => set('cargo', e.target.value)} style={selStyle}>
                    <option value="">Selecione...</option>
                    {CARGOS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Nível (1–10)</Label>
                  <select value={form.nivel} onChange={e => set('nivel', Number(e.target.value))} style={selStyle}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div><Label>Gestor direto</Label><Input value={form.gestor_nome ?? ''} onChange={v => set('gestor_nome', v)} placeholder="Nome do gestor" /></div>
                <div><Label>Data de admissão</Label><Input type="date" value={form.admissao ?? ''} onChange={v => set('admissao', v)} /></div>
                <div>
                  <Label>Status</Label>
                  <select value={form.status} onChange={e => set('status', e.target.value as any)} style={selStyle}>
                    <option>Ativo</option><option>Licença</option><option>Desligado</option>
                  </select>
                </div>
              </div>
              {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '.5px solid #D1D5DB', borderRadius: 8, fontSize: 12, cursor: 'pointer', color: '#6B7280' }}>Cancelar</button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: '#0D2B55', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>{children}</div>
}
function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '7px 9px', border: '.5px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
}
const selStyle: React.CSSProperties = { width: '100%', padding: '7px 9px', border: '.5px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }
