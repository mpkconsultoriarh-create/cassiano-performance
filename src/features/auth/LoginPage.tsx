import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from './authStore'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Preencha e-mail e senha.'); return }
    setLoading(true); setError('')
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) { setError('E-mail ou senha incorretos.'); return }
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a1f3d 0%,#0D2B55 60%,#1A3F6F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo block */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#B8973A,#d4aa45)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#0D2B55', marginBottom: 12 }}>CSA</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#B8973A', letterSpacing: '.5px' }}>CASSIANO SOCIEDADE DE ADVOGADOS</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>Sistema de Avaliação de Desempenho</div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 4px 40px rgba(0,0,0,.3)' }}>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20, color: '#0D2B55' }}>Acesso ao sistema</div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 4 }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@cassiano.com.br"
                  style={{ width: '100%', padding: '9px 10px 9px 32px', border: '.5px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 4 }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '9px 36px 9px 32px', border: '.5px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2 }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 14, border: '.5px solid #E24B4A' }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '10px', background: loading ? '#9CA3AF' : '#0D2B55', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
          Cassiano Sociedade de Advogados © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
