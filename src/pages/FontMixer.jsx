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
      className="space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
          <Type className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
          Font Mixer
        </h1>
        <p className="text-white/50 text-sm sm:text-base">Encuentra combinaciones perfectas de tipografias</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card">
          <label className="block text-xs sm:text-sm text-white/40 uppercase tracking-wider mb-2">Titulos</label>
          <select
            value={headingFont}
            onChange={(e) => setHeadingFont(e.target.value)}
            className="glass-input w-full text-sm sm:text-base"
          >
            {googleFonts.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <div className="glass-card">
          <label className="block text-xs sm:text-sm text-white/40 uppercase tracking-wider mb-2">Cuerpo</label>
          <select
            value={bodyFont}
            onChange={(e) => setBodyFont(e.target.value)}
            className="glass-input w-full text-sm sm:text-base"
          >
            {googleFonts.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        <button
          onClick={randomize}
          className="glass-card flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-sm sm:text-base"
        >
          <Shuffle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          Aleatorio
        </button>

        <button
          onClick={copyCSS}
          className="btn-accent flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
              Copiar CSS
            </>
          )}
        </button>
      </div>

      {/* Preview */}
      <div className="glass-card">
        <h2 className="text-base sm:text-lg font-bold mb-4 text-white/40">Vista Previa</h2>

        <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 text-gray-900">
          <h1
            style={{ fontFamily: `'${headingFont}', serif` }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900"
          >
            El veloz murcielago hindu comia feliz cardillo y kiwi
          </h1>

          <h2
            style={{ fontFamily: `'${headingFont}', serif` }}
            className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-gray-700"
          >
            Subtitulo con la tipografia de titulos
          </h2>

          <p
            style={{ fontFamily: `'${bodyFont}', sans-serif` }}
            className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 leading-relaxed"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="glass-card">
          <h3 className="text-sm sm:text-base font-semibold mb-2">Tipografia de Titulos</h3>
          <p
            style={{ fontFamily: `'${headingFont}', serif` }}
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500"
          >
            {headingFont}
          </p>
          <p className="text-xs sm:text-sm text-white/40 mt-2">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm</p>
        </div>

        <div className="glass-card">
          <h3 className="text-sm sm:text-base font-semibold mb-2">Tipografia de Cuerpo</h3>
          <p
            style={{ fontFamily: `'${bodyFont}', sans-serif` }}
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500"
          >
            {bodyFont}
          </p>
          <p className="text-xs sm:text-sm text-white/40 mt-2">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm</p>
        </div>
      </div>
    </motion.div>
  )
}
