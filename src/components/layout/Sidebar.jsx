import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Flame,
  CheckSquare,
  Kanban,
  Wrench,
  CalendarDays,
  Type,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight
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

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
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
          fixed lg:sticky top-0 left-0 h-screen z-50
          glass-sidebar flex flex-col
          transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-[80px]' : 'w-[260px] sm:w-[280px]'}
        `}
      >
        {/* Header */}
        <div className={`p-4 ${isCollapsed ? 'px-3' : 'p-5 sm:p-6'} border-b border-white/10`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-4'}`}>
              <div className={`${isCollapsed ? 'w-10 h-10' : 'w-11 h-11'} rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30`}>
                <Flame className={`${isCollapsed ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold tracking-tight">
                  Ignis<span className="text-orange-500">OS</span>
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapse Toggle - Desktop only */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-700 border border-white/10 items-center justify-center hover:bg-white/10 transition-colors z-50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white/60" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white/60" />
          )}
        </button>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-5 sm:p-6'}`}>
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className={`${isCollapsed ? 'mb-6' : 'mb-8 sm:mb-10'}`}>
              {!isCollapsed && (
                <p className="px-4 mb-4 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                  {section}
                </p>
              )}
              <div className={`${isCollapsed ? 'space-y-3' : 'space-y-2'}`}>
                {items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      isCollapsed
                        ? `flex items-center justify-center p-3 rounded-xl transition-all ${isActive ? 'bg-orange-500/20 text-orange-500' : 'text-white/60 hover:bg-white/5 hover:text-white'}`
                        : `nav-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && activeTasks > 0 && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full">
                            {activeTasks}
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && item.badge && activeTasks > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info + Logout - At bottom */}
        <div className={`border-t border-white/10 ${isCollapsed ? 'p-2' : 'p-4 sm:p-5'}`}>
          {/* User Info */}
          <div className={`${isCollapsed ? 'flex justify-center mb-3' : 'flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5'}`}>
            <div className={`${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'} rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0`}>
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {user?.displayName || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-white/50 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
            className={`
              w-full flex items-center justify-center gap-2 rounded-xl
              bg-red-500/10 text-red-400 border border-red-500/20
              hover:bg-red-500 hover:text-white hover:border-red-500
              transition-all duration-300 font-semibold
              ${isCollapsed ? 'p-3' : 'px-4 py-3'}
            `}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>
    </>
  )
}
