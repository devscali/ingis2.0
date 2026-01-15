import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Kanban,
  Plus,
  X,
  Calendar,
  CheckSquare,
  Trash2,
  Edit3,
  Flame,
  Sparkles,
  Search,
  Zap,
  ArrowRight
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { db } from '../lib/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, where } from 'firebase/firestore'

const defaultColumns = [
  { id: 'planning', title: 'Planificación', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-500' },
  { id: 'frontend', title: 'Frontend', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500' },
  { id: 'backend', title: 'Backend', color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-500' },
  { id: 'qa', title: 'Q.A.', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-500' },
  { id: 'completed', title: 'Completado', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500' },
]

const priorityOptions = [
  { value: 'alta', label: 'Alta', color: 'text-red-400', bg: 'bg-red-500', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'media', label: 'Media', color: 'text-yellow-400', bg: 'bg-yellow-500', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'baja', label: 'Baja', color: 'text-green-400', bg: 'bg-green-500', badge: 'bg-green-500/20 text-green-400 border-green-500/30' },
]

export default function ProjectHub() {
  const [tasks, setTasks] = useState([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'media',
    assignee: '',
    dueDate: '',
    column: 'planning',
  })

  const { user } = useAuthStore()
  const { teamMembers } = useSettingsStore()

  // Load tasks
  useEffect(() => {
    if (!user?.uid) return

    const q = query(collection(db, 'kanban_tasks'), where('userId', '==', user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTasks(tasksData)
    })
    return () => unsubscribe()
  }, [user?.uid])

  // Task CRUD
  const openNewTaskModal = (column = 'planning') => {
    setEditingTask(null)
    setTaskForm({
      title: '',
      description: '',
      priority: 'media',
      assignee: '',
      dueDate: '',
      column,
    })
    setShowTaskModal(true)
  }

  const openEditTaskModal = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'media',
      assignee: task.assignee || '',
      dueDate: task.dueDate || '',
      column: task.column || 'planning',
    })
    setShowTaskModal(true)
  }

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) return

    if (editingTask) {
      await updateDoc(doc(db, 'kanban_tasks', editingTask.id), {
        ...taskForm,
        updatedAt: new Date().toISOString()
      })
    } else {
      await addDoc(collection(db, 'kanban_tasks'), {
        userId: user.uid,
        ...taskForm,
        createdAt: new Date().toISOString()
      })
    }

    closeTaskModal()
  }

  const closeTaskModal = () => {
    setShowTaskModal(false)
    setEditingTask(null)
    setTaskForm({
      title: '',
      description: '',
      priority: 'media',
      assignee: '',
      dueDate: '',
      column: 'planning',
    })
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('¿Eliminar esta tarea?')) return
    await deleteDoc(doc(db, 'kanban_tasks', taskId))
  }

  const handleMoveTask = async (taskId, newColumn) => {
    await updateDoc(doc(db, 'kanban_tasks', taskId), {
      column: newColumn,
      updatedAt: new Date().toISOString()
    })
  }

  const getTasksByColumn = (columnId) => {
    return tasks.filter(t => {
      const matchesColumn = t.column === columnId
      const matchesSearch = !searchTerm ||
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesColumn && matchesSearch
    })
  }

  const getMember = (id) => teamMembers.find(m => m.id === id)

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.column === 'completed').length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Kanban className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              Project Hub
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            </h1>
            <p className="text-white/50">Tablero Kanban para tus tareas</p>
          </div>
        </div>

        <button
          onClick={() => openNewTaskModal()}
          className="btn-accent flex items-center gap-2 py-3 px-5 self-start"
        >
          <Plus className="w-5 h-5" />
          Nueva Tarea
        </button>
      </div>

      {/* Stats & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-4 sm:gap-5 flex-1">
          <div className="bg-dark-700/80 border border-white/5 rounded-xl p-4 flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Kanban className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalTasks}</p>
              <p className="text-white/50 text-xs">Total</p>
            </div>
          </div>
          <div className="bg-dark-700/80 border border-white/5 rounded-xl p-4 flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center relative">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <Sparkles className="w-3 h-3 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <p className="text-xl font-bold">{completedTasks}</p>
              <p className="text-white/50 text-xs">Completadas</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tareas..."
            className="w-full bg-dark-700/80 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Team */}
      {teamMembers.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs text-white/40 uppercase tracking-widest">Equipo</span>
          <div className="flex flex-wrap items-center gap-2">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-dark-700/80 border border-white/5 rounded-xl px-3 py-2 flex items-center gap-2"
              >
                <div className={`w-8 h-8 rounded-lg ${member.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {member.name[0]}
                </div>
                <span className="text-sm">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {defaultColumns.map((column) => {
          const columnTasks = getTasksByColumn(column.id)
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-72 lg:w-80"
            >
              {/* Column Header */}
              <div className="bg-dark-700/80 border border-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${column.color} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                    {column.title[0]}
                  </div>
                  <h3 className="font-semibold flex-1">{column.title}</h3>
                  <span className="text-white/40 text-sm bg-dark-600 px-2 py-0.5 rounded-lg">{columnTasks.length}</span>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[300px]">
                {columnTasks.length === 0 ? (
                  <div
                    onClick={() => openNewTaskModal(column.id)}
                    className="bg-dark-700/50 border border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-white/20 hover:bg-dark-700/80 transition-all group"
                  >
                    <Plus className="w-6 h-6 text-white/20 mx-auto mb-2 group-hover:text-white/40 transition-colors" />
                    <p className="text-white/30 text-sm group-hover:text-white/50 transition-colors">Agregar tarea</p>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const assignee = getMember(task.assignee)
                    const priority = priorityOptions.find(p => p.value === task.priority)
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-dark-700/80 border border-white/5 rounded-xl p-4 cursor-pointer hover:border-white/10 transition-all group"
                        onClick={() => openEditTaskModal(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium flex-1 pr-2">{task.title}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTask(task.id)
                            }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-sm text-white/50 mb-3 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {assignee && (
                              <div className={`w-6 h-6 rounded-lg ${assignee.color} flex items-center justify-center text-white text-xs font-bold`}>
                                {assignee.name[0]}
                              </div>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-white/40 flex items-center gap-1 bg-dark-600 px-2 py-1 rounded-lg">
                                <Calendar className="w-3 h-3" />
                                {task.dueDate}
                              </span>
                            )}
                          </div>
                          {priority && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${priority.badge}`}>
                              {priority.label}
                            </span>
                          )}
                        </div>

                        {/* Move buttons */}
                        <div className="flex gap-1 mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {defaultColumns.filter(c => c.id !== column.id).map((col) => (
                            <button
                              key={col.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveTask(task.id, col.id)
                              }}
                              className={`flex-1 py-1.5 text-xs rounded-lg ${col.bg}/20 hover:${col.bg}/40 transition-colors flex items-center justify-center gap-1`}
                            >
                              <ArrowRight className="w-3 h-3" />
                              {col.title[0]}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeTaskModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center relative">
                    {editingTask ? <Edit3 className="w-5 h-5 text-purple-400" /> : <Zap className="w-5 h-5 text-purple-400" />}
                    <Sparkles className="w-3 h-3 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                    <p className="text-sm text-white/50">Project Hub</p>
                  </div>
                </div>
                <button
                  onClick={closeTaskModal}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="¿Qué hay que hacer?"
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Detalles de la tarea..."
                    rows={3}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                      Prioridad
                    </label>
                    <div className="flex gap-2">
                      {priorityOptions.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setTaskForm({ ...taskForm, priority: p.value })}
                          className={`flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                            taskForm.priority === p.value
                              ? `${p.bg} text-white`
                              : 'bg-dark-700 border border-white/10 hover:bg-white/5'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                      Columna
                    </label>
                    <select
                      value={taskForm.column}
                      onChange={(e) => setTaskForm({ ...taskForm, column: e.target.value })}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    >
                      {defaultColumns.map((col) => (
                        <option key={col.id} value={col.id}>{col.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                      Asignar a
                    </label>
                    <select
                      value={taskForm.assignee}
                      onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    >
                      <option value="">Sin asignar</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                      Fecha límite
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={closeTaskModal}
                    className="flex-1 bg-dark-700 border border-white/10 rounded-xl py-3.5 font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveTask}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 rounded-xl py-3.5 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    {editingTask ? 'Guardar' : 'Crear Tarea'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
