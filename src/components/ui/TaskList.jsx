import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Calendar, User, Users, ClipboardList, Circle, Edit3, Trash2, X, Save } from 'lucide-react'
import { useTasksStore } from '../../store/tasksStore'
import { useAuthStore } from '../../store/authStore'

const urgencyOptions = ['Alta', 'Media', 'Baja']
const teamMembers = ['Carlos Armando', 'Sara', 'Ian', 'JC', 'Marlene', 'Papa', 'Vladimir', 'Jesus Lerma']

export function TaskList({ tasks, onToggle, showCompleted = false, viewMode = 'list' }) {
  const [editingTask, setEditingTask] = useState(null)
  const { user } = useAuthStore()
  const { updateTask, deleteTask } = useTasksStore()

  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  const handleEdit = (task, e) => {
    e.stopPropagation()
    setEditingTask({
      ...task,
      responsibles: task.responsibles || []
    })
  }

  const handleDelete = async (task, e) => {
    e.stopPropagation()
    if (confirm('¿Eliminar esta tarea?')) {
      await deleteTask(user.uid, task.sessionId, task.taskIndex)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingTask) return

    await updateTask(user.uid, editingTask.sessionId, editingTask.taskIndex, {
      description: editingTask.description,
      client: editingTask.client,
      urgency: editingTask.urgency,
      dueDate: editingTask.dueDate,
      responsibles: editingTask.responsibles
    })
    setEditingTask(null)
  }

  const toggleResponsible = (name) => {
    if (!editingTask) return
    const responsibles = editingTask.responsibles || []
    if (responsibles.includes(name)) {
      setEditingTask({ ...editingTask, responsibles: responsibles.filter(r => r !== name) })
    } else {
      setEditingTask({ ...editingTask, responsibles: [...responsibles, name] })
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="glass-card text-center py-12 sm:py-16">
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
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <AnimatePresence>
            {activeTasks.map((task, index) => (
              <TaskCard
                key={`${task.sessionId}-${task.taskIndex}`}
                task={task}
                onToggle={onToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Edit Modal */}
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveEdit}
          onChange={setEditingTask}
          toggleResponsible={toggleResponsible}
        />
      </>
    )
  }

  return (
    <>
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
              <TaskItem
                key={`${task.sessionId}-${task.taskIndex}`}
                task={task}
                onToggle={onToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                index={index}
              />
            ))}
            {showCompleted && completedTasks.slice(0, 5).map((task, index) => (
              <TaskItem
                key={`${task.sessionId}-${task.taskIndex}-completed`}
                task={task}
                onToggle={onToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                index={activeTasks.length + index}
                completed
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Modal */}
      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
        onChange={setEditingTask}
        toggleResponsible={toggleResponsible}
      />
    </>
  )
}

function EditTaskModal({ task, onClose, onSave, onChange, toggleResponsible }) {
  if (!task) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-full max-w-lg p-6 sm:p-8 my-4 sm:my-0"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              Editar Tarea
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Descripción */}
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                Descripción
              </label>
              <textarea
                value={task.description || ''}
                onChange={(e) => onChange({ ...task, description: e.target.value })}
                className="glass-input w-full h-24 resize-none py-3 text-sm sm:text-base"
                placeholder="¿Qué hay que hacer?"
              />
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                Cliente
              </label>
              <input
                type="text"
                value={task.client || ''}
                onChange={(e) => onChange({ ...task, client: e.target.value })}
                className="glass-input w-full py-3 text-sm sm:text-base"
                placeholder="Nombre del cliente"
              />
            </div>

            {/* Prioridad y Fecha */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                  Prioridad
                </label>
                <div className="flex gap-1">
                  {urgencyOptions.map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => onChange({ ...task, urgency: urg })}
                      className={`flex-1 px-2 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        task.urgency === urg
                          ? urg === 'Alta' ? 'bg-red-500 text-white'
                            : urg === 'Media' ? 'bg-yellow-500 text-white'
                            : 'bg-green-500 text-white'
                          : 'glass hover:bg-white/10'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                  Fecha
                </label>
                <input
                  type="text"
                  value={task.dueDate || ''}
                  onChange={(e) => onChange({ ...task, dueDate: e.target.value })}
                  className="glass-input w-full py-2.5 text-sm"
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>

            {/* Responsables */}
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                Responsables
              </label>
              <div className="flex flex-wrap gap-2">
                {teamMembers.map((member) => (
                  <button
                    key={member}
                    type="button"
                    onClick={() => toggleResponsible(member)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      task.responsibles?.includes(member)
                        ? 'bg-blue-500 text-white'
                        : 'glass hover:bg-white/10'
                    }`}
                  >
                    {member.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 glass-button py-3 text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                onClick={onSave}
                className="flex-1 btn-accent py-3 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function TaskItem({ task, onToggle, onEdit, onDelete, index, completed = false }) {
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
      className={`
        flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-all duration-200
        hover:bg-white/5 group
        ${completed ? 'opacity-50' : ''}
      `}
    >
      {/* Checkbox */}
      <div
        onClick={() => onToggle(task.sessionId, task.taskIndex)}
        className={`
          w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5 sm:mt-0 cursor-pointer
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

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => onEdit(task, e)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Editar"
        >
          <Edit3 className="w-4 h-4 text-white/50" />
        </button>
        <button
          onClick={(e) => onDelete(task, e)}
          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4 text-red-400/50" />
        </button>
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

function TaskCard({ task, onToggle, onEdit, onDelete, index }) {
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
      className={`
        glass-card border-l-4 ${urgencyColors[task.urgency]}
        group relative
      `}
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => onEdit(task, e)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          title="Editar"
        >
          <Edit3 className="w-4 h-4 text-white/50" />
        </button>
        <button
          onClick={(e) => onDelete(task, e)}
          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4 text-red-400/50" />
        </button>
      </div>

      <div
        onClick={() => onToggle(task.sessionId, task.taskIndex)}
        className="cursor-pointer"
      >
        <div className="flex items-start gap-3 mb-3">
          <UrgencyIcon urgency={task.urgency} />
          <div>
            <h4 className="font-semibold pr-16">{task.description}</h4>
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
      </div>
    </motion.div>
  )
}
