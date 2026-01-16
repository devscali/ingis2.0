import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Flame,
  Upload,
  MessageSquare,
  FolderOpen,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Wrench,
  CalendarDays,
  CheckSquare,
  Kanban,
  Type
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const mainNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/torch', icon: Flame, label: 'TorchAI' },
  { path: '/ops', icon: CalendarDays, label: 'Ops' },
  { path: '/projects', icon: Kanban, label: 'Projects' },
]

const moreItems = [
  { path: '/quality', icon: CheckSquare, label: 'Control de Calidad' },
  { path: '/maintenance', icon: Wrench, label: 'Mantenimiento' },
  { path: '/fonts', icon: Type, label: 'Font Mixer' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function TopNav() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 safe-top">
      <div className="mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">
                IGNIS<span className="text-orange-500">OS</span>
              </span>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Calidevs Intel</p>
            </div>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <FolderOpen className="w-4 h-4" />
                Más
                <ChevronDown className={`w-3 h-3 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
              </button>

              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute top-full mt-2 right-0 w-56 bg-dark-800/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 z-50 shadow-2xl">
                    {moreItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setShowMoreMenu(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                            isActive
                              ? 'bg-orange-500/20 text-orange-500'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Sun className="w-5 h-5 text-white/60" />
            </button>

            {/* Notifications */}
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-sm">
                  {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute top-full mt-2 right-0 w-56 bg-dark-800/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 z-50 shadow-2xl">
                    <div className="px-4 py-3 border-b border-white/10 mb-2">
                      <p className="font-semibold text-sm">{user?.displayName || user?.email?.split('@')[0]}</p>
                      <p className="text-xs text-white/50 truncate">{user?.email}</p>
                    </div>
                    <NavLink
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      Configuración
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
