import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ClipboardList,
  CheckCircle2,
  Flame,
  Zap,
  Mic,
  FolderOpen,
  Type,
  TrendingUp,
  Sparkles,
  Upload,
  FileText,
  Download,
  AlertTriangle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react'
import FireCard from '../components/ui/FireCard'
import { useTasksStore } from '../store/tasksStore'
import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { tasks } = useTasksStore()

  const activeTasks = tasks.filter(t => !t.completed).length

  // Get current month/year in Spanish
  const currentDate = new Date()
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const currentMonth = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header Hero Section */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <p className="text-white/40 text-sm mb-2">{currentMonth}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            Tu negocio,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">en tiempo real.</span>
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/torch')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow"
        >
          <Plus className="w-5 h-5" />
          Nueva Nota
        </motion.button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tareas Pendientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FireCard intensity="subtle">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Tareas Pendientes</span>
              </div>
              <p className="text-4xl font-black">{activeTasks}</p>
              <div className="flex items-center gap-1 mt-3">
                <span className="flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                  <ArrowUpRight className="w-3 h-3" />
                  activo
                </span>
              </div>
            </div>
          </FireCard>
        </motion.div>

        {/* Proyectos QC */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <FireCard intensity="subtle">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Proyectos QC</span>
              </div>
              <p className="text-4xl font-black">0</p>
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
              </div>
            </div>
          </FireCard>
        </motion.div>

        {/* Módulos Activos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sm:col-span-2"
        >
          <FireCard intensity="medium">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Módulos Activos</span>
                </div>
                <span className="text-xs text-white/40">Últimos 7 días</span>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black">3</p>
                {/* Mini bar chart */}
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 60, 45, 70, 55, 85, 90].map((height, i) => (
                    <div
                      key={i}
                      className="w-6 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FireCard>
        </motion.div>
      </div>

      {/* Second Row - Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alertas Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <FireCard intensity="subtle">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Alertas Activas</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-semibold">Sin alertas</p>
                    <p className="text-xs text-white/40">Todo en orden</p>
                  </div>
                </div>
              </div>
            </div>
          </FireCard>
        </motion.div>

        {/* Actividad Reciente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-dark-800/60 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Actividad Reciente</span>
              </div>
              <button className="text-xs text-orange-500 hover:text-orange-400 font-semibold">
                Ver todo
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Bienvenido a IgnisOS</p>
                  <p className="text-xs text-white/40">Ahora</p>
                </div>
                <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                  Completo
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Acciones Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <div className="bg-dark-800/60 border border-white/5 rounded-2xl p-5">
            <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Acciones Rápidas</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <button
                onClick={() => navigate('/torch')}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                <Upload className="w-5 h-5" />
                Nueva Nota
              </button>
              <button
                onClick={() => navigate('/quality')}
                className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-sm text-white/80 hover:bg-white/10 transition-all"
              >
                <FileText className="w-5 h-5" />
                Ver QC
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-sm text-white/80 hover:bg-white/10 transition-all"
              >
                <Download className="w-5 h-5" />
                Projects
              </button>
            </div>
          </div>
        </motion.div>

        {/* User Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-dark-800/60 border border-white/5 rounded-2xl p-5 h-full flex flex-col justify-center">
            <p className="text-sm text-white/40 mb-1">Bienvenido,</p>
            <p className="text-2xl font-bold text-orange-500">{user?.displayName || 'Usuario'}</p>
            <p className="text-xs text-white/30 mt-2">{user?.email}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
