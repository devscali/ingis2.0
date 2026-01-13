import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
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
  Clock
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { db } from '../lib/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, where } from 'firebase/firestore'

const weekDays = [
  { id: 'cuentas', label: 'Cuentas', color: 'bg-slate-500' },
  { id: 'lunes', label: 'Lunes', color: 'bg-red-500' },
  { id: 'martes', label: 'Martes', color: 'bg-orange-500' },
  { id: 'miercoles', label: 'Miércoles', color: 'bg-yellow-500' },
  { id: 'jueves', label: 'Jueves', color: 'bg-green-500' },
  { id: 'viernes', label: 'Viernes', color: 'bg-blue-500' },
]

const statusOptions = [
  { value: 'sin_empezar', label: 'Sin empezar', color: 'bg-gray-500', textColor: 'text-gray-300' },
  { value: 'en_progreso', label: 'En progreso', color: 'bg-yellow-500', textColor: 'text-yellow-300' },
  { value: 'listo', label: 'Listo', color: 'bg-green-500', textColor: 'text-green-300' },
]

const pressureOptions = [
  { value: 'baja', label: 'Presión Baja', color: 'bg-green-600' },
  { value: 'moderada', label: 'Presión Moderada', color: 'bg-yellow-600' },
  { value: 'alta', label: 'Presión Alta', color: 'bg-red-600' },
]

