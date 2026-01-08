import { motion } from 'framer-motion'

export function Card({ children, className = '', hover = true, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4 } : {}}
      onClick={onClick}
      className={`
        glass-card
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

export function StatCard({ icon: Icon, value, label, color = 'orange' }) {
  const colors = {
    orange: 'from-orange-500/20 to-orange-600/10 text-orange-400',
    green: 'from-green-500/20 to-green-600/10 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-400',
    red: 'from-red-500/20 to-red-600/10 text-red-400',
  }

  return (
    <Card hover={false}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl sm:text-3xl font-bold">{value}</p>
          <p className="text-xs sm:text-sm text-white/50 truncate">{label}</p>
        </div>
      </div>
    </Card>
  )
}

export function QuickAction({ icon: Icon, title, description, onClick }) {
  return (
    <Card onClick={onClick} className="text-center">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
      </div>
      <h3 className="font-semibold mb-0.5 sm:mb-1 text-sm sm:text-base">{title}</h3>
      <p className="text-xs sm:text-sm text-white/50">{description}</p>
    </Card>
  )
}
