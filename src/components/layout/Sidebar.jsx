import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Flame,
  CheckSquare,
  Kanban,
  Wrench,
  CalendarDays,
  Type,
  Settings,
  LogOut,
  X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useTasksStore } from '../../store/tasksStore'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'Principal' },
  { path: '/torch', icon: Flame, label: 'TorchAI', section: 'Módulos', badge: true },
  { path: '/ops', icon: CalendarDays, label: 'Calidevs Ops', section: 'Módulos' },
  { path: '/quality', icon: CheckSquare, label: 'Control de Calidad', section: 'Módulos' },
  { path: '/projects', icon: Kanban, label: 'Project Hub', section: 'Módulos' },
  { path: '/maintenance', icon: Wrench, label: 'Mantenimiento', section: 'Módulos' },
  { path: '/fonts', icon: Type, label: 'Font Mixer', section: 'Herramientas' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const { tasks } = useTasksStore()
  const navigate = useNavigate()

  const activeTasks = tasks.filter(t => !t.completed).length

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Group nav items by section
  const sections = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {})

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-[260px] sm:w-[280px] z-50
          glass-sidebar flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Ignis<span className="text-orange-500">OS</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.displayName || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="mb-4 sm:mb-6">
              <p className="px-3 sm:px-4 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                {section}
              </p>
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && activeTasks > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full">
                      {activeTasks}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     bg-red-500/10 text-red-400 border border-red-500/20
                     hover:bg-red-500 hover:text-white hover:border-red-500
                     transition-all duration-300 font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  )
}
