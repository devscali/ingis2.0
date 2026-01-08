import { motion, AnimatePresence } from 'framer-motion'
import { Check, Calendar, User, Users, ClipboardList, Circle, AlertCircle, CheckCircle } from 'lucide-react'

export function TaskList({ tasks, onToggle, showCompleted = false, viewMode = 'list' }) {
  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  if (tasks.length === 0) {
    return (
      <div className="glass-card text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-white/30" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Sin pendientes</h3>
        <p className="text-white/50 text-sm sm:text-base">Captura una nota para crear tareas</p>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <AnimatePresence>
          {activeTasks.map((task, index) => (
            <TaskCard key={`${task.sessionId}-${task.taskIndex}`} task={task} onToggle={onToggle} index={index} />
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          Mis Pendientes
        </h3>
        <span className="text-xs sm:text-sm text-white/50">
          {activeTasks.length} pendientes · {completedTasks.length} completadas
        </span>
      </div>

      {/* Task List */}
      <div className="glass rounded-xl sm:rounded-2xl overflow-hidden divide-y divide-white/5">
        <AnimatePresence>
          {activeTasks.map((task, index) => (
            <TaskItem key={`${task.sessionId}-${task.taskIndex}`} task={task} onToggle={onToggle} index={index} />
          ))}
          {showCompleted && completedTasks.slice(0, 5).map((task, index) => (
            <TaskItem
              key={`${task.sessionId}-${task.taskIndex}-completed`}
              task={task}
              onToggle={onToggle}
              index={activeTasks.length + index}
              completed
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle, index, completed = false }) {
  const urgencyColors = {
    'Alta': 'border-red-500',
    'Media': 'border-yellow-500',
    'Baja': 'border-green-500',
  }

  const urgencyBadgeColors = {
    'Alta': 'bg-red-500/20 text-red-400',
    'Media': 'bg-yellow-500/20 text-yellow-400',
    'Baja': 'bg-green-500/20 text-green-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onToggle(task.sessionId, task.taskIndex)}
      className={`
        flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-all duration-200
        hover:bg-white/5
        ${completed ? 'opacity-50' : ''}
      `}
    >
      {/* Checkbox */}
      <div
        className={`
          w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5 sm:mt-0
          ${completed ? 'bg-green-500 border-green-500' : urgencyColors[task.urgency] || 'border-white/20'}
        `}
      >
        {completed && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm sm:text-base ${completed ? 'line-through text-white/40' : ''}`}>
          {task.description}
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.client}
          </span>
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </span>
          )}
          {task.responsibles?.length > 0 && (
            <span className="flex items-center gap-1 hidden sm:flex">
              <Users className="w-3 h-3" />
              {task.responsibles.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Urgency Badge */}
      {!completed && (
        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-xs font-semibold flex-shrink-0 ${urgencyBadgeColors[task.urgency]}`}>
          {task.urgency}
        </span>
      )}
    </motion.div>
  )
}

function TaskCard({ task, onToggle, index }) {
  const urgencyColors = {
    'Alta': 'border-l-red-500',
    'Media': 'border-l-yellow-500',
    'Baja': 'border-l-green-500',
  }

  const UrgencyIcon = ({ urgency }) => {
    const iconClass = {
      'Alta': 'text-red-400',
      'Media': 'text-yellow-400',
      'Baja': 'text-green-400',
    }
    return <Circle className={`w-6 h-6 fill-current ${iconClass[urgency]}`} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onToggle(task.sessionId, task.taskIndex)}
      className={`
        glass-card border-l-4 ${urgencyColors[task.urgency]}
        cursor-pointer
      `}
    >
      <div className="flex items-start gap-3 mb-3">
        <UrgencyIcon urgency={task.urgency} />
        <div>
          <h4 className="font-semibold">{task.description}</h4>
          <p className="text-sm text-white/50 flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.client}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm text-white/40">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {task.dueDate || 'Sin fecha'}
        </span>
        <span className="badge badge-warning">{task.urgency}</span>
      </div>
    </motion.div>
  )
}
