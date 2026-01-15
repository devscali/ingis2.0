import { motion } from 'framer-motion'
import FireCard from './FireCard'

export function Card({ children, className = '', hover = true, onClick, fire = false }) {
  if (fire) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={hover ? { y: -4 } : {}}
        onClick={onClick}
        className={onClick ? 'cursor-pointer' : ''}
      >
        <FireCard intensity="subtle" className={className}>
          <div className="p-5">{children}</div>
        </FireCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4 } : {}}
      onClick={onClick}
      className={`
        bg-dark-700/80 border border-white/5 rounded-2xl p-5
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

export function StatCard({ icon: Icon, value, label, color = 'orange', fire = true }) {
  const colors = {
    orange: 'from-orange-500/20 to-orange-600/10 text-orange-400',
    green: 'from-green-500/20 to-green-600/10 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-400',
    red: 'from-red-500/20 to-red-600/10 text-red-400',
  }

  const fireColors = {
    orange: '#FF6B35',
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#a855f7',
    red: '#ef4444',
  }

  if (fire) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FireCard intensity="medium" color={fireColors[color]}>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm text-white/50 truncate mt-1">{label}</p>
              </div>
            </div>
          </div>
        </FireCard>
      </motion.div>
    )
  }

  return (
    <Card hover={false}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-white/50 truncate mt-1">{label}</p>
        </div>
      </div>
    </Card>
  )
}

export function QuickAction({ icon: Icon, title, description, onClick, fire = true }) {
  if (fire) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        <FireCard intensity="medium">
          <div className="p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mx-auto mb-4">
              <Icon className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-white/50">{description}</p>
          </div>
        </FireCard>
      </motion.div>
    )
  }

  return (
    <Card onClick={onClick} className="text-center">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-orange-400" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/50">{description}</p>
    </Card>
  )
}
