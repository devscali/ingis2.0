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
  Sparkles
} from 'lucide-react'
import { StatCard, QuickAction } from '../components/ui/Card'
import { useTasksStore } from '../store/tasksStore'
import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { tasks } = useTasksStore()

  const activeTasks = tasks.filter(t => !t.completed).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">
          Hola, <span className="text-orange-500">{user?.displayName || 'Usuario'}</span>
        </h1>
        <p className="text-white/50 text-sm sm:text-base">Bienvenido a IgnisOS. Aquí tienes un resumen de tu actividad.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard icon={ClipboardList} value={activeTasks} label="Tareas Pendientes" color="orange" />
        <StatCard icon={CheckCircle2} value="0" label="Proyectos QC" color="green" />
        <StatCard icon={Flame} value="3" label="Módulos Activos" color="purple" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-5 flex items-center gap-3">
          <Zap className="w-5 h-5 text-orange-500" />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <QuickAction
            icon={Mic}
            title="Capturar Nota"
            description="Graba o escribe"
            onClick={() => navigate('/torch')}
          />
          <QuickAction
            icon={FolderOpen}
            title="Nuevo Proyecto QC"
            description="Control de calidad"
            onClick={() => navigate('/quality')}
          />
          <QuickAction
            icon={Type}
            title="Font Mixer"
            description="Combinar tipografías"
            onClick={() => navigate('/fonts')}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-5 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Actividad Reciente
        </h2>
        <div className="bg-dark-700/80 border border-white/5 rounded-2xl divide-y divide-white/5">
          <div className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium">Bienvenido a IgnisOS</p>
              <p className="text-sm text-white/40 mt-1">Ahora</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
