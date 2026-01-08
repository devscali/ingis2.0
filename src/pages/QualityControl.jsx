import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Plus,
  Globe,
  AlertTriangle,
  CheckCheck,
  Clock,
  ExternalLink,
  Trash2,
  RefreshCw,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { Card, StatCard } from '../components/ui/Card'
import { useAuthStore } from '../store/authStore'
import { db } from '../lib/firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, query, where } from 'firebase/firestore'

const checklistItems = [
  { id: 'responsive', label: 'Diseño Responsivo', category: 'UX' },
  { id: 'speed', label: 'Velocidad de Carga < 3s', category: 'Performance' },
  { id: 'seo', label: 'Meta Tags SEO', category: 'SEO' },
  { id: 'ssl', label: 'Certificado SSL', category: 'Security' },
  { id: 'forms', label: 'Formularios Funcionando', category: 'Functionality' },
  { id: 'links', label: 'Links sin Errores 404', category: 'Functionality' },
  { id: 'images', label: 'Imágenes Optimizadas', category: 'Performance' },
  { id: 'favicon', label: 'Favicon Configurado', category: 'Branding' },
  { id: 'analytics', label: 'Analytics Instalado', category: 'Tracking' },
  { id: 'backup', label: 'Backup Configurado', category: 'Security' },
]

export default function QualityControl() {
  const [projects, setProjects] = useState([])
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectUrl, setNewProjectUrl] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(false)

  const { user } = useAuthStore()

  useEffect(() => {
    if (!user?.uid) return

    const q = query(collection(db, 'qc_projects'), where('userId', '==', user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProjects(projectsData)
    })

    return () => unsubscribe()
  }, [user?.uid])

  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!newProjectUrl.trim() || !newProjectName.trim()) return

    setLoading(true)
    try {
      await addDoc(collection(db, 'qc_projects'), {
        userId: user.uid,
        name: newProjectName,
        url: newProjectUrl.startsWith('http') ? newProjectUrl : `https://${newProjectUrl}`,
        checklist: checklistItems.reduce((acc, item) => ({ ...acc, [item.id]: false }), {}),
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastCheck: null
      })
      setNewProjectUrl('')
      setNewProjectName('')
      setShowNewProject(false)
    } catch (error) {
      alert('Error al crear proyecto: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCheck = async (projectId, checkId) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const newChecklist = { ...project.checklist, [checkId]: !project.checklist[checkId] }
    const completedCount = Object.values(newChecklist).filter(Boolean).length
    const status = completedCount === checklistItems.length ? 'completed' : completedCount > 0 ? 'in_progress' : 'pending'

    await updateDoc(doc(db, 'qc_projects', projectId), {
      checklist: newChecklist,
      status,
      lastCheck: new Date().toISOString()
    })
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('¿Eliminar este proyecto?')) return
    await deleteDoc(doc(db, 'qc_projects', projectId))
    if (selectedProject?.id === projectId) setSelectedProject(null)
  }

  const getProjectProgress = (project) => {
    const completed = Object.values(project.checklist || {}).filter(Boolean).length
    return Math.round((completed / checklistItems.length) * 100)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'in_progress': return 'text-yellow-400'
      default: return 'text-white/40'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCheck
      case 'in_progress': return Clock
      default: return AlertCircle
    }
  }

  const completedProjects = projects.filter(p => p.status === 'completed').length
  const inProgressProjects = projects.filter(p => p.status === 'in_progress').length
  const pendingProjects = projects.filter(p => p.status === 'pending').length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            Control de Calidad
          </h1>
          <p className="text-white/50 text-sm sm:text-base">Gestiona la calidad de tus proyectos web</p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="btn-accent flex items-center gap-2 self-start text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <StatCard icon={CheckCheck} value={completedProjects} label="Completados" color="green" />
        <StatCard icon={Clock} value={inProgressProjects} label="En Progreso" color="orange" />
        <StatCard icon={AlertCircle} value={pendingProjects} label="Pendientes" color="red" />
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewProject(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                Nuevo Proyecto QC
              </h2>
              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Nombre del Proyecto</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Mi Sitio Web"
                    className="glass-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">URL del Sitio</label>
                  <input
                    type="text"
                    value={newProjectUrl}
                    onChange={(e) => setNewProjectUrl(e.target.value)}
                    placeholder="https://ejemplo.com"
                    className="glass-input w-full"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewProject(false)}
                    className="flex-1 glass-button"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-accent"
                  >
                    {loading ? 'Creando...' : 'Crear Proyecto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Sin proyectos</h3>
          <p className="text-white/50 mb-4">Agrega tu primer proyecto para hacer QC</p>
          <button
            onClick={() => setShowNewProject(true)}
            className="btn-accent inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar Proyecto
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Projects List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              Proyectos
            </h2>
            <div className="space-y-3">
              {projects.map((project) => {
                const progress = getProjectProgress(project)
                const StatusIcon = getStatusIcon(project.status)
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedProject(project)}
                    className={`
                      glass p-4 cursor-pointer transition-all
                      ${selectedProject?.id === project.id ? 'border-green-500/50 bg-green-500/5' : 'hover:bg-white/5'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(project.status)}`} />
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-white/40">{project.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-white/40" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(project.id)
                          }}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            progress === 100 ? 'bg-green-500' : progress > 50 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Checklist
            </h2>
            {selectedProject ? (
              <div className="glass rounded-2xl divide-y divide-white/5">
                {checklistItems.map((item) => {
                  const isChecked = selectedProject.checklist?.[item.id]
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheck(selectedProject.id, item.id)}
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <div
                        className={`
                          w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                          ${isChecked ? 'bg-green-500 border-green-500' : 'border-white/20'}
                        `}
                      >
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isChecked ? 'line-through text-white/40' : ''}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-white/30">{item.category}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="glass-card text-center py-12">
                <Info className="w-8 h-8 text-white/30 mx-auto mb-3" />
                <p className="text-white/50">Selecciona un proyecto para ver su checklist</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
