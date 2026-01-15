import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Kanban,
  Plus,
  X,
  Calendar,
  CheckSquare,
  ChevronDown,
  Trash2,
  Edit3,
  Flame,
  Sparkles,
  Search,
  FolderPlus,
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

// Fire particle effect
const FireParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-orange-500"
    initial={{ opacity: 0, y: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      y: [-15, -35],
      scale: [0, 1, 0],
      x: [0, Math.random() * 8 - 4]
    }}
    transition={{
      duration: 0.8,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 0.3
    }}
  />
)

export default function ProjectHub() {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'media',
    assignee: '',
    dueDate: '',
    column: 'planning',
    checklist: []
  })

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    color: 'bg-purple-500'
  })

  const { user } = useAuthStore()
  const { teamMembers } = useSettingsStore()

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
      createDefaultProject()
    }
  }, [user?.uid, projects.length])

  const createDefaultProject = async () => {
    const newProject = await addDoc(collection(db, 'kanban_projects'), {
      userId: user.uid,
      name: 'Proyecto Principal',
      description: 'Mi primer proyecto',
      color: 'bg-purple-500',
      createdAt: new Date().toISOString()
    })
    setCurrentProject({ id: newProject.id, name: 'Proyecto Principal', color: 'bg-purple-500' })
  }

  // Project CRUD
  const openNewProjectModal = () => {
    setEditingProject(null)
    setProjectForm({ name: '', description: '', color: 'bg-purple-500' })
    setShowProjectModal(true)
  }

  const openEditProjectModal = (project) => {
    setEditingProject(project)
    setProjectForm({
      name: project.name || '',
      description: project.description || '',
      color: project.color || 'bg-purple-500'
    })
    setShowProjectModal(true)
  }

  const handleSaveProject = async () => {
    if (!projectForm.name.trim()) return

    if (editingProject) {
      await updateDoc(doc(db, 'kanban_projects', editingProject.id), {
        name: projectForm.name,
        description: projectForm.description,
        color: projectForm.color,
        updatedAt: new Date().toISOString()
      })
      if (currentProject?.id === editingProject.id) {
        setCurrentProject({ ...currentProject, ...projectForm })
      }
    } else {
      const newProject = await addDoc(collection(db, 'kanban_projects'), {
        userId: user.uid,
        name: projectForm.name,
        description: projectForm.description,
        color: projectForm.color,
        createdAt: new Date().toISOString()
      })
      setCurrentProject({ id: newProject.id, ...projectForm })
    }

    setShowProjectModal(false)
    setEditingProject(null)
    setProjectForm({ name: '', description: '', color: 'bg-purple-500' })
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('¿Eliminar este proyecto y todas sus tareas?')) return

    // Delete all tasks
    const projectTasks = tasks.filter(t => t.projectId === projectId)
    for (const task of projectTasks) {
      await deleteDoc(doc(db, 'kanban_tasks', task.id))
    }

    await deleteDoc(doc(db, 'kanban_projects', projectId))

    if (currentProject?.id === projectId) {
      const remaining = projects.filter(p => p.id !== projectId)
      setCurrentProject(remaining[0] || null)
    }
  }

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
      checklist: []
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
      checklist: task.checklist || []
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
        projectId: currentProject.id,
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
      checklist: []
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

  const projectColors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500',
    'bg-cyan-500',
  ]

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
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Kanban className="w-7 h-7 text-white" />
            {/* Fire particles */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              {[0, 0.15, 0.3].map((delay, i) => (
                <FireParticle key={i} delay={delay} />
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              Project Hub
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            </h1>
            <p className="text-white/50">Gestión de proyectos Calidevs style</p>
          </div>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="bg-dark-700/80 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-white/20 transition-colors min-w-[200px]"
            >
              <div className={`w-3 h-3 rounded ${currentProject?.color || 'bg-purple-500'}`} />
              <span className="flex-1 text-left truncate">{currentProject?.name || 'Seleccionar'}</span>
              <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProjectDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-dark-800 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                >
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer group ${
                        currentProject?.id === project.id ? 'bg-white/5' : ''
                      }`}
                    >
                      <div
                        className="flex-1 flex items-center gap-3"
                        onClick={() => {
                          setCurrentProject(project)
                          setShowProjectDropdown(false)
                        }}
                      >
                        <div className={`w-3 h-3 rounded ${project.color}`} />
                        <span className="truncate">{project.name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditProjectModal(project)
                            setShowProjectDropdown(false)
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(project.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-white/5">
                    <button
                      onClick={() => {
                        openNewProjectModal()
                        setShowProjectDropdown(false)
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-purple-400"
                    >
                      <FolderPlus className="w-4 h-4" />
                      Nuevo Proyecto
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => openNewTaskModal()}
            className="btn-accent flex items-center gap-2 py-3 px-5"
          >
            <Plus className="w-5 h-5" />
            Nueva Tarea
          </button>
        </div>
      </div>

      {/* Stats & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-4 flex-1">
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

                        {task.checklist?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              <CheckSquare className="w-3 h-3" />
                              {task.checklist.filter(c => c.completed).length}/{task.checklist.length} completadas
                            </div>
                          </div>
                        )}

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

      {/* Project Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-lg p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    {editingProject ? <Edit3 className="w-5 h-5 text-purple-400" /> : <FolderPlus className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
                    <p className="text-sm text-white/50">Project Hub</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="Mi Proyecto"
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                    Descripción
                  </label>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Descripción del proyecto..."
                    rows={3}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {projectColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setProjectForm({ ...projectForm, color })}
                        className={`w-10 h-10 rounded-xl ${color} transition-all ${
                          projectForm.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800 scale-110' : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowProjectModal(false)}
                    className="flex-1 bg-dark-700 border border-white/10 rounded-xl py-3.5 font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProject}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 rounded-xl py-3.5 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    {editingProject ? 'Guardar' : 'Crear Proyecto'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center relative">
                    {editingTask ? <Edit3 className="w-5 h-5 text-purple-400" /> : <Zap className="w-5 h-5 text-purple-400" />}
                    <Sparkles className="w-3 h-3 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                    <p className="text-sm text-white/50">{currentProject?.name}</p>
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
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
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
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
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
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
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
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
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
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
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
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
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
