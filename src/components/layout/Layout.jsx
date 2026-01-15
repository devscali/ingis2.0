import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Gradient mesh background */}
      <div className="gradient-mesh" />

      {/* Sidebar - always visible on desktop */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>
        <Sidebar
          isOpen={true}
          onClose={() => {}}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={false}
          onToggleCollapse={() => {}}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 glass-sidebar p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold">
              Ignis<span className="text-orange-500">OS</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 sm:p-10 lg:pl-20 lg:pr-16 xl:pl-28 xl:pr-24 lg:py-14 pt-24 lg:pt-14 min-h-screen max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
