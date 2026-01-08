import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Mic,
  PenLine,
  ClipboardList,
  Flame,
  Users,
  FileEdit,
  CircleDot,
  User
} from 'lucide-react'
import { TaskList } from '../components/ui/TaskList'
import { ViewToggle } from '../components/ui/ViewToggle'
import { useTasksStore } from '../store/tasksStore'
import { useAuthStore } from '../store/authStore'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

const tabs = [
  { id: 'capture', label: 'Capturar', icon: PenLine },
  { id: 'tasks', label: 'Pendientes', icon: ClipboardList },
  { id: 'priority', label: 'Prioridad', icon: Flame },
  { id: 'team', label: 'Equipo', icon: Users },
]

export default function TorchAI() {
  const [activeTab, setActiveTab] = useState('capture')
  const [noteText, setNoteText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [viewMode, setViewMode] = useState('list')

  const { user } = useAuthStore()
  const { tasks, addSession, toggleTask } = useTasksStore()

  const activeTasks = tasks.filter(t => !t.completed)
  const teamMembers = ['Carlos Armando', 'Sara', 'Ian', 'JC', 'Marlene', 'Papa']

  const handleProcess = async () => {
    if (!noteText.trim()) return

    setProcessing(true)
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente que extrae tareas de texto. Responde UNICAMENTE con un objeto JSON válido: {"tasks": [{"description": "...", "client": "...", "urgency": "Alta|Media|Baja", "type": "Trabajo|Personal", "dueDate": "DD/MM/YYYY o null", "responsibles": []}]}'
            },
            {
              role: 'user',
              content: `Hoy es ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

Analiza esta nota y extrae TODAS las tareas:
- Descripción clara
- Cliente (o "Personal")
- Urgencia (Alta/Media/Baja)
- Tipo (Trabajo/Personal)
- Fecha límite DD/MM/YYYY o null
- Responsables: array de nombres o []

Responde SOLO con JSON válido.

Nota:
${noteText}`
            }
          ],
          temperature: 0.3
        })
      })

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      let parsedData
      try {
        parsedData = JSON.parse(aiResponse)
      } catch {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No se pudo extraer JSON')
        parsedData = JSON.parse(jsonMatch[0])
      }

      if (!parsedData?.tasks?.length) {
        alert('No se encontraron tareas')
        return
      }

      const now = new Date()
      const newSession = {
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        originalText: noteText,
        tasks: parsedData.tasks.map(task => ({
          description: task.description || 'Sin descripción',
          client: task.client || 'Personal',
          urgency: task.urgency || 'Media',
          type: task.type || 'Personal',
          dueDate: task.dueDate || null,
          responsibles: Array.isArray(task.responsibles) ? task.responsibles : [],
          completed: false
        }))
      }

      await addSession(user.uid, newSession)
      setNoteText('')
      setActiveTab('tasks')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleToggle = (sessionId, taskIndex) => {
    toggleTask(user.uid, sessionId, taskIndex)
  }

  const priorityColors = {
    'Alta': 'text-red-400',
    'Media': 'text-yellow-400',
    'Baja': 'text-green-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-500" />
          TorchAI
        </h1>
        <p className="text-white/50">Captura notas por voz o texto y deja que la IA las organice</p>
      </div>

      {/* Tabs */}
      <div className="glass p-2 rounded-2xl flex gap-2 max-w-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all
                ${activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === 'tasks' && activeTasks.length > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {activeTasks.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'capture' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-2xl"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-orange-500" />
            Nueva Nota
          </h2>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={`Escribe tus pendientes aquí...

Ejemplo:
- Llamar a Juan del proyecto X urgente para mañana
- Revisar el presupuesto de María antes del viernes
- Comprar regalo para cumpleaños de mamá`}
            className="glass-input w-full h-48 resize-none mb-4"
          />
          <button
            onClick={handleProcess}
            disabled={processing || !noteText.trim()}
            className="btn-accent flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            {processing ? 'Procesando...' : 'Procesar con IA'}
          </button>
        </motion.div>
      )}

      {activeTab === 'tasks' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Mis Pendientes</h2>
            <ViewToggle view={viewMode} onChange={setViewMode} />
          </div>
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            showCompleted
            viewMode={viewMode}
          />
        </motion.div>
      )}

      {activeTab === 'priority' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {['Alta', 'Media', 'Baja'].map((priority) => {
            const priorityTasks = activeTasks.filter(t => t.urgency === priority)
            if (priorityTasks.length === 0) return null

            return (
              <div key={priority}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CircleDot className={`w-5 h-5 ${priorityColors[priority]}`} />
                  <span>Prioridad {priority}</span>
                  <span className="text-white/40">({priorityTasks.length})</span>
                </h3>
                <TaskList tasks={priorityTasks} onToggle={handleToggle} viewMode="grid" />
              </div>
            )
          })}
        </motion.div>
      )}

      {activeTab === 'team' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {teamMembers.map((member) => {
            const memberTasks = activeTasks.filter(t => t.responsibles?.includes(member))
            if (memberTasks.length === 0) return null

            return (
              <div key={member}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  {member}
                  <span className="text-white/40">({memberTasks.length})</span>
                </h3>
                <TaskList tasks={memberTasks} onToggle={handleToggle} viewMode="list" />
              </div>
            )
          })}
          {!teamMembers.some(m => activeTasks.some(t => t.responsibles?.includes(m))) && (
            <div className="glass-card text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sin asignaciones</h3>
              <p className="text-white/50">No hay tareas asignadas al equipo</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
