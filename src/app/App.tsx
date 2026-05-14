import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './features/auth/authStore'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './features/auth/LoginPage'
import { EmployeesPage } from './features/employees/EmployeesPage'
import { EvaluationsPage } from './features/evaluations/EvaluationsPage'
import { EvaluationFormPage } from './features/evaluations/EvaluationFormPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { SectorsPage } from './features/sectors/SectorsPage'
import { EmployeeDetailPage } from './features/employees/EmployeeDetailPage'
import { PDIPage } from './features/pdi/PDIPage'
import { Toaster } from './components/ui/Toaster'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" /></div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { fetchUser, setSession } = useAuthStore()

  useEffect(() => {
    fetchUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="funcionarios" element={<EmployeesPage />} />
          <Route path="funcionarios/:id" element={<EmployeeDetailPage />} />
          <Route path="avaliacoes" element={<EvaluationsPage />} />
          <Route path="avaliacoes/nova" element={<EvaluationFormPage />} />
          <Route path="avaliacoes/:id" element={<EvaluationFormPage />} />
          <Route path="setores" element={<SectorsPage />} />
          <Route path="pdi" element={<PDIPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
