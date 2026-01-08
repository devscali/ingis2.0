import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Kanban,
  Plus,
  X,
  Calendar,
  User,
  CheckSquare,
  ChevronDown,
  GripVertical,
  Trash2,
  Edit3,
  MoreVertical
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { db } from '../lib/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, where, getDocs } from 'firebase/firestore'

const defaultColumns = [
  { id: 'planning', title: 'Planificación', color: 'bg-purple-500' },
  { id: 'frontend', title: 'Frontend', color: 'bg-blue-500' },
  { id: 'backend', title: 'Backend', color: 'bg-yellow-500' },
  { id: 'qa', title: 'Q.A.', color: 'bg-orange-500' },
  { id: 'completed', title: 'Completado', color: 'bg-green-500' },
]

const teamMembers = [
  { id: 'carlos', name: 'Carlos Armando', role: 'Frontend', color: 'bg-blue-500' },
  { id: 'ian', name: 'Ian', role: 'Soporte', color: 'bg-green-500' },
]

const priorityOptions = [
  { value: 'alta', label: 'Alta', color: 'text-red-400' },
  { value: 'media', label: 'Media', color: 'text-yellow-400' },
  { value: 'baja', label: 'Baja', color: 'text-green-400' },
]

export default function ProjectHub() {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [newChecklistItem, setNewChecklistItem] = useState('')

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'media',
    assignee: '',
    dueDate: '',
    column: 'planning',
    checklist: []
  })

  // Quick add form
  const [quickAdd, setQuickAdd] = useState({
    title: '',
    description: '',
    priority: 'media',
    assignee: '',
    dueDate: ''
  })

  const { user } = useAuthStore()

  // Load projects
  useEffect(() => {
    if (!user?.uid) return

    const q = query(collection(db, 'kanban_projects'), where('userId', '==', user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setProjects(projectsData)
      if (projectsData.length > 0 && !currentProject) {
        setCurrentProject(projectsData[0])
      }
    })
    return () => unsubscribe()
  }, [user?.uid])

  // Load tasks for current project
  useEffect(() => {
    if (!currentProject?.id) return

    const q = query(collection(db, 'kanban_tasks'), where('projectId', '==', currentProject.id))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTasks(tasksData)
    })
    return () => unsubscribe()
  }, [currentProject?.id])

  // Create default project if none exists
  useEffect(() => {
    if (user?.uid && projects.length === 0) {
      createProject('Proyecto Principal')
    }
  }, [user?.uid, projects.length])

  const createProject = async (name) => {
    const newProject = await addDoc(collection(db, 'kanban_projects'), {
      userId: user.uid,
      name,
      color: 'bg-purple-500',
      createdAt: new Date().toISOString()
    })
    setCurrentProject({ id: newProject.id, name, color: 'bg-purple-500' })
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    if (!quickAdd.title.trim() || !currentProject?.id) return

    await addDoc(collection(db, 'kanban_tasks'), {
      projectId: currentProject.id,
      title: quickAdd.title,
      description: quickAdd.description,
      priority: quickAdd.priority,
      assignee: quickAdd.assignee,
      dueDate: quickAdd.dueDate,
      column: 'planning',
      checklist: [],
      createdAt: new Date().toISOString()
    })

    setQuickAdd({ title: '', description: '', priority: 'media', assignee: '', dueDate: '' })
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
        projectId: currentProject.id,
        ...taskForm,
        createdAt: new Date().toISOString()
      })
    }

    closeModal()
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

  const openEditModal = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'media',
      assignee: task.assignee || '',
      dueDate: task.dueDate || '',
      column: task.column || 'planning',
      checklist: task.checklist || []
    })
    setShowTaskModal(true)
  }

  const closeModal = () => {
    setShowTaskModal(false)
    setEditingTask(null)
    setTaskForm({
      title: '',
      description: '',
      priority: 'media',
      assignee: '',
      dueDate: '',
      column: 'planning',
      checklist: []
    })
    setNewChecklistItem('')
  }

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    setTaskForm({
      ...taskForm,
      checklist: [...taskForm.checklist, { text: newChecklistItem, completed: false }]
    })
    setNewChecklistItem('')
  }

  const toggleChecklistItem = (index) => {
    const newChecklist = [...taskForm.checklist]
    newChecklist[index].completed = !newChecklist[index].completed
    setTaskForm({ ...taskForm, checklist: newChecklist })
  }

  const removeChecklistItem = (index) => {
    setTaskForm({
      ...taskForm,
      checklist: taskForm.checklist.filter((_, i) => i !== index)
    })
  }

  const getTasksByColumn = (columnId) => tasks.filter(t => t.column === columnId)

  const getMember = (id) => teamMembers.find(m => m.id === id)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/30">
            P
          </div>
          <div>
            <h1 className="text-2xl font-bold">Project Hub Pro</h1>
            <p className="text-white/50">Gestión de proyectos de clase mundial</p>
          </div>
        </div>

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="glass px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <div className={`w-3 h-3 rounded ${currentProject?.color || 'bg-purple-500'}`} />
            <span>{currentProject?.name || 'Seleccionar proyecto'}</span>
            <ChevronDown className="w-4 h-4 text-white/50" />
          </button>

          {showProjectDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 glass rounded-xl overflow-hidden z-50">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setCurrentProject(project)
                    setShowProjectDropdown(false)
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left ${
                    currentProject?.id === project.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className={`w-3 h-3 rounded ${project.color}`} />
                  <span>{project.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/40 uppercase tracking-wider">Equipo</span>
        <div className="flex items-center gap-2">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="glass px-3 py-2 flex items-center gap-2"
            >
              <div className={`w-8 h-8 rounded-lg ${member.color} flex items-center justify-center text-white text-sm font-bold`}>
                {member.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-white/40">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleQuickAdd} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={quickAdd.title}
          onChange={(e) => setQuickAdd({ ...quickAdd, title: e.target.value })}
          placeholder="Nueva tarea..."
          className="glass-input flex-1 min-w-[200px]"
        />
        <input
          type="text"
          value={quickAdd.description}
          onChange={(e) => setQuickAdd({ ...quickAdd, description: e.target.value })}
          placeholder="Descripción (opcional)"
          className="glass-input flex-1 min-w-[200px]"
        />
        <select
          value={quickAdd.priority}
          onChange={(e) => setQuickAdd({ ...quickAdd, priority: e.target.value })}
          className="glass-input w-32"
        >
          {priorityOptions.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select
          value={quickAdd.assignee}
          onChange={(e) => setQuickAdd({ ...quickAdd, assignee: e.target.value })}
          className="glass-input w-40"
        >
          <option value="">Asignar a...</option>
          {teamMembers.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={quickAdd.dueDate}
          onChange={(e) => setQuickAdd({ ...quickAdd, dueDate: e.target.value })}
          className="glass-input w-40"
        />
        <button type="submit" className="btn-accent flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Agregar
        </button>
      </form>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {defaultColumns.map((column) => {
          const columnTasks = getTasksByColumn(column.id)
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-72"
            >
              {/* Column Header */}
              <div className="glass rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${column.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {column.title[0]}
                  </div>
                  <h3 className="font-semibold flex-1">{column.title}</h3>
                  <span className="text-white/40 text-sm">{columnTasks.length}</span>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[400px]">
                {columnTasks.length === 0 ? (
                  <div className="glass rounded-xl p-8 text-center">
                    <div className="text-4xl text-white/10 font-bold mb-2">{column.title[0]}</div>
                    <p className="text-white/30 text-sm">
                      {column.id === 'planning' && 'Sin tareas planificadas'}
                      {column.id === 'frontend' && 'Sin tareas de frontend'}
                      {column.id === 'backend' && 'Sin tareas de backend'}
                      {column.id === 'qa' && 'Sin tareas en pruebas'}
                      {column.id === 'completed' && 'Sin tareas completadas'}
                    </p>
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
                        className="glass rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all group"
                        onClick={() => openEditModal(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium flex-1">{task.title}</h4>
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
                              <div className={`w-6 h-6 rounded ${assignee.color} flex items-center justify-center text-white text-xs font-bold`}>
                                {assignee.name[0]}
                              </div>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-white/40 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {task.dueDate}
                              </span>
                            )}
                          </div>
                          {priority && (
                            <span className={`text-xs font-medium ${priority.color}`}>
                              {priority.label}
                            </span>
                          )}
                        </div>

                        {task.checklist?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              <CheckSquare className="w-3 h-3" />
                              {task.checklist.filter(c => c.completed).length}/{task.checklist.length}
                            </div>
                          </div>
                        )}

                        {/* Move buttons */}
                        <div className="flex gap-1 mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          {defaultColumns.filter(c => c.id !== column.id).map((col) => (
                            <button
                              key={col.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMoveTask(task.id, col.id)
                              }}
                              className={`flex-1 py-1 text-xs rounded ${col.color}/20 hover:${col.color}/40 transition-colors`}
                            >
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold mb-6">
                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/40 uppercase tracking-wider mb-2">Título</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="glass-input w-full"
                    placeholder="Título de la tarea"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/40 uppercase tracking-wider mb-2">Descripción</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="glass-input w-full h-24 resize-none"
                    placeholder="Descripción (opcional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/40 uppercase tracking-wider mb-2">Prioridad</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="glass-input w-full"
                    >
                      {priorityOptions.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/40 uppercase tracking-wider mb-2">Asignado a</label>
                    <select
                      value={taskForm.assignee}
                      onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                      className="glass-input w-full"
                    >
                      <option value="">Sin asignar</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/40 uppercase tracking-wider mb-2">Fecha</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="glass-input w-full"
                  />
                </div>

                {/* Checklist */}
                <div>
                  <label className="block text-sm text-white/40 uppercase tracking-wider mb-2">Checklist</label>
                  <div className="space-y-2 mb-3">
                    {taskForm.checklist.length === 0 ? (
                      <p className="text-white/30 text-sm text-center py-2">Sin items en la lista</p>
                    ) : (
                      taskForm.checklist.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleChecklistItem(index)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              item.completed ? 'bg-green-500 border-green-500' : 'border-white/20'
                            }`}
                          >
                            {item.completed && <CheckSquare className="w-3 h-3 text-white" />}
                          </button>
                          <span className={`flex-1 ${item.completed ? 'line-through text-white/40' : ''}`}>
                            {item.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(index)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                      placeholder="Agregar item..."
                      className="glass-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="btn-accent px-3"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 glass-button"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTask}
                    className="flex-1 btn-accent"
                  >
                    Guardar
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
