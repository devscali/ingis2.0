import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Flame,
  CalendarDays,
  CheckSquare,
  Kanban,
  Wrench,
  Type,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/torch', icon: Flame, label: 'TorchAI' },
  { path: '/ops', icon: CalendarDays, label: 'Calidevs Ops' },
  { path: '/quality', icon: CheckSquare, label: 'Control de Calidad' },
  { path: '/projects', icon: Kanban, label: 'Project Hub' },
  { path: '/maintenance', icon: Wrench, label: 'Mantenimiento' },
  { path: '/fonts', icon: Type, label: 'Font Mixer' },
  { path: '/settings', icon: Settings, label: 'Configuración' },
]

export default function MobileNav({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed top-16 left-0 right-0 bottom-0 z-50 md:hidden bg-dark-900/95 backdrop-blur-xl overflow-y-auto safe-bottom">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-4 rounded-xl text-base transition-all ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-500'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-dark-900/95 safe-bottom">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.displayName || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  )
}
