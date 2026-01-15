import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  Calendar,
  Users,
  CheckSquare,
  Square,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  MoreHorizontal,
  GripVertical,
  Circle
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { db } from '../lib/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, where } from 'firebase/firestore'

const weekDays = [
  { id: 'cuentas', label: 'Cuentas', color: '#64748b' },
  { id: 'lunes', label: 'Lunes', color: '#ef4444' },
  { id: 'martes', label: 'Martes', color: '#f97316' },
  { id: 'miercoles', label: 'Miércoles', color: '#eab308' },
  { id: 'jueves', label: 'Jueves', color: '#22c55e' },
  { id: 'viernes', label: 'Viernes', color: '#3b82f6' },
]

const statusOptions = [
  { value: 'sin_empezar', label: 'Sin empezar', color: '#6b7280', bg: 'bg-gray-500/10', text: 'text-gray-400' },
  { value: 'en_progreso', label: 'En progreso', color: '#eab308', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  { value: 'listo', label: 'Listo', color: '#22c55e', bg: 'bg-green-500/10', text: 'text-green-400' },
]

const pressureOptions = [
  { value: 'baja', label: 'Baja', color: '#22c55e' },
  { value: 'moderada', label: 'Media', color: '#eab308' },
  { value: 'alta', label: 'Alta', color: '#ef4444' },
]

export default function WeeklyOps() {
  const [tasks, setTasks] = useState([])
  const [weeks, setWeeks] = useState([])
  const [currentWeek, setCurrentWeek] = useState(null)
  const [showNewTask, setShowNewTask] = useState(false)
  const [showTaskDetail, setShowTaskDetail] = useState(null)
  const [selectedDay, setSelectedDay] = useState('lunes')
  const [newComment, setNewComment] = useState('')
  const [newSubtask, setNewSubtask] = useState('')

  const [taskForm, setTaskForm] = useState({
    title: '',
    day: 'lunes',
    responsibles: [],
    status: 'sin_empezar',
    pressure: '',
    dueDate: '',
    subtasks: [],
    comments: []
  })

  const { user } = useAuthStore()
  const { teamMembers } = useSettingsStore()

  // Get current week string
  const getWeekString = (date = new Date()) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - d.getDay() + 1)
    const month = d.toLocaleString('es-MX', { month: 'short' })
    const day = d.getDate()
    const endDay = day + 6
    return `${day} - ${endDay} ${month}`
  }

  // Load weeks
  useEffect(() => {
    if (!user?.uid) return

    const q = query(collection(db, 'weekly_ops_weeks'), where('userId', '==', user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setWeeks(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))

      const currentWeekStr = getWeekString()
      const existingWeek = data.find(w => w.name === currentWeekStr)
      if (existingWeek) {
        setCurrentWeek(existingWeek)
      } else if (data.length > 0) {
        setCurrentWeek(data[0])
      }
    })
    return () => unsubscribe()
  }, [user?.uid])

  useEffect(() => {
    if (user?.uid && weeks.length === 0) {
      createWeek(getWeekString())
    }
  }, [user?.uid, weeks.length])

  useEffect(() => {
    if (!currentWeek?.id) return

    const q = query(collection(db, 'weekly_ops_tasks'), where('weekId', '==', currentWeek.id))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTasks(data)
    })
    return () => unsubscribe()
  }, [currentWeek?.id])

  const createWeek = async (name) => {
    const newWeek = await addDoc(collection(db, 'weekly_ops_weeks'), {
      userId: user.uid,
      name,
      createdAt: new Date().toISOString()
    })
    setCurrentWeek({ id: newWeek.id, name })
  }

  const handleNewWeek = async () => {
    const name = prompt('Nombre de la semana:', getWeekString())
    if (name) await createWeek(name)
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!taskForm.title.trim() || !currentWeek?.id) return

    await addDoc(collection(db, 'weekly_ops_tasks'), {
      weekId: currentWeek.id,
      ...taskForm,
      createdAt: new Date().toISOString()
    })

    setTaskForm({
      title: '',
      day: selectedDay,
      responsibles: [],
      status: 'sin_empezar',
      pressure: '',
      dueDate: '',
      subtasks: [],
      comments: []
    })
    setShowNewTask(false)
  }

  const handleUpdateTask = async (taskId, updates) => {
    await updateDoc(doc(db, 'weekly_ops_tasks', taskId), {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Eliminar esta tarea?')) return
    await deleteDoc(doc(db, 'weekly_ops_tasks', taskId))
    setShowTaskDetail(null)
  }

  const handleToggleSubtask = async (task, index) => {
    const newSubtasks = [...(task.subtasks || [])]
    newSubtasks[index].completed = !newSubtasks[index].completed
    await handleUpdateTask(task.id, { subtasks: newSubtasks })
  }

  const handleAddSubtask = async (task) => {
    if (!newSubtask.trim()) return
    const newSubtasks = [...(task.subtasks || []), {
      text: newSubtask,
      completed: false
    }]
    await handleUpdateTask(task.id, { subtasks: newSubtasks })
    setNewSubtask('')
  }

  const handleAddComment = async (task) => {
    if (!newComment.trim()) return
    const newComments = [...(task.comments || []), {
      text: newComment,
      author: user.displayName || user.email,
      createdAt: new Date().toISOString()
    }]
    await handleUpdateTask(task.id, { comments: newComments })
    setNewComment('')
  }

  const getTasksByDay = (day) => tasks.filter(t => t.day === day)
  const getMember = (id) => teamMembers.find(m => m.id === id)

  const toggleResponsible = (memberId) => {
    const current = taskForm.responsibles || []
    if (current.includes(memberId)) {
      setTaskForm({ ...taskForm, responsibles: current.filter(id => id !== memberId) })
    } else {
      setTaskForm({ ...taskForm, responsibles: [...current, memberId] })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header - Clean and minimal */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Weekly Operations</h1>
          <p className="text-sm text-white/40 mt-2">{currentWeek?.name || 'Esta semana'}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleNewWeek}
            className="px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Cambiar semana
          </button>
          <button
            onClick={() => {
              setSelectedDay('lunes')
              setShowNewTask(true)
            }}
            className="px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva tarea
          </button>
        </div>
      </div>

      {/* Kanban Board - Clean card-based columns */}
      <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        {weekDays.map((day) => {
          const dayTasks = getTasksByDay(day.id)
          const totalTasks = dayTasks.length
          const completedTasks = dayTasks.filter(t => t.status === 'listo').length

          return (
            <div key={day.id} className="flex-shrink-0 w-64 lg:w-72">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: day.color }}
                  />
                  <span className="text-sm font-medium text-white/80">{day.label}</span>
                  <span className="text-xs text-white/30 tabular-nums">
                    {completedTasks}/{totalTasks}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedDay(day.id)
                    setTaskForm({ ...taskForm, day: day.id })
                    setShowNewTask(true)
                  }}
                  className="p-2 hover:bg-white/5 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-white/30" />
                </button>
              </div>

              {/* Tasks Column */}
              <div className="space-y-3 min-h-[400px] bg-white/[0.02] rounded-xl p-3">
                {dayTasks.map((task) => {
                  const status = statusOptions.find(s => s.value === task.status)
                  const pressure = pressureOptions.find(p => p.value === task.pressure)
                  const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length
                  const totalSubtasks = (task.subtasks || []).length

                  return (
                    <motion.div
                      key={task.id}
                      layoutId={task.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setShowTaskDetail(task)}
                      className="bg-dark-700/80 hover:bg-dark-600/80 border border-white/5 hover:border-white/10 rounded-lg p-3 cursor-pointer transition-all group"
                    >
                      {/* Title */}
                      <p className="text-sm font-medium text-white/90 mb-2 leading-snug">
                        {task.title}
                      </p>

                      {/* Responsibles - Compact avatars */}
                      {task.responsibles?.length > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          {task.responsibles.slice(0, 3).map((memberId) => {
                            const member = getMember(memberId)
                            if (!member) return null
                            return (
                              <div
                                key={memberId}
                                className={`w-5 h-5 rounded-full ${member.color} flex items-center justify-center text-[9px] text-white font-medium`}
                                title={member.name}
                              >
                                {member.name[0]}
                              </div>
                            )
                          })}
                          {task.responsibles.length > 3 && (
                            <span className="text-[10px] text-white/40 ml-1">
                              +{task.responsibles.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bottom row - Status & metadata */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Status */}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${status?.bg} ${status?.text}`}>
                            {status?.label}
                          </span>

                          {/* Pressure indicator */}
                          {pressure && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: pressure.color }}
                              title={`Prioridad ${pressure.label}`}
                            />
                          )}
                        </div>

                        {/* Subtasks count */}
                        {totalSubtasks > 0 && (
                          <span className="text-[10px] text-white/30 flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" />
                            {completedSubtasks}/{totalSubtasks}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}

                {/* Empty state */}
                {dayTasks.length === 0 && (
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-xs text-white/20">Sin tareas</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* New Task Modal - Clean and minimal */}
      <AnimatePresence>
        {showNewTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowNewTask(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-800 border border-white/10 rounded-xl w-full max-w-lg p-6 my-8 sm:my-0"
            >
              <h2 className="text-lg font-semibold mb-6">Nueva tarea</h2>

              <form onSubmit={handleAddTask} className="space-y-5">
                {/* Title */}
                <div>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Nombre de la tarea"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>

                {/* Day */}
                <div>
                  <label className="block text-xs text-white/40 mb-2">Día</label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setTaskForm({ ...taskForm, day: d.id })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          taskForm.day === d.id
                            ? 'text-white'
                            : 'text-white/50 hover:text-white/70 bg-white/5'
                        }`}
                        style={taskForm.day === d.id ? { backgroundColor: d.color } : {}}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Responsibles */}
                <div>
                  <label className="block text-xs text-white/40 mb-2">Responsables</label>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleResponsible(member.id)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          taskForm.responsibles?.includes(member.id)
                            ? `${member.color} text-white`
                            : 'bg-white/5 text-white/50 hover:text-white/70'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${member.color} flex items-center justify-center text-[8px] text-white font-bold`}>
                          {member.name[0]}
                        </div>
                        {member.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs text-white/40 mb-2">Estado</label>
                  <div className="flex gap-2">
                    {statusOptions.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setTaskForm({ ...taskForm, status: s.value })}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          taskForm.status === s.value
                            ? `${s.bg} ${s.text} ring-1 ring-current`
                            : 'bg-white/5 text-white/50 hover:text-white/70'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs text-white/40 mb-2">Prioridad</label>
                  <div className="flex gap-2">
                    {pressureOptions.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setTaskForm({ ...taskForm, pressure: taskForm.pressure === p.value ? '' : p.value })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          taskForm.pressure === p.value
                            ? 'ring-1'
                            : 'bg-white/5 text-white/50 hover:text-white/70'
                        }`}
                        style={taskForm.pressure === p.value ? { color: p.color, borderColor: p.color } : {}}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTask(false)}
                    className="flex-1 px-4 py-2.5 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Crear tarea
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {showTaskDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowTaskDetail(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-800 border border-white/10 rounded-xl w-full max-w-xl p-6 my-8 sm:my-0"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-lg font-semibold pr-4">{showTaskDetail.title}</h2>
                <button
                  onClick={() => setShowTaskDetail(null)}
                  className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              {/* Properties */}
              <div className="space-y-4 mb-6">
                {/* Day */}
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/40 w-24">Día</span>
                  <div className="flex gap-1">
                    {weekDays.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          handleUpdateTask(showTaskDetail.id, { day: d.id })
                          setShowTaskDetail({ ...showTaskDetail, day: d.id })
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                          showTaskDetail.day === d.id ? 'text-white' : 'text-white/30 hover:text-white/50'
                        }`}
                        style={showTaskDetail.day === d.id ? { backgroundColor: d.color } : {}}
                      >
                        {d.label.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Responsibles */}
                <div className="flex items-start gap-4">
                  <span className="text-xs text-white/40 w-24 pt-1">Responsables</span>
                  <div className="flex flex-wrap gap-1 flex-1">
                    {teamMembers.map((member) => {
                      const isSelected = showTaskDetail.responsibles?.includes(member.id)
                      return (
                        <button
                          key={member.id}
                          onClick={() => {
                            const current = showTaskDetail.responsibles || []
                            const newResp = isSelected
                              ? current.filter(id => id !== member.id)
                              : [...current, member.id]
                            handleUpdateTask(showTaskDetail.id, { responsibles: newResp })
                            setShowTaskDetail({ ...showTaskDetail, responsibles: newResp })
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                            isSelected ? `${member.color} text-white` : 'bg-white/5 text-white/40 hover:text-white/60'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full ${member.color} flex items-center justify-center text-[8px] text-white`}>
                            {member.name[0]}
                          </div>
                          {member.name.split(' ')[0]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/40 w-24">Estado</span>
                  <div className="flex gap-1">
                    {statusOptions.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => {
                          handleUpdateTask(showTaskDetail.id, { status: s.value })
                          setShowTaskDetail({ ...showTaskDetail, status: s.value })
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                          showTaskDetail.status === s.value
                            ? `${s.bg} ${s.text}`
                            : 'bg-white/5 text-white/30 hover:text-white/50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/40 w-24">Prioridad</span>
                  <div className="flex gap-1">
                    {pressureOptions.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => {
                          const newPressure = showTaskDetail.pressure === p.value ? '' : p.value
                          handleUpdateTask(showTaskDetail.id, { pressure: newPressure })
                          setShowTaskDetail({ ...showTaskDetail, pressure: newPressure })
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                          showTaskDetail.pressure === p.value
                            ? 'bg-white/10'
                            : 'bg-white/5 text-white/30 hover:text-white/50'
                        }`}
                        style={showTaskDetail.pressure === p.value ? { color: p.color } : {}}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtasks */}
              <div className="border-t border-white/5 pt-4 mb-4">
                <h3 className="text-xs text-white/40 mb-3">Subtareas</h3>
                <div className="space-y-1 mb-3">
                  {(showTaskDetail.subtasks || []).map((subtask, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                      onClick={() => handleToggleSubtask(showTaskDetail, index)}
                    >
                      {subtask.completed ? (
                        <CheckSquare className="w-4 h-4 text-green-500" />
                      ) : (
                        <Square className="w-4 h-4 text-white/30" />
                      )}
                      <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-white/30' : ''}`}>
                        {subtask.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask(showTaskDetail))}
                    placeholder="Agregar subtarea..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddSubtask(showTaskDetail)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div className="border-t border-white/5 pt-4 mb-4">
                <h3 className="text-xs text-white/40 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" />
                  Comentarios
                </h3>
                <div className="space-y-3 mb-3">
                  {(showTaskDetail.comments || []).map((comment, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                        {comment.author?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm">{comment.text}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {comment.author} · {new Date(comment.createdAt).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment(showTaskDetail))}
                    placeholder="Escribir comentario..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddComment(showTaskDetail)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                  >
                    Enviar
                  </button>
                </div>
              </div>

              {/* Delete */}
              <div className="border-t border-white/5 pt-4">
                <button
                  onClick={() => handleDeleteTask(showTaskDetail.id)}
                  className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Eliminar tarea
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
