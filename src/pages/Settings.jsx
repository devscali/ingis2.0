import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Key,
  Users,
  Palette,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle
} from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'

const colorOptions = [
  'bg-blue-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-yellow-500',
]

export default function Settings() {
  const {
    theme,
    toggleTheme,
    openaiApiKey,
    setOpenaiApiKey,
    teamMembers,
    addTeamMember,
    updateTeamMember,
    removeTeamMember
  } = useSettingsStore()

  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(openaiApiKey)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberColor, setNewMemberColor] = useState('bg-blue-500')

  const handleSaveApiKey = () => {
    setOpenaiApiKey(apiKeyInput)
    setApiKeySaved(true)
    setTimeout(() => setApiKeySaved(false), 2000)
  }

  const handleAddMember = () => {
    if (!newMemberName.trim()) return
    addTeamMember({
      name: newMemberName.trim(),
      color: newMemberColor
    })
    setNewMemberName('')
    setNewMemberColor('bg-blue-500')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8 max-w-3xl"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-4">
          <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white/50" />
          Configuración
        </h1>
        <p className="text-white/50">Personaliza tu experiencia en IgnisOS</p>
      </div>

      {/* Theme Section */}
      <section className="bg-dark-700/80 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Palette className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Apariencia</h2>
            <p className="text-sm text-white/50">Elige el tema de la interfaz</p>
          </div>
        </div>

        <div className="flex gap-5">
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Moon className="w-5 h-5" />
              <span className="font-medium">Oscuro</span>
            </div>
          </button>
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
              theme === 'light'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Sun className="w-5 h-5" />
              <span className="font-medium">Claro</span>
            </div>
          </button>
        </div>
      </section>

      {/* API Key Section */}
      <section className="bg-dark-700/80 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Key className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg">OpenAI API Key</h2>
            <p className="text-sm text-white/50">Necesaria para TorchAI</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-4 pr-14 outline-none focus:border-white/20 transition-colors"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {showApiKey ? (
                <EyeOff className="w-5 h-5 text-white/50" />
              ) : (
                <Eye className="w-5 h-5 text-white/50" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveApiKey}
              disabled={apiKeyInput === openaiApiKey}
              className="btn-accent py-3 px-6 flex items-center gap-2 disabled:opacity-50"
            >
              {apiKeySaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Guardado
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar
                </>
              )}
            </button>
            {!openaiApiKey && (
              <span className="text-sm text-yellow-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Sin configurar
              </span>
            )}
          </div>

          <p className="text-sm text-white/40 pt-1">
            Tu API key se guarda localmente en tu navegador. Nunca se envía a nuestros servidores.
          </p>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="bg-dark-700/80 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Equipo</h2>
            <p className="text-sm text-white/50">Miembros disponibles en WeeklyOps y TorchAI</p>
          </div>
        </div>

        {/* Current Members */}
        <div className="space-y-3 mb-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 group"
            >
              <div className={`w-11 h-11 rounded-full ${member.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {member.name[0]}
              </div>
              <input
                type="text"
                value={member.name}
                onChange={(e) => updateTeamMember(member.id, { name: e.target.value })}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-base"
              />
              <div className="flex gap-2">
                {colorOptions.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    onClick={() => updateTeamMember(member.id, { color })}
                    className={`w-7 h-7 rounded-full ${color} transition-all ${member.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800' : 'opacity-50 hover:opacity-100'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => removeTeamMember(member.id)}
                className="p-2.5 rounded-lg hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all ml-2"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Member */}
        <div className="flex gap-4 items-center">
          <div className={`w-11 h-11 rounded-full ${newMemberColor} flex items-center justify-center text-white font-bold flex-shrink-0`}>
            {newMemberName[0] || '+'}
          </div>
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
            placeholder="Nombre del nuevo miembro"
            className="flex-1 bg-dark-800/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/20 transition-colors"
          />
          <div className="flex gap-2 items-center">
            {colorOptions.slice(0, 5).map((color) => (
              <button
                key={color}
                onClick={() => setNewMemberColor(color)}
                className={`w-7 h-7 rounded-full ${color} transition-all ${newMemberColor === color ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'}`}
              />
            ))}
          </div>
          <button
            onClick={handleAddMember}
            disabled={!newMemberName.trim()}
            className="btn-accent p-3.5 disabled:opacity-50 flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </section>
    </motion.div>
  )
}
