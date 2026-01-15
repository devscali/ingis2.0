import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Plus,
  Globe,
  CheckCheck,
  Clock,
  ExternalLink,
  Trash2,
  AlertCircle,
  Info,
  Edit3,
  X,
  Flame,
  Sparkles,
  Search,
  LayoutGrid,
  List,
  MoreVertical
} from 'lucide-react'
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

// Fire particle component
const FireParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-orange-500"
    initial={{ opacity: 0, y: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      y: [-20, -40],
      scale: [0, 1, 0],
      x: [0, Math.random() * 10 - 5]
    }}
    transition={{
      duration: 1,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 0.5
    }}
  />
)

export default function QualityControl() {
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [projectForm, setProjectForm] = useState({
    name: '',
    url: '',
    description: ''
  })

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

  const resetForm = () => {
    setProjectForm({ name: '', url: '', description: '' })
    setEditingProject(null)
  }

  const openNewModal = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (project) => {
    setEditingProject(project)
    setProjectForm({
      name: project.name || '',
      url: project.url || '',
      description: project.description || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!projectForm.name.trim() || !projectForm.url.trim()) return

    setLoading(true)
    try {
      const url = projectForm.url.startsWith('http') ? projectForm.url : `https://${projectForm.url}`

      if (editingProject) {
        await updateDoc(doc(db, 'qc_projects', editingProject.id), {
          name: projectForm.name,
          url,
          description: projectForm.description,
          updatedAt: new Date().toISOString()
        })
      } else {
        await addDoc(collection(db, 'qc_projects'), {
          userId: user.uid,
          name: projectForm.name,
          url,
          description: projectForm.description,
          checklist: checklistItems.reduce((acc, item) => ({ ...acc, [item.id]: false }), {}),
          status: 'pending',
          createdAt: new Date().toISOString(),
          lastCheck: null
        })
      }

      resetForm()
      setShowModal(false)
    } catch (error) {
      alert('Error: ' + error.message)
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Completado' }
      case 'in_progress': return { bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'En Progreso' }
      default: return { bg: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Pendiente' }
    }
  }

  const completedProjects = projects.filter(p => p.status === 'completed').length
  const inProgressProjects = projects.filter(p => p.status === 'in_progress').length
  const pendingProjects = projects.filter(p => p.status === 'pending').length

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-7 h-7 text-white" />
            {/* Fire particles */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              {[0, 0.2, 0.4].map((delay, i) => (
                <FireParticle key={i} delay={delay} />
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              Quality Control
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            </h1>
            <p className="text-white/50">Control de calidad para tus proyectos web</p>
          </div>
        </div>
        <button
          onClick={openNewModal}
          className="btn-accent flex items-center gap-2 py-3 px-5 self-start"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Stats - Clean flat style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-700/80 border border-white/5 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completedProjects}</p>
            <p className="text-white/50 text-sm">Completados</p>
          </div>
        </div>
        <div className="bg-dark-700/80 border border-white/5 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center relative">
            <Clock className="w-6 h-6 text-orange-400" />
            <Sparkles className="w-3 h-3 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <p className="text-2xl font-bold">{inProgressProjects}</p>
            <p className="text-white/50 text-sm">En Progreso</p>
          </div>
        </div>
        <div className="bg-dark-700/80 border border-white/5 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{pendingProjects}</p>
            <p className="text-white/50 text-sm">Pendientes</p>
          </div>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="bg-dark-700/80 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full bg-dark-800 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-dark-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-white/50 hover:text-white'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-white/50 hover:text-white'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal - New/Edit Project */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    {editingProject ? <Edit3 className="w-5 h-5 text-emerald-400" /> : <Globe className="w-5 h-5 text-emerald-400" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
                    <p className="text-sm text-white/50">Quality Control</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="Mi Sitio Web"
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                    URL del Sitio *
                  </label>
                  <input
                    type="text"
                    value={projectForm.url}
                    onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
                    placeholder="https://ejemplo.com"
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
                    Descripción
                  </label>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Breve descripción del proyecto..."
                    rows={3}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:border-emerald-500/50 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-dark-700 border border-white/10 rounded-xl py-3.5 font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl py-3.5 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      'Guardando...'
                    ) : (
                      <>
                        <Flame className="w-4 h-4" />
                        {editingProject ? 'Guardar' : 'Crear Proyecto'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="bg-dark-700/80 border border-white/5 rounded-xl text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 relative">
            <Globe className="w-10 h-10 text-emerald-400" />
            <Flame className="w-5 h-5 text-orange-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {searchTerm ? 'Sin resultados' : 'Sin proyectos'}
          </h3>
          <p className="text-white/50 mb-6">
            {searchTerm ? 'Intenta con otra búsqueda' : 'Agrega tu primer proyecto para hacer QC'}
          </p>
          {!searchTerm && (
            <button
              onClick={openNewModal}
              className="btn-accent inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar Proyecto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects List/Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Proyectos ({filteredProjects.length})
            </h2>
            <div className={viewMode === 'grid' ? 'space-y-3' : 'bg-dark-700/80 border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden'}>
              {filteredProjects.map((project) => {
                const progress = getProjectProgress(project)
                const statusBadge = getStatusBadge(project.status)
                const isSelected = selectedProject?.id === project.id

                return viewMode === 'grid' ? (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedProject(project)}
                    className={`
                      bg-dark-700/80 border rounded-xl p-5 cursor-pointer transition-all group
                      ${isSelected ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}
                    `}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${progress === 100 ? 'bg-emerald-500' : 'bg-dark-600'} flex items-center justify-center`}>
                          {progress === 100 ? (
                            <CheckCheck className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-sm font-bold">{progress}%</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-white/40 truncate max-w-[200px]">{project.url}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${
                            progress === 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-orange-500' : 'bg-orange-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Visitar sitio"
                      >
                        <ExternalLink className="w-4 h-4 text-white/40" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(project)
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4 text-white/40" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`
                      flex items-center gap-4 p-4 cursor-pointer transition-colors
                      ${isSelected ? 'bg-emerald-500/10' : 'hover:bg-white/[0.02]'}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-lg ${progress === 100 ? 'bg-emerald-500' : 'bg-dark-600'} flex items-center justify-center flex-shrink-0`}>
                      {progress === 100 ? (
                        <CheckCheck className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-xs font-bold">{progress}%</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{project.name}</h3>
                      <p className="text-sm text-white/40 truncate">{project.url}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${statusBadge.bg}`}>
                      {statusBadge.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(project)
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-white/40" />
                      </button>
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
                )
              })}
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Checklist
            </h2>
            {selectedProject ? (
              <div className="bg-dark-700/80 border border-white/5 rounded-xl overflow-hidden">
                {/* Selected project header */}
                <div className="p-4 border-b border-white/5 bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedProject.name}</p>
                      <p className="text-xs text-white/40">{getProjectProgress(selectedProject)}% completado</p>
                    </div>
                  </div>
                </div>

                {/* Checklist items */}
                <div className="divide-y divide-white/5">
                  {checklistItems.map((item) => {
                    const isChecked = selectedProject.checklist?.[item.id]
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleCheck(selectedProject.id, item.id)}
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      >
                        <div
                          className={`
                            w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                            ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 hover:border-white/40'}
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
                        {isChecked && (
                          <Flame className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-dark-700/80 border border-white/5 rounded-xl text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-white/50">Selecciona un proyecto para ver su checklist</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
