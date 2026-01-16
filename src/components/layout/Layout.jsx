import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import TopNav from './TopNav'
import MobileNav from './MobileNav'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Gradient mesh background */}
      <div className="gradient-mesh" />

      {/* Top Navigation - Desktop */}
      <div className="hidden md:block">
        <TopNav />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 safe-top bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-bold text-sm">IO</span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              IGNIS<span className="text-orange-500">OS</span>
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <main className="pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 pb-8 min-h-screen max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
