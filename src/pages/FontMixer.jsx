import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { ExternalLink } from 'lucide-react'

export default function FontMixer() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span>🔤</span> Font Mixer
        </h1>
        <p className="text-white/50">Encuentra combinaciones perfectas de tipografías</p>
      </div>

      <Card className="text-center py-12">
        <div className="text-5xl mb-4">🔤</div>
        <h3 className="text-xl font-bold mb-2">Font Mixer</h3>
        <p className="text-white/50 mb-6">Esta herramienta se abre en una ventana separada</p>
        <a
          href="/apps/font-mixer/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent inline-flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir Font Mixer
        </a>
      </Card>
    </motion.div>
  )
}
