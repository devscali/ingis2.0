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
  Filter,
  LayoutGrid,
  List,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Edit3
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

export default function Maintenance() {
  const [clients, setClients] = useState([])
  const [tasks, setTasks] = useState([])
  const [showNewClient, setShowNewClient] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
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

  const handleAddClient = async (e) => {
    e.preventDefault()
    if (!clientForm.name.trim()) return

    const colorIndex = clients.length % clientColors.length

    await addDoc(collection(db, 'maintenance_clients'), {
      userId: user.uid,
      name: clientForm.name.trim(),
      contact: clientForm.contact.trim(),
      email: clientForm.email.trim(),
      phone: clientForm.phone.trim(),
      location: clientForm.location.trim(),
      status: clientForm.status,
      color: clientColors[colorIndex],
      createdAt: new Date().toISOString()
    })

    setClientForm({ name: '', contact: '', email: '', phone: '', location: '', status: 'active' })
    setShowNewClient(false)
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!taskForm.description.trim() || !selectedClient) return

    await addDoc(collection(db, 'maintenance_tasks'), {
      userId: user.uid,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      description: taskForm.description.trim(),
      priority: taskForm.priority,
      dueDate: taskForm.dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    })

    setTaskForm({ description: '', priority: 'media', dueDate: '' })
    setShowNewTask(false)
    setSelectedClient(null)
  }

  const handleToggleTask = async (task) => {
    await updateDoc(doc(db, 'maintenance_tasks', task.id), {
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null
    })
  }

  const handleDeleteTask = async (taskId) => {
    await deleteDoc(doc(db, 'maintenance_tasks', taskId))
  }

  const handleDeleteClient = async (clientId) => {
    if (!confirm('Esto eliminara el cliente y todas sus tareas. Continuar?')) return

    const clientTasks = tasks.filter(t => t.clientId === clientId)
    for (const task of clientTasks) {
      await deleteDoc(doc(db, 'maintenance_tasks', task.id))
    }

    await deleteDoc(doc(db, 'maintenance_clients', clientId))
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
      className="space-y-10 sm:space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Planes de Mantenimiento</h1>
          <p className="text-white/50">Gestiona tus clientes y sus pendientes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="glass-button px-4 py-3 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Inactivos
          </button>
          <button
            onClick={() => setShowNewClient(true)}
            className="btn-accent flex items-center gap-2 py-3 px-5"
          >
            <Plus className="w-5 h-5" />
            Agregar Cliente
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar clientes..."
              className="glass-input w-full pl-12 py-3"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-input py-3 px-4 min-w-[160px]"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="pending">Pendientes</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center gap-1 glass rounded-xl p-1">
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

          {/* Refresh */}
          <button className="glass p-3 rounded-xl hover:bg-white/10 transition-colors">
            <RefreshCw className="w-5 h-5 text-white/50" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{clients.length}</p>
            <p className="text-white/50 text-sm">Clientes</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{clients.filter(c => c.status === 'active').length}</p>
            <p className="text-white/50 text-sm">Activos</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalPending}</p>
            <p className="text-white/50 text-sm">Pendientes</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{highPriority}</p>
            <p className="text-white/50 text-sm">Urgentes</p>
          </div>
        </div>
      </div>

      {/* Clients Grid/List */}
      {filteredClients.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Sin resultados' : 'Sin clientes'}
          </h3>
          <p className="text-white/50 mb-6">
            {searchTerm || filterStatus !== 'all' ? 'Intenta con otros filtros' : 'Agrega tu primer cliente de mantenimiento'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setShowNewClient(true)}
              className="btn-accent inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar Cliente
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const pendingTasks = getPendingTasks(client.id)
            const clientTasks = getClientTasks(client.id)
            const statusOption = statusOptions.find(s => s.value === client.status)

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-0 overflow-hidden hover:border-white/20 transition-all group"
              >
                {/* Card Header with Avatar */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${client.color || 'from-blue-500 to-blue-600'} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                        {getInitials(client.name)}
                      </div>
                      {/* Status Badge */}
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusOption?.color || 'bg-gray-500'}`}>
                          {statusOption?.label || 'Activo'}
                        </span>
                        {pendingTasks.length > 0 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            {pendingTasks.length} pendientes
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    <button className="p-2 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical className="w-5 h-5 text-white/50" />
                    </button>
                  </div>

                  {/* Client Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-1">{client.name}</h3>
                    {client.contact && (
                      <p className="text-white/50 text-sm">{client.contact}</p>
                    )}
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2">
                    {client.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white/40" />
                        </div>
                        <span className="text-white/60">{client.location}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-white/40" />
                        </div>
                        <span className="text-white/60">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-white/40" />
                        </div>
                        <span className="text-white/60">{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tasks Preview */}
                {pendingTasks.length > 0 && (
                  <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02]">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Tareas pendientes</p>
                    <div className="space-y-2">
                      {pendingTasks.slice(0, 2).map((task) => {
                        const priority = priorityOptions.find(p => p.value === task.priority)
                        return (
                          <div key={task.id} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${priority?.bg}`} />
                            <span className="text-sm text-white/70 truncate flex-1">{task.description}</span>
                          </div>
                        )
                      })}
                      {pendingTasks.length > 2 && (
                        <p className="text-xs text-white/30">+{pendingTasks.length - 2} mas...</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      setSelectedClient(client)
                      setShowNewTask(true)
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                    title="Agregar tarea"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                    title="Editar"
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
        <div className="glass-card p-0 overflow-hidden divide-y divide-white/5">
          {filteredClients.map((client) => {
            const pendingTasks = getPendingTasks(client.id)
            const statusOption = statusOptions.find(s => s.value === client.status)

            return (
              <div
                key={client.id}
                className="flex items-center gap-6 p-5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${client.color || 'from-blue-500 to-blue-600'} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                  {getInitials(client.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold truncate">{client.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${statusOption?.color || 'bg-gray-500'}`}>
                      {statusOption?.label || 'Activo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    {client.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {client.location}
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

                {/* Pending Badge */}
                {pendingTasks.length > 0 && (
                  <span className="px-3 py-1.5 rounded-xl text-sm font-medium bg-orange-500/20 text-orange-400">
                    {pendingTasks.length} pendientes
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedClient(client)
                      setShowNewTask(true)
                    }}
                    className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-white/50" />
                  </button>
                  <button className="p-2.5 rounded-xl hover:bg-white/10 transition-colors">
                    <Edit3 className="w-5 h-5 text-white/50" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2.5 rounded-xl hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400/50" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Client Modal */}
      <AnimatePresence>
        {showNewClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewClient(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-xl p-8 sm:p-10"
            >
              <h2 className="text-2xl font-bold mb-2">Agregar Cliente</h2>
              <p className="text-white/50 mb-10">Completa la informacion del nuevo cliente</p>

              <form onSubmit={handleAddClient} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                      Nombre de la Empresa *
                    </label>
                    <input
                      type="text"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      placeholder="Ej: Empresa ABC"
                      className="glass-input w-full py-4"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                      Contacto
                    </label>
                    <input
                      type="text"
                      value={clientForm.contact}
                      onChange={(e) => setClientForm({ ...clientForm, contact: e.target.value })}
                      placeholder="Nombre del contacto"
                      className="glass-input w-full py-4"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                      Ubicacion
                    </label>
                    <input
                      type="text"
                      value={clientForm.location}
                      onChange={(e) => setClientForm({ ...clientForm, location: e.target.value })}
                      placeholder="Ciudad o zona"
                      className="glass-input w-full py-4"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                      Email
                    </label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      placeholder="correo@empresa.com"
                      className="glass-input w-full py-4"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      placeholder="(000) 000-0000"
                      className="glass-input w-full py-4"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                      Estado
                    </label>
                    <div className="flex gap-3">
                      {statusOptions.map((status) => (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() => setClientForm({ ...clientForm, status: status.value })}
                          className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                            clientForm.status === status.value
                              ? `${status.color} text-white`
                              : 'glass hover:bg-white/10'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowNewClient(false)}
                    className="flex-1 glass-button py-4 text-base"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 btn-accent py-4 text-base">
                    Agregar Cliente
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Task Modal */}
      <AnimatePresence>
        {showNewTask && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowNewTask(false)
              setSelectedClient(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-xl p-8 sm:p-10"
            >
              <h2 className="text-2xl font-bold mb-2">Nueva Tarea</h2>
              <p className="text-white/50 mb-10">Para: {selectedClient.name}</p>

              <form onSubmit={handleAddTask} className="space-y-8">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-4">
                    Descripcion
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Que hay que hacer?"
                    className="glass-input w-full h-32 resize-none py-4 px-5"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-4">
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
                              : 'glass hover:bg-white/10'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-widest mb-4">
                      Fecha Limite
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="glass-input w-full py-4"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewTask(false)
                      setSelectedClient(null)
                    }}
                    className="flex-1 glass-button py-4 text-base"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 btn-accent py-4 text-base">
                    Agregar Tarea
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
