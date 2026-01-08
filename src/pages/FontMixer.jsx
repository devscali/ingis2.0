import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Type, RefreshCw, Copy, Check, Shuffle } from 'lucide-react'

const googleFonts = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Playfair Display', 'Merriweather', 'Source Sans Pro', 'Raleway',
  'Nunito', 'Work Sans', 'Oswald', 'Rubik', 'Quicksand',
  'DM Sans', 'Space Grotesk', 'Outfit', 'Plus Jakarta Sans', 'Manrope',
  'Bebas Neue', 'Archivo', 'Barlow', 'Fira Sans', 'IBM Plex Sans'
]

const fontCategories = {
  'Sans Serif': ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Work Sans', 'Raleway', 'Rubik', 'Quicksand', 'DM Sans', 'Space Grotesk', 'Outfit', 'Plus Jakarta Sans', 'Manrope', 'Archivo', 'Barlow', 'Fira Sans', 'IBM Plex Sans'],
  'Serif': ['Playfair Display', 'Merriweather', 'Source Serif Pro', 'Lora', 'PT Serif'],
  'Display': ['Bebas Neue', 'Oswald', 'Anton', 'Abril Fatface']
}

export default function FontMixer() {
  const [headingFont, setHeadingFont] = useState('Playfair Display')
  const [bodyFont, setBodyFont] = useState('Inter')
  const [copied, setCopied] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    // Load Google Fonts
    const fonts = [...new Set([headingFont, bodyFont])]
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fonts.map(f => f.replace(' ', '+')).join('&family=')}&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    link.onload = () => setFontsLoaded(true)

    return () => {
      document.head.removeChild(link)
    }
  }, [headingFont, bodyFont])

  const randomize = () => {
    const headingFonts = [...fontCategories['Serif'], ...fontCategories['Display']]
    const bodyFonts = fontCategories['Sans Serif']
    setHeadingFont(headingFonts[Math.floor(Math.random() * headingFonts.length)])
    setBodyFont(bodyFonts[Math.floor(Math.random() * bodyFonts.length)])
  }

  const copyCSS = () => {
    const css = `/* Font Combination */
@import url('https://fonts.googleapis.com/css2?family=${headingFont.replace(' ', '+')}&family=${bodyFont.replace(' ', '+')}&display=swap');

:root {
  --font-heading: '${headingFont}', serif;
  --font-body: '${bodyFont}', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

body, p {
  font-family: var(--font-body);
}`
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 sm:space-y-10"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Type className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Font Mixer</h1>
          <p className="text-white/50 text-sm sm:text-base mt-1">Encuentra combinaciones perfectas de tipografias</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="glass-card p-5 sm:p-6">
          <label className="block text-xs text-white/40 uppercase tracking-wider mb-3">Titulos</label>
          <select
            value={headingFont}
            onChange={(e) => setHeadingFont(e.target.value)}
            className="glass-input w-full py-3 text-sm sm:text-base"
          >
            {googleFonts.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div className="glass-card p-5 sm:p-6">
          <label className="block text-xs text-white/40 uppercase tracking-wider mb-3">Cuerpo</label>
          <select
            value={bodyFont}
            onChange={(e) => setBodyFont(e.target.value)}
            className="glass-input w-full py-3 text-sm sm:text-base"
          >
            {googleFonts.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <button
          onClick={randomize}
          className="glass-card p-5 sm:p-6 flex items-center justify-center gap-3 hover:bg-white/10 transition-colors text-sm sm:text-base font-medium"
        >
          <Shuffle className="w-5 h-5 text-orange-500" />
          Aleatorio
        </button>

        <button
          onClick={copyCSS}
          className="btn-accent flex items-center justify-center gap-3 text-sm sm:text-base py-5 sm:py-6 rounded-xl"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copiar CSS
            </>
          )}
        </button>
      </div>

      {/* Preview */}
      <div className="glass-card p-6 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold mb-6 text-white/40">Vista Previa</h2>

        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 text-gray-900">
          <h1
            style={{ fontFamily: `'${headingFont}', serif` }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-5 sm:mb-6 text-gray-900"
          >
            El veloz murcielago hindu comia feliz cardillo y kiwi
          </h1>

          <h2
            style={{ fontFamily: `'${headingFont}', serif` }}
            className="text-lg sm:text-xl lg:text-2xl font-semibold mb-5 sm:mb-6 text-gray-700"
          >
            Subtitulo con la tipografia de titulos
          </h2>

          <p
            style={{ fontFamily: `'${bodyFont}', sans-serif` }}
            className="text-sm sm:text-base lg:text-lg text-gray-600 mb-5 leading-relaxed"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>

          <p
            style={{ fontFamily: `'${bodyFont}', sans-serif` }}
            className="text-sm sm:text-base text-gray-500"
          >
            Este es un parrafo mas pequeno para mostrar como se ve el texto secundario con la tipografia seleccionada para el cuerpo del documento.
          </p>
        </div>
      </div>

      {/* Font Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="glass-card p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-semibold mb-3 text-white/60">Tipografia de Titulos</h3>
          <p
            style={{ fontFamily: `'${headingFont}', serif` }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-4"
          >
            {headingFont}
          </p>
          <p className="text-sm text-white/40">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm</p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-semibold mb-3 text-white/60">Tipografia de Cuerpo</h3>
          <p
            style={{ fontFamily: `'${bodyFont}', sans-serif` }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-4"
          >
            {bodyFont}
          </p>
          <p className="text-sm text-white/40">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm</p>
        </div>
      </div>
    </motion.div>
  )
}
