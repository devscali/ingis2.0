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
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 glass-sidebar px-4 py-3 safe-top">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold">
              Ignis<span className="text-orange-500">OS</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-5 py-8 sm:px-8 sm:py-10 lg:pl-12 lg:pr-10 xl:pl-16 xl:pr-12 lg:py-10 pt-24 lg:pt-10 min-h-screen max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
