import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useTasksStore } from './store/tasksStore'

// Layout
import Layout from './components/layout/Layout'

// Fire Effects
import FireSplash from './components/ui/FireSplash'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TorchAI from './pages/TorchAI'
import QualityControl from './pages/QualityControl'
import ProjectHub from './pages/ProjectHub'
import Maintenance from './pages/Maintenance'
import WeeklyOps from './pages/WeeklyOps'
import FontMixer from './pages/FontMixer'
import Settings from './pages/Settings'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="gradient-mesh" />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const { initAuth, user } = useAuthStore()
  const { subscribeToSessions, unsubscribeFromSessions } = useTasksStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useEffect(() => {
    if (user) {
      subscribeToSessions(user.uid)
    }

    return () => {
      unsubscribeFromSessions()
    }
  }, [user, subscribeToSessions, unsubscribeFromSessions])

  return (
    <>
      {/* Fire cursor effect - follows mouse globally */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999, opacity: 0.7 }}>
        <FireSplash
          SPLAT_RADIUS={0.25}
          SPLAT_FORCE={6000}
          CURL={25}
          DENSITY_DISSIPATION={2}
          VELOCITY_DISSIPATION={1.5}
          AUTO_SPLAT={false}
        />
      </div>

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="torch" element={<TorchAI />} />
            <Route path="quality" element={<QualityControl />} />
            <Route path="projects" element={<ProjectHub />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="ops" element={<WeeklyOps />} />
            <Route path="fonts" element={<FontMixer />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
