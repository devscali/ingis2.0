import { useEffect, useRef, useCallback } from 'react'
import './FireCard.css'

// Lightweight fire effect for cards
const FireCard = ({
  children,
  color = '#FF6B35',
  secondaryColor = '#FF8C42',
  intensity = 'medium', // 'subtle', 'medium', 'intense'
  borderRadius = 16,
  className = '',
  style = {},
  animated = true
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)

  // Simple noise
  const noise = useCallback((x, y) => {
    const i = Math.floor(x)
    const j = Math.floor(y)
    const fx = x - i
    const fy = y - j
    const random = (n) => (Math.sin(n * 12.9898 + n * 78.233) * 43758.5453) % 1
    const a = random(i + j * 57)
    const b = random(i + 1 + j * 57)
    const c = random(i + (j + 1) * 57)
    const d = random(i + 1 + (j + 1) * 57)
    const ux = fx * fx * (3.0 - 2.0 * fx)
    const uy = fy * fy * (3.0 - 2.0 * fy)
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy
  }, [])

  useEffect(() => {
    if (!animated) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const intensityMap = { subtle: 0.08, medium: 0.12, intense: 0.18 }
    const fireIntensity = intensityMap[intensity] || 0.12
    const borderOffset = 20

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      const width = rect.width + borderOffset * 2
      const height = rect.height + borderOffset * 2

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)

      return { width, height }
    }

    let { width, height } = updateSize()
    let lastTime = 0

    const draw = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime
      timeRef.current += deltaTime * 1.2

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(dpr, dpr)

      const left = borderOffset
      const top = borderOffset
      const w = width - 2 * borderOffset
      const h = height - 2 * borderOffset
      const r = Math.min(borderRadius, Math.min(w, h) / 2)

      // Draw fire border path
      const drawFirePath = (offset, alpha, lineWidth) => {
        ctx.beginPath()
        const segments = 80

        for (let i = 0; i <= segments; i++) {
          const t = i / segments
          const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r
          const dist = t * perimeter

          let px, py, nx, ny

          const straightW = w - 2 * r
          const straightH = h - 2 * r
          const corner = (Math.PI * r) / 2
          let acc = 0

          if (dist <= acc + straightW) {
            const p = (dist - acc) / straightW
            px = left + r + p * straightW
            py = top
            nx = 0; ny = -1
          } else if ((acc += straightW, dist <= acc + corner)) {
            const p = (dist - acc) / corner
            const angle = -Math.PI / 2 + p * Math.PI / 2
            px = left + w - r + r * Math.cos(angle)
            py = top + r + r * Math.sin(angle)
            nx = Math.cos(angle); ny = Math.sin(angle)
          } else if ((acc += corner, dist <= acc + straightH)) {
            const p = (dist - acc) / straightH
            px = left + w
            py = top + r + p * straightH
            nx = 1; ny = 0
          } else if ((acc += straightH, dist <= acc + corner)) {
            const p = (dist - acc) / corner
            const angle = p * Math.PI / 2
            px = left + w - r + r * Math.cos(angle)
            py = top + h - r + r * Math.sin(angle)
            nx = Math.cos(angle); ny = Math.sin(angle)
          } else if ((acc += corner, dist <= acc + straightW)) {
            const p = (dist - acc) / straightW
            px = left + w - r - p * straightW
            py = top + h
            nx = 0; ny = 1
          } else if ((acc += straightW, dist <= acc + corner)) {
            const p = (dist - acc) / corner
            const angle = Math.PI / 2 + p * Math.PI / 2
            px = left + r + r * Math.cos(angle)
            py = top + h - r + r * Math.sin(angle)
            nx = Math.cos(angle); ny = Math.sin(angle)
          } else if ((acc += corner, dist <= acc + straightH)) {
            const p = (dist - acc) / straightH
            px = left
            py = top + h - r - p * straightH
            nx = -1; ny = 0
          } else {
            acc += straightH
            const p = (dist - acc) / corner
            const angle = Math.PI + p * Math.PI / 2
            px = left + r + r * Math.cos(angle)
            py = top + r + r * Math.sin(angle)
            nx = Math.cos(angle); ny = Math.sin(angle)
          }

          // Apply fire noise displacement
          const n1 = noise(t * 5 + offset, timeRef.current) * 2 - 1
          const n2 = noise(t * 5 + offset + 50, timeRef.current * 1.3) * 2 - 1
          const scale = 15 * fireIntensity

          const dx = px + n1 * scale * nx
          const dy = py + n2 * scale * ny

          if (i === 0) ctx.moveTo(dx, dy)
          else ctx.lineTo(dx, dy)
        }

        ctx.closePath()

        const gradient = ctx.createLinearGradient(left, top + h, left, top)
        gradient.addColorStop(0, color)
        gradient.addColorStop(0.6, secondaryColor)
        gradient.addColorStop(1, '#FFD93D')

        ctx.strokeStyle = gradient
        ctx.lineWidth = lineWidth
        ctx.globalAlpha = alpha
        ctx.stroke()
      }

      // Draw multiple layers
      drawFirePath(0, 0.9, 1.5)
      drawFirePath(0.3, 0.6, 1)
      drawFirePath(0.6, 0.3, 0.5)

      ctx.globalAlpha = 1

      animationRef.current = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(() => {
      const newSize = updateSize()
      width = newSize.width
      height = newSize.height
    })
    resizeObserver.observe(container)

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      resizeObserver.disconnect()
    }
  }, [animated, intensity, borderRadius, color, secondaryColor, noise])

  const intensityClass = intensity === 'subtle' ? 'fc-subtle' : intensity === 'intense' ? 'fc-intense' : ''

  return (
    <div
      ref={containerRef}
      className={`fire-card ${intensityClass} ${className}`}
      style={{
        '--fire-color': color,
        '--fire-secondary': secondaryColor,
        borderRadius,
        ...style
      }}
    >
      {animated && (
        <div className="fc-canvas-wrap">
          <canvas ref={canvasRef} className="fc-canvas" />
        </div>
      )}
      <div className="fc-glow" />
      <div className="fc-content">{children}</div>
    </div>
  )
}

export default FireCard
