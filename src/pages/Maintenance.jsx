import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wrench,
  Plus,
  X,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Building2,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Flame,
  Sparkles,
  User,
  FileText
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { db } from '../lib/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, where } from 'firebase/firestore'

const priorityOptions = [
  { value: 'alta', label: 'Alta', color: 'text-red-400', bg: 'bg-red-500', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'media', label: 'Media', color: 'text-yellow-400', bg: 'bg-yellow-500', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'baja', label: 'Baja', color: 'text-green-400', bg: 'bg-green-500', badge: 'bg-green-500/20 text-green-400 border-green-500/30' },
]

const statusOptions = [
  { value: 'active', label: 'Activo', color: 'bg-emerald-500' },
  { value: 'inactive', label: 'Inactivo', color: 'bg-gray-500' },
  { value: 'pending', label: 'Pendiente', color: 'bg-orange-500' },
]

const clientColors = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-orange-500 to-orange-600',
  'from-teal-500 to-teal-600',
  'from-indigo-500 to-indigo-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
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

export default function Maintenance() {
  const [clients, setClients] = useState([])
  const [tasks, setTasks] = useState([])
  const [showClientModal, setShowClientModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const [clientForm, setClientForm] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    location: '',
    notes: '',
    status: 'active'
  })

  const [taskForm, setTaskForm] = useState({
    description: '',
    priority: 'media',
    dueDate: ''
  })

  const { user } = useAuthStore()

  // Load clients
  useEffect(() => {
    if (!user?.uid) return

    const q = query(collection(db, 'maintenance_clients'), where('userId', '==', user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setClients(data.sort((a, b) => a.name.localeCompare(b.name)))
    })
    return () => unsubscribe()
  }, [user?.uid])

  // Load tasks
  useEffect(() => {
    if (!user?.uid) return

    const q = query(collection(db, 'maintenance_tasks'), where('userId', '==', user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTasks(data)
    })
    return () => unsubscribe()
  }, [user?.uid])

  // Client CRUD
  const openNewClientModal = () => {
    setEditingClient(null)
    setClientForm({
      name: '',
      contact: '',
      email: '',
      phone: '',
      location: '',
      notes: '',
      status: 'active'
    })
    setShowClientModal(true)
  }

  const openEditClientModal = (client) => {
    setEditingClient(client)
    setClientForm({
      name: client.name || '',
      contact: client.contact || '',
      email: client.email || '',
      phone: client.phone || '',
      location: client.location || '',
      notes: client.notes || '',
      status: client.status || 'active'
    })
    setShowClientModal(true)
  }

  const handleSaveClient = async (e) => {
    e.preventDefault()
    if (!clientForm.name.trim()) return

    if (editingClient) {
      await updateDoc(doc(db, 'maintenance_clients', editingClient.id), {
        ...clientForm,
        updatedAt: new Date().toISOString()
      })
    } else {
      const colorIndex = clients.length % clientColors.length
      await addDoc(collection(db, 'maintenance_clients'), {
        userId: user.uid,
        ...clientForm,
        color: clientColors[colorIndex],
        createdAt: new Date().toISOString()
      })
    }

    setShowClientModal(false)
    setEditingClient(null)
    setClientForm({
      name: '',
      contact: '',
      email: '',
      phone: '',
      location: '',
      notes: '',
      status: 'active'
    })
  }

  const handleDeleteClient = async (clientId) => {
    if (!confirm('Esto eliminará el cliente y todas sus tareas. ¿Continuar?')) return

    const clientTasks = tasks.filter(t => t.clientId === clientId)
    for (const task of clientTasks) {
      await deleteDoc(doc(db, 'maintenance_tasks', task.id))
    }

    await deleteDoc(doc(db, 'maintenance_clients', clientId))
  }

  // Task CRUD
  const openNewTaskModal = (client) => {
    setSelectedClient(client)
    setEditingTask(null)
    setTaskForm({
      description: '',
      priority: 'media',
      dueDate: ''
    })
    setShowTaskModal(true)
  }

  const openEditTaskModal = (task, client) => {
    setSelectedClient(client)
    setEditingTask(task)
    setTaskForm({
      description: task.description || '',
      priority: task.priority || 'media',
      dueDate: task.dueDate || ''
    })
    setShowTaskModal(true)
  }

  const handleSaveTask = async (e) => {
    e.preventDefault()
    if (!taskForm.description.trim() || !selectedClient) return

    if (editingTask) {
      await updateDoc(doc(db, 'maintenance_tasks', editingTask.id), {
        ...taskForm,
        updatedAt: new Date().toISOString()
      })
    } else {
      await addDoc(collection(db, 'maintenance_tasks'), {
        userId: user.uid,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        ...taskForm,
        completed: false,
        createdAt: new Date().toISOString()
      })
    }

    setShowTaskModal(false)
    setEditingTask(null)
    setSelectedClient(null)
    setTaskForm({
      description: '',
      priority: 'media',
      dueDate: ''
    })
  }

  const handleToggleTask = async (task) => {
    await updateDoc(doc(db, 'maintenance_tasks', task.id), {
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null
    })
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('¿Eliminar esta tarea?')) return
    await deleteDoc(doc(db, 'maintenance_tasks', taskId))
  }

  const getClientTasks = (clientId) => tasks.filter(t => t.clientId === clientId)
  const getPendingTasks = (clientId) => tasks.filter(t => t.clientId === clientId && !t.completed)

  const totalPending = tasks.filter(t => !t.completed).length
  const highPriority = tasks.filter(t => !t.completed && t.priority === 'alta').length

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contact?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Wrench className="w-7 h-7 text-white" />
            {/* Fire particles */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              {[0, 0.15, 0.3].map((delay, i) => (
                <FireParticle key={i} delay={delay} />
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              Mantenimiento
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            </h1>
            <p className="text-white/50">Gestiona tus clientes y sus pendientes</p>
          </div>
        </div>
        <button
          onClick={openNewClientModal}
          className="btn-accent flex items-center gap-2 py-3 px-5 self-start"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-dark-700/80 border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{clients.length}</p>
            <p className="text-white/50 text-xs">Clientes</p>
          </div>
        </div>
        <div className="bg-dark-700/80 border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{clients.filter(c => c.status === 'active').length}</p>
            <p className="text-white/50 text-xs">Activos</p>
          </div>
        </div>
        <div className="bg-dark-700/80 border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center relative">
            <Clock className="w-5 h-5 text-orange-400" />
            <Sparkles className="w-3 h-3 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <p className="text-xl font-bold">{totalPending}</p>
            <p className="text-white/50 text-xs">Pendientes</p>
          </div>
        </div>
        <div className="bg-dark-700/80 border border-white/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{highPriority}</p>
            <p className="text-white/50 text-xs">Urgentes</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-dark-700/80 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar clientes..."
            className="w-full bg-dark-800 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 focus:outline-none transition-colors"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="pending">Pendientes</option>
        </select>
        <div className="flex items-center gap-2 bg-dark-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Clients Display */}
      {filteredClients.length === 0 ? (
        <div className="bg-dark-700/80 border border-white/5 rounded-xl text-center py-12 sm:py-16">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6 relative">
            <Building2 className="w-10 h-10 text-blue-400" />
            <Flame className="w-5 h-5 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Sin resultados' : 'Sin clientes'}
          </h3>
          <p className="text-white/50 mb-6">
            {searchTerm || filterStatus !== 'all' ? 'Intenta con otros filtros' : 'Agrega tu primer cliente de mantenimiento'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={openNewClientModal}
              className="btn-accent inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar Cliente
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const pendingTasks = getPendingTasks(client.id)
            const clientTasks = getClientTasks(client.id)
            const statusOption = statusOptions.find(s => s.value === client.status)

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-700/80 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all group"
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${client.color || 'from-blue-500 to-blue-600'} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                        {getInitials(client.name)}
                      </div>
                      <div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold text-white ${statusOption?.color || 'bg-gray-500'}`}>
                          {statusOption?.label || 'Activo'}
                        </span>
                        {pendingTasks.length > 0 && (
                          <span className="ml-2 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            {pendingTasks.length} pendientes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-1">{client.name}</h3>
                  {client.contact && (
                    <p className="text-white/50 text-sm mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {client.contact}
                    </p>
                  )}

                  {/* Contact Details */}
                  <div className="space-y-2">
                    {client.location && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <MapPin className="w-4 h-4 text-white/40" />
                        {client.location}
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Mail className="w-4 h-4 text-white/40" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Phone className="w-4 h-4 text-white/40" />
                        {client.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tasks Preview */}
                {pendingTasks.length > 0 && (
                  <div className="px-5 py-4 border-t border-white/5 bg-dark-800/30">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Tareas pendientes</p>
                    <div className="space-y-2">
                      {pendingTasks.slice(0, 2).map((task) => {
                        const priority = priorityOptions.find(p => p.value === task.priority)
                        return (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 group/task cursor-pointer"
                            onClick={() => openEditTaskModal(task, client)}
                          >
                            <div className={`w-2 h-2 rounded-full ${priority?.bg}`} />
                            <span className="text-sm text-white/70 truncate flex-1 group-hover/task:text-white transition-colors">{task.description}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleTask(task)
                              }}
                              className="p-1 rounded hover:bg-emerald-500/20 transition-colors opacity-0 group-hover/task:opacity-100"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </button>
                          </div>
                        )
                      })}
                      {pendingTasks.length > 2 && (
                        <p className="text-xs text-white/30">+{pendingTasks.length - 2} más...</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/5">
                  <button
                    onClick={() => openNewTaskModal(client)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                    title="Agregar tarea"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openEditClientModal(client)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                    title="Editar cliente"
                  >
                    <Edit3 className="w-5 h-5 text-white/50" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-dark-700/80 border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
          {filteredClients.map((client) => {
            const pendingTasks = getPendingTasks(client.id)
            const statusOption = statusOptions.find(s => s.value === client.status)

            return (
              <div
                key={client.id}
                className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${client.color || 'from-blue-500 to-blue-600'} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                  {getInitials(client.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold truncate">{client.name}</h3>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium text-white ${statusOption?.color || 'bg-gray-500'}`}>
                      {statusOption?.label || 'Activo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    {client.contact && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {client.contact}
                      </span>
                    )}
                    {client.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {client.email}
                      </span>
                    )}
                  </div>
                </div>

                {pendingTasks.length > 0 && (
                  <span className="px-3 py-1.5 rounded-xl text-sm font-medium bg-orange-500/20 text-orange-400">
                    {pendingTasks.length} pendientes
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openNewTaskModal(client)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Nueva tarea"
                  >
                    <Plus className="w-5 h-5 text-white/50" />
                  </button>
                  <button
                    onClick={() => openEditClientModal(client)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="w-5 h-5 text-white/50" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5 text-red-400/50" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Client Modal */}
      <AnimatePresence>
        {showClientModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowClientModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center relative">
                    {editingClient ? <Edit3 className="w-5 h-5 text-blue-400" /> : <Building2 className="w-5 h-5 text-blue-400" />}
                    <Sparkles className="w-3 h-3 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                    <p className="text-sm text-white/50">Mantenimiento</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClientModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <form onSubmit={handleSaveClient} className="space-y-6">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="Ej: Empresa ABC"
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                      Contacto
                    </label>
                    <input
                      type="text"
                      value={clientForm.contact}
                      onChange={(e) => setClientForm({ ...clientForm, contact: e.target.value })}
                      placeholder="Nombre del contacto"
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={clientForm.location}
                      onChange={(e) => setClientForm({ ...clientForm, location: e.target.value })}
                      placeholder="Ciudad o zona"
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      placeholder="correo@empresa.com"
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      placeholder="(000) 000-0000"
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                    Notas
                  </label>
                  <textarea
                    value={clientForm.notes}
                    onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                    placeholder="Notas adicionales sobre el cliente..."
                    rows={3}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                    Estado
                  </label>
                  <div className="flex gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setClientForm({ ...clientForm, status: status.value })}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          clientForm.status === status.value
                            ? `${status.color} text-white`
                            : 'bg-dark-700 border border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="flex-1 bg-dark-700 border border-white/10 rounded-xl py-3.5 font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-xl py-3.5 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    {editingClient ? 'Guardar' : 'Agregar Cliente'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowTaskModal(false)
              setSelectedClient(null)
              setEditingTask(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-lg p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center relative">
                    {editingTask ? <Edit3 className="w-5 h-5 text-orange-400" /> : <FileText className="w-5 h-5 text-orange-400" />}
                    <Flame className="w-3 h-3 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                    <p className="text-sm text-white/50">{selectedClient.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTaskModal(false)
                    setSelectedClient(null)
                    setEditingTask(null)
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-6">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="¿Qué hay que hacer?"
                    rows={4}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-orange-500/50 focus:outline-none transition-colors resize-none"
                    autoFocus
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
                      Fecha Límite
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-orange-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskModal(false)
                      setSelectedClient(null)
                      setEditingTask(null)
                    }}
                    className="flex-1 bg-dark-700 border border-white/10 rounded-xl py-3.5 font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-xl py-3.5 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4" />
                    {editingTask ? 'Guardar' : 'Agregar Tarea'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