const teamMembers = [
  { id: 'carlos', name: 'Carlos Armando', color: 'bg-blue-500' },
  { id: 'leslie', name: 'Leslie Marlene Morales Hilario', color: 'bg-pink-500' },
  { id: 'sara', name: 'Sara Esther Valenzuela Torres', color: 'bg-purple-500' },
  { id: 'vladimir', name: 'Vladimir', color: 'bg-indigo-500' },
  { id: 'ian', name: 'Ian Andrade', color: 'bg-green-500' },
  { id: 'jesus', name: 'Jesus Lerma', color: 'bg-orange-500' },
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
    icon: '',
    day: 'lunes',
    responsibles: [],
    status: 'sin_empezar',
    pressure: '',
    dueDate: '',
    semaforo: '',
    subtasks: [],
    comments: []
  })

  const { user } = useAuthStore()

  // Get current week string
  const getWeekString = (date = new Date()) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - d.getDay() + 1) // Monday
    const month = d.toLocaleString('es-MX', { month: 'long' })
    const weekNum = Math.ceil(d.getDate() / 7)
    return `Semana ${weekNum} ${month.charAt(0).toUpperCase() + month.slice(1)}`
  }

  // Load weeks
  useEffect(() => {
    if (!user?.uid) return

    const q = query(collection(db, 'weekly_ops_weeks'), where('userId', '==', user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setWeeks(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))

      // Set current week or create one
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

  // Create week if needed
  useEffect(() => {
    if (user?.uid && weeks.length === 0) {
      createWeek(getWeekString())
    }
  }, [user?.uid, weeks.length])

  // Load tasks for current week
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
    if (name) {
      await createWeek(name)
    }
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
      icon: '',
      day: selectedDay,
      responsibles: [],
      status: 'sin_empezar',
      pressure: '',
      dueDate: '',
      semaforo: '',
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
      completed: false,
      assignee: ''
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
      className="space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Calidevs Ops</h1>
            <p className="text-white/50 text-xs sm:text-sm">Operaciones semanales del equipo</p>
          </div>
        </div>

        {/* Week selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewWeek}
            className="glass px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            {currentWeek?.name || 'Seleccionar semana'}
          </button>
          <button
            onClick={() => {
              setSelectedDay('lunes')
              setShowNewTask(true)
            }}
            className="btn-accent flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {weekDays.map((day) => {
          const dayTasks = getTasksByDay(day.id)
          return (
            <div key={day.id} className="flex-shrink-0 w-56 sm:w-64 lg:w-72">
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${day.color} text-white`}>
                  {day.label}
                </span>
                <span className="text-white/40 text-sm">{dayTasks.length}</span>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[500px]">
                {dayTasks.map((task) => {
                  const status = statusOptions.find(s => s.value === task.status)
                  const pressure = pressureOptions.find(p => p.value === task.pressure)
                  const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length
                  const totalSubtasks = (task.subtasks || []).length

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setShowTaskDetail(task)}
                      className="glass rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all group"
                    >
                      {/* Icon + Title */}
                      <div className="flex items-start gap-2 mb-3">
                        {task.icon && <span className="text-lg">{task.icon}</span>}
                        <h4 className="font-medium flex-1 leading-tight">{task.title}</h4>
                      </div>

                      {/* Responsibles */}
                      {task.responsibles?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.responsibles.map((memberId) => {
                            const member = getMember(memberId)
                            if (!member) return null
                            return (
                              <div
                                key={memberId}
                                className="flex items-center gap-1 text-xs text-white/60"
                              >
                                <div className={`w-5 h-5 rounded-full ${member.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                                  {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <span className="truncate max-w-[100px]">{member.name.split(' ')[0]}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Status */}
                      {status && (
                        <div className="mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color} text-white`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                            {status.label}
                          </span>
                        </div>
                      )}

                      {/* Pressure */}
                      {pressure && (
                        <div className="mb-2">
                          <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${pressure.color} text-white`}>
                            {pressure.label}
                          </span>
                        </div>
                      )}

                      {/* Subtasks progress */}
                      {totalSubtasks > 0 && (
                        <div className="flex items-center gap-2 text-xs text-white/40 mt-2">
                          <CheckSquare className="w-3 h-3" />
                          <span>{completedSubtasks}/{totalSubtasks}</span>
                        </div>
                      )}
                    </motion.div>
                  )
                })}

                {/* Add task button */}
                <button
                  onClick={() => {
                    setSelectedDay(day.id)
                    setTaskForm({ ...taskForm, day: day.id })
                    setShowNewTask(true)
                  }}
                  className="w-full p-3 rounded-xl border-2 border-dashed border-white/10 text-white/30 hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New task
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {showNewTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewTask(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 sm:p-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-10">Nueva Tarea</h2>
              <form onSubmit={handleAddTask} className="space-y-8">
                {/* Title with icon */}
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={taskForm.icon}
                    onChange={(e) => setTaskForm({ ...taskForm, icon: e.target.value })}
                    placeholder="Icon"
                    className="glass-input w-24 text-center text-2xl py-4"
                  />
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Nombre de la tarea"
                    className="glass-input flex-1 py-4"
                    autoFocus
                  />
                </div>

                {/* Day */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-4">Día</label>
                  <select
                    value={taskForm.day}
                    onChange={(e) => setTaskForm({ ...taskForm, day: e.target.value })}
                    className="glass-input w-full py-4"
                  >
                    {weekDays.map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Responsibles */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-4">Responsables</label>
                  <div className="flex flex-wrap gap-3">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleResponsible(member.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          taskForm.responsibles?.includes(member.id)
                            ? `${member.color} text-white`
                            : 'glass hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-white text-sm font-bold`}>
                          {member.name[0]}
                        </div>
                        <span className="text-sm font-medium">{member.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-4">Status</label>
                  <div className="flex gap-3">
                    {statusOptions.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setTaskForm({ ...taskForm, status: s.value })}
                        className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                          taskForm.status === s.value
                            ? `${s.color} text-white`
                            : 'glass hover:bg-white/10'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pressure */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-4">Semáforo Operativo</label>
                  <div className="flex gap-3">
                    {pressureOptions.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setTaskForm({ ...taskForm, pressure: p.value })}
                        className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                          taskForm.pressure === p.value
                            ? `${p.color} text-white`
                            : 'glass hover:bg-white/10'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-4">Fecha límite</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="glass-input w-full py-4"
                  />
                </div>

                <div className="flex gap-4 pt-8">
                  <button
                    type="button"
                    onClick={() => setShowNewTask(false)}
                    className="flex-1 glass-button py-4 text-base"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 btn-accent py-4 text-base">
                    Crear
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTaskDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  {showTaskDetail.icon && (
                    <span className="text-3xl">{showTaskDetail.icon}</span>
                  )}
                  <h2 className="text-2xl font-bold">{showTaskDetail.title}</h2>
                </div>
                <button
                  onClick={() => setShowTaskDetail(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Properties */}
              <div className="space-y-4 mb-6">
                {/* Day */}
                <div className="flex items-center gap-4">
                  <span className="text-white/40 w-32">Etiquetas</span>
                  <select
                    value={showTaskDetail.day}
                    onChange={(e) => {
                      handleUpdateTask(showTaskDetail.id, { day: e.target.value })
                      setShowTaskDetail({ ...showTaskDetail, day: e.target.value })
                    }}
                    className="glass-input"
                  >
                    {weekDays.map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Responsibles */}
                <div className="flex items-start gap-4">
                  <span className="text-white/40 w-32 pt-2">Responsable</span>
                  <div className="flex flex-wrap gap-2 flex-1">
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
                          className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all text-sm ${
                            isSelected ? `${member.color} text-white` : 'glass hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full ${member.color} flex items-center justify-center text-white text-[10px] font-bold`}>
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
                  <span className="text-white/40 w-32">Status</span>
                  <div className="flex gap-2">
                    {statusOptions.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => {
                          handleUpdateTask(showTaskDetail.id, { status: s.value })
                          setShowTaskDetail({ ...showTaskDetail, status: s.value })
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          showTaskDetail.status === s.value
                            ? `${s.color} text-white`
                            : 'glass hover:bg-white/10'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pressure / Semaforo */}
                <div className="flex items-center gap-4">
                  <span className="text-white/40 w-32">Semáforo</span>
                  <div className="flex gap-2">
                    {pressureOptions.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => {
                          handleUpdateTask(showTaskDetail.id, { pressure: p.value })
                          setShowTaskDetail({ ...showTaskDetail, pressure: p.value })
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          showTaskDetail.pressure === p.value
                            ? `${p.color} text-white`
                            : 'glass hover:bg-white/10'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-4">
                  <span className="text-white/40 w-32">Fecha límite</span>
                  <input
                    type="date"
                    value={showTaskDetail.dueDate || ''}
                    onChange={(e) => {
                      handleUpdateTask(showTaskDetail.id, { dueDate: e.target.value })
                      setShowTaskDetail({ ...showTaskDetail, dueDate: e.target.value })
                    }}
                    className="glass-input"
                  />
                </div>
              </div>

              {/* Subtasks / Checklist */}
              <div className="border-t border-white/10 pt-6 mb-6">
                <h3 className="text-sm text-white/40 uppercase tracking-wider mb-4">Subtareas</h3>
                <div className="space-y-2 mb-4">
                  {(showTaskDetail.subtasks || []).map((subtask, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5"
                    >
                      <button
                        onClick={() => handleToggleSubtask(showTaskDetail, index)}
                        className="text-white/50 hover:text-white"
                      >
                        {subtask.completed ? (
                          <CheckSquare className="w-5 h-5 text-green-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <span className={`flex-1 ${subtask.completed ? 'line-through text-white/40' : ''}`}>
                        {subtask.text}
                      </span>
                      {subtask.assignee && (
                        <span className="text-xs text-blue-400">@{subtask.assignee}</span>
                      )}
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
                    className="glass-input flex-1"
                  />
                  <button
                    onClick={() => handleAddSubtask(showTaskDetail)}
                    className="btn-accent px-4"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comments
                </h3>
                <div className="space-y-3 mb-4">
                  {(showTaskDetail.comments || []).map((comment, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                        {comment.author?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{comment.text}</p>
                        <p className="text-xs text-white/30 mt-1">
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
                    placeholder="Add a comment..."
                    className="glass-input flex-1"
                  />
                  <button
                    onClick={() => handleAddComment(showTaskDetail)}
                    className="btn-accent px-4"
                  >
                    Enviar
                  </button>
                </div>
              </div>

              {/* Delete */}
              <div className="border-t border-white/10 pt-6 mt-6">
                <button
                  onClick={() => handleDeleteTask(showTaskDetail.id)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
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
