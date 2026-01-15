import { useEffect, useRef, useCallback } from 'react'
import './FireBorder.css'

const FireBorder = ({
  children,
  color = '#FF6B35',
  secondaryColor = '#FF8C42',
  tertiaryColor = '#FFD93D',
  speed = 1.5,
  intensity = 0.15,
  borderRadius = 16,
  className = '',
  style = {},
  glowIntensity = 0.6,
  particleCount = 20
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)
  const lastFrameTimeRef = useRef(0)
  const particlesRef = useRef([])

  // Noise function for organic movement
  const noise2D = useCallback((x, y) => {
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

  // Fractal noise for fire effect
  const fireNoise = useCallback((x, time, octaves = 4) => {
    let value = 0
    let amplitude = 1
    let frequency = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      value += amplitude * noise2D(x * frequency, time * frequency * 0.5)
      maxValue += amplitude
      amplitude *= 0.5
      frequency *= 2
    }

    return value / maxValue
  }, [noise2D])

  // Get point on rounded rectangle
  const getRoundedRectPoint = useCallback((t, left, top, width, height, radius) => {
    const straightWidth = width - 2 * radius
    const straightHeight = height - 2 * radius
    const cornerArc = (Math.PI * radius) / 2
    const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc
    const distance = t * totalPerimeter

    let accumulated = 0

    // Top edge
    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth
      return { x: left + radius + progress * straightWidth, y: top, normal: { x: 0, y: -1 } }
    }
    accumulated += straightWidth

    // Top-right corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc
      const angle = -Math.PI / 2 + progress * (Math.PI / 2)
      return {
        x: left + width - radius + radius * Math.cos(angle),
        y: top + radius + radius * Math.sin(angle),
        normal: { x: Math.cos(angle), y: Math.sin(angle) }
      }
    }
    accumulated += cornerArc

    // Right edge
    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight
      return { x: left + width, y: top + radius + progress * straightHeight, normal: { x: 1, y: 0 } }
    }
    accumulated += straightHeight

    // Bottom-right corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc
      const angle = progress * (Math.PI / 2)
      return {
        x: left + width - radius + radius * Math.cos(angle),
        y: top + height - radius + radius * Math.sin(angle),
        normal: { x: Math.cos(angle), y: Math.sin(angle) }
      }
    }
    accumulated += cornerArc

    // Bottom edge
    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth
      return { x: left + width - radius - progress * straightWidth, y: top + height, normal: { x: 0, y: 1 } }
    }
    accumulated += straightWidth

    // Bottom-left corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc
      const angle = Math.PI / 2 + progress * (Math.PI / 2)
      return {
        x: left + radius + radius * Math.cos(angle),
        y: top + height - radius + radius * Math.sin(angle),
        normal: { x: Math.cos(angle), y: Math.sin(angle) }
      }
    }
    accumulated += cornerArc

    // Left edge
    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight
      return { x: left, y: top + height - radius - progress * straightHeight, normal: { x: -1, y: 0 } }
    }
    accumulated += straightHeight

    // Top-left corner
    const progress = (distance - accumulated) / cornerArc
    const angle = Math.PI + progress * (Math.PI / 2)
    return {
      x: left + radius + radius * Math.cos(angle),
      y: top + radius + radius * Math.sin(angle),
      normal: { x: Math.cos(angle), y: Math.sin(angle) }
    }
  }, [])

  // Initialize particles
  const initParticles = useCallback((width, height, borderOffset) => {
    const particles = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        t: Math.random(), // Position along border (0-1)
        offset: Math.random() * 30 - 15,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.3 + 0.1,
        life: Math.random(),
        maxLife: Math.random() * 0.5 + 0.5
      })
    }
    return particles
  }, [particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const borderOffset = 40

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

      particlesRef.current = initParticles(width, height, borderOffset)

      return { width, height }
    }

    let { width, height } = updateSize()

    const drawFireBorder = (currentTime) => {
      if (!canvas || !ctx) return

      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000
      timeRef.current += deltaTime * speed
      lastFrameTimeRef.current = currentTime

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(dpr, dpr)

      const left = borderOffset
      const top = borderOffset
      const borderWidth = width - 2 * borderOffset
      const borderHeight = height - 2 * borderOffset
      const maxRadius = Math.min(borderWidth, borderHeight) / 2
      const radius = Math.min(borderRadius, maxRadius)

      const approximatePerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius
      const sampleCount = Math.floor(approximatePerimeter / 1.5)

      // Draw multiple fire layers
      for (let layer = 0; layer < 3; layer++) {
        const layerOffset = layer * 0.3
        const layerIntensity = intensity * (1 - layer * 0.2)
        const layerAlpha = 0.8 - layer * 0.2

        ctx.beginPath()

        for (let i = 0; i <= sampleCount; i++) {
          const progress = i / sampleCount
          const point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius)

          // Fire displacement - more aggressive upward on top edges
          const noiseX = fireNoise(progress * 6 + layerOffset, timeRef.current) * 2 - 1
          const noiseY = fireNoise(progress * 6 + layerOffset + 100, timeRef.current * 1.5) * 2 - 1

          // Bias upward movement
          const upwardBias = point.normal.y < 0 ? 1.5 : 0.5
          const scale = 25 * layerIntensity

          const displacedX = point.x + noiseX * scale * point.normal.x
          const displacedY = point.y + (noiseY * scale - Math.abs(noiseY) * scale * upwardBias) * point.normal.y

          if (i === 0) {
            ctx.moveTo(displacedX, displacedY)
          } else {
            ctx.lineTo(displacedX, displacedY)
          }
        }

        ctx.closePath()

        // Gradient stroke for fire effect
        const gradient = ctx.createLinearGradient(0, height, 0, 0)
        gradient.addColorStop(0, color)
        gradient.addColorStop(0.5, secondaryColor)
        gradient.addColorStop(1, tertiaryColor)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2 - layer * 0.5
        ctx.globalAlpha = layerAlpha
        ctx.stroke()
      }

      // Draw fire particles
      ctx.globalAlpha = 1
      particlesRef.current.forEach((particle, index) => {
        // Update particle
        particle.t += particle.speed * deltaTime * 0.1
        if (particle.t > 1) particle.t -= 1

        particle.life += deltaTime * 2
        if (particle.life > particle.maxLife) {
          particle.life = 0
          particle.t = Math.random()
          particle.offset = Math.random() * 30 - 15
        }

        const point = getRoundedRectPoint(particle.t, left, top, borderWidth, borderHeight, radius)
        const lifeProgress = particle.life / particle.maxLife
        const alpha = Math.sin(lifeProgress * Math.PI) * 0.8

        // Particle rises up
        const riseOffset = lifeProgress * 20

        const px = point.x + point.normal.x * particle.offset
        const py = point.y + point.normal.y * particle.offset - riseOffset

        // Draw glowing particle
        const particleGradient = ctx.createRadialGradient(px, py, 0, px, py, particle.size * 3)
        particleGradient.addColorStop(0, `rgba(255, 220, 100, ${alpha})`)
        particleGradient.addColorStop(0.5, `rgba(255, 140, 50, ${alpha * 0.5})`)
        particleGradient.addColorStop(1, 'rgba(255, 100, 50, 0)')

        ctx.beginPath()
        ctx.arc(px, py, particle.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = particleGradient
        ctx.fill()

        // Core of particle
        ctx.beginPath()
        ctx.arc(px, py, particle.size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(drawFireBorder)
    }

    const resizeObserver = new ResizeObserver(() => {
      const newSize = updateSize()
      width = newSize.width
      height = newSize.height
    })
    resizeObserver.observe(container)

    animationRef.current = requestAnimationFrame(drawFireBorder)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      resizeObserver.disconnect()
    }
  }, [color, secondaryColor, tertiaryColor, speed, intensity, borderRadius, fireNoise, getRoundedRectPoint, initParticles, particleCount])

  const vars = {
    '--fire-color': color,
    '--fire-secondary': secondaryColor,
    '--fire-tertiary': tertiaryColor,
    '--fire-glow-intensity': glowIntensity,
    borderRadius: borderRadius
  }

  return (
    <div ref={containerRef} className={`fire-border ${className}`} style={{ ...vars, ...style }}>
      <div className="fb-canvas-container">
        <canvas ref={canvasRef} className="fb-canvas" />
      </div>
      <div className="fb-layers">
        <div className="fb-glow-1" />
        <div className="fb-glow-2" />
        <div className="fb-ember-glow" />
      </div>
      <div className="fb-content">{children}</div>
    </div>
  )
}

export default FireBorder
