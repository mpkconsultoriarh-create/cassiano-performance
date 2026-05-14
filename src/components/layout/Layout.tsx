import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardCheck, Building2,
  User, LogOut, FileText, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../features/auth/authStore'

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/funcionarios', icon: Users,            label: 'Funcionários'   },
  { to: '/avaliacoes',   icon: ClipboardCheck,   label: 'Avaliações'    },
  { to: '/setores',      icon: Building2,        label: 'Por Setor'     },
  { to: '/pdi',          icon: FileText,         label: 'PDI'           },
]

export function Layout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = user?.nome?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? 'RH'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#0D2B55', display: 'flex',
        flexDirection: 'column', flexShrink: 0,
        borderRight: '1px solid rgba(184,151,58,.2)'
      }}>
        {/* Brand */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#B8973A,#d4aa45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 11, color: '#0D2B55', flexShrink: 0
            }}>CSA</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#B8973A', letterSpacing: '.3px' }}>Cassiano</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', marginTop: 1 }}>Avaliação de Desempenho</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, marginBottom: 3,
                textDecoration: 'none', fontSize: 12, fontWeight: 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
                background: isActive ? 'rgba(184,151,58,.2)' : 'transparent',
                borderLeft: isActive ? '3px solid #B8973A' : '3px solid transparent',
                transition: 'all .15s',
              })}
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 12px 16px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(184,151,58,.3)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#B8973A'
            }}>{initials}</div>
            <div>
              <div style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>{user?.nome ?? 'Usuário'}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 10px', borderRadius: 7, border: 'none',
              background: 'rgba(226,75,74,.15)', color: '#E24B4A',
              fontSize: 11, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <LogOut size={13} /> Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
