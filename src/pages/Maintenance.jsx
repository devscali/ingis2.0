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
  Building2
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { db } from '../lib/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, where } from 'firebase/firestore'

const priorityOptions = [
  { value: 'alta', label: 'Alta', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
  { value: 'media', label: 'Media', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  { value: 'baja', label: 'Baja', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
]

export default function Maintenance() {
  const [clients, setClients] = useState([])
  const [tasks, setTasks] = useState([])
  const [showNewClient, setShowNewClient] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [newClientName, setNewClientName] = useState('')
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
    if (!newClientName.trim()) return

    await addDoc(collection(db, 'maintenance_clients'), {
      userId: user.uid,
      name: newClientName.trim(),
      createdAt: new Date().toISOString()
    })

    setNewClientName('')
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

    // Delete all tasks for this client
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-500" />
            Planes de Mantenimiento
          </h1>
          <p className="text-white/50">Gestiona pendientes de mantenimiento por cliente</p>
        </div>
        <button
          onClick={() => setShowNewClient(true)}
          className="btn-accent flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{clients.length}</p>
            <p className="text-white/50 text-sm">Clientes</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalPending}</p>
            <p className="text-white/50 text-sm">Pendientes</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{highPriority}</p>
            <p className="text-white/50 text-sm">Alta Prioridad</p>
          </div>
        </div>
      </div>

      {/* Clients List */}
      {clients.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-xl font-bold mb-2">Sin clientes</h3>
          <p className="text-white/50 mb-6">Agrega tu primer cliente de mantenimiento</p>
          <button
            onClick={() => setShowNewClient(true)}
            className="btn-accent inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clients.map((client) => {
            const clientTasks = getClientTasks(client.id)
            const pendingTasks = getPendingTasks(client.id)
            const completedTasks = clientTasks.filter(t => t.completed)

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
              >
                {/* Client Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {client.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold">{client.name}</h3>
                      <p className="text-xs text-white/40">
                        {pendingTasks.length} pendientes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedClient(client)
                        setShowNewTask(true)
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Agregar tarea"
                    >
                      <Plus className="w-5 h-5 text-white/50" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-5 h-5 text-red-400/50" />
                    </button>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-4">Sin tareas</p>
                  ) : (
                    <>
                      {/* Pending Tasks */}
                      {pendingTasks
                        .sort((a, b) => {
                          const order = { alta: 0, media: 1, baja: 2 }
                          return order[a.priority] - order[b.priority]
                        })
                        .map((task) => {
                          const priority = priorityOptions.find(p => p.value === task.priority)
                          return (
                            <div
                              key={task.id}
                              className={`flex items-start gap-3 p-3 rounded-xl border ${priority?.bg || 'bg-white/5 border-white/10'}`}
                            >
                              <button
                                onClick={() => handleToggleTask(task)}
                                className="w-5 h-5 mt-0.5 rounded border-2 border-white/30 hover:border-green-500 transition-colors flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm">{task.description}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={`text-xs font-medium ${priority?.color}`}>
                                    {priority?.label}
                                  </span>
                                  {task.dueDate && (
                                    <span className="text-xs text-white/40 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {task.dueDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 rounded hover:bg-red-500/20 transition-colors"
                              >
                                <X className="w-4 h-4 text-white/30" />
                              </button>
                            </div>
                          )
                        })}

                      {/* Completed Tasks */}
                      {completedTasks.length > 0 && (
                        <div className="pt-2 mt-2 border-t border-white/10">
                          <p className="text-xs text-white/30 mb-2">Completadas ({completedTasks.length})</p>
                          {completedTasks.slice(0, 3).map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-2 rounded-lg bg-white/5 mb-1"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-white/40 line-through flex-1 truncate">
                                {task.description}
                              </span>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 rounded hover:bg-red-500/20 transition-colors"
                              >
                                <X className="w-3 h-3 text-white/20" />
                              </button>
                            </div>
                          ))}
                          {completedTasks.length > 3 && (
                            <p className="text-xs text-white/20 text-center">
                              +{completedTasks.length - 3} mas
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
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
              className="glass-card w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                Nuevo Cliente
              </h2>
              <form onSubmit={handleAddClient}>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="glass-input w-full mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewClient(false)}
                    className="flex-1 glass-button"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 btn-accent">
                    Agregar
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
              className="glass-card w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-2">Nueva Tarea</h2>
              <p className="text-white/50 mb-6">Para: {selectedClient.name}</p>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/40 uppercase tracking-wider mb-2">
                    Descripcion
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Que hay que hacer?"
                    className="glass-input w-full h-24 resize-none"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/40 uppercase tracking-wider mb-2">
                      Prioridad
                    </label>
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
                    <label className="block text-sm text-white/40 uppercase tracking-wider mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="glass-input w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewTask(false)
                      setSelectedClient(null)
                    }}
                    className="flex-1 glass-button"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 btn-accent">
                    Agregar
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
