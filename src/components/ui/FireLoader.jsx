import { useEffect, useRef } from 'react';
import './FireLoader.css';

/**
 * FireLoader - A mesmerizing fire portal loader animation
 * Uses Canvas for smooth fire particle effects
 */
const FireLoader = ({
  size = 200,
  text = 'Loading...',
  showText = true,
  color = '#FF6B35',
  secondaryColor = '#FF8C42',
  coreColor = '#FFD93D',
}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    // Particle class for fire effect
    class FireParticle {
      constructor() {
        this.reset();
      }

      reset() {
        // Start from the ring
        const angle = Math.random() * Math.PI * 2;
        const ringRadius = radius + (Math.random() - 0.5) * 20;

        this.x = centerX + Math.cos(angle) * ringRadius;
        this.y = centerY + Math.sin(angle) * ringRadius;
        this.angle = angle;

        // Move towards center with some randomness
        this.vx = -Math.cos(angle) * (0.5 + Math.random() * 1.5);
        this.vy = -Math.sin(angle) * (0.5 + Math.random() * 1.5);

        // Add upward drift for fire effect
        this.vy -= Math.random() * 0.5;

        this.size = 2 + Math.random() * 4;
        this.life = 1;
        this.decay = 0.01 + Math.random() * 0.02;

        // Color variation
        const colorChoice = Math.random();
        if (colorChoice < 0.4) {
          this.color = color;
        } else if (colorChoice < 0.7) {
          this.color = secondaryColor;
        } else {
          this.color = coreColor;
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.98;

        // Add some flickering movement
        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.1 - 0.05; // Upward bias

        if (this.life <= 0 || this.size < 0.5) {
          this.reset();
        }
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life * 0.8;
        ctx.fill();

        // Add glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = this.life * 0.3;
        ctx.fill();
      }
    }

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < 80; i++) {
      particlesRef.current.push(new FireParticle());
    }

    let rotation = 0;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Draw rotating fire ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.translate(-centerX, -centerY);

      // Outer glow ring
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.7,
        centerX, centerY, radius * 1.3
      );
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, `${color}40`);
      gradient.addColorStop(0.7, `${secondaryColor}60`);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Fire ring segments
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        const flicker = Math.sin(Date.now() * 0.01 + i * 0.5) * 5;
        const segRadius = radius + flicker;

        const x = centerX + Math.cos(angle) * segRadius;
        const y = centerY + Math.sin(angle) * segRadius;

        const segGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        segGradient.addColorStop(0, coreColor);
        segGradient.addColorStop(0.5, color);
        segGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(x, y, 8 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = segGradient;
        ctx.globalAlpha = 0.8;
        ctx.fill();
      }

      ctx.restore();
      ctx.globalAlpha = 1;

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      ctx.globalAlpha = 1;

      // Draw center core (dark with subtle glow)
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius * 0.6
      );
      coreGradient.addColorStop(0, 'rgba(20, 20, 30, 0.9)');
      coreGradient.addColorStop(0.7, 'rgba(20, 20, 30, 0.6)');
      coreGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Inner fire glow at core edge
      const innerGlow = ctx.createRadialGradient(
        centerX, centerY, radius * 0.3,
        centerX, centerY, radius * 0.7
      );
      innerGlow.addColorStop(0, 'transparent');
      innerGlow.addColorStop(0.8, `${color}30`);
      innerGlow.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      rotation += 0.005;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, color, secondaryColor, coreColor]);

  return (
    <div className="fire-loader" style={{ width: size, height: size + (showText ? 40 : 0) }}>
      <div className="fire-loader-container">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="fire-loader-canvas"
        />
        <div className="fire-loader-icon">
          <svg viewBox="0 0 24 24" fill="none" style={{ width: size * 0.2, height: size * 0.2 }}>
            <path
              d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z"
              fill={coreColor}
              opacity="0.9"
            />
            <path
              d="M12 22C8.13 22 5 18.87 5 15C5 11.5 7.5 8.5 10 6.5C10 8.5 11 10 12 10C13 10 14 8.5 14 6.5C16.5 8.5 19 11.5 19 15C19 18.87 15.87 22 12 22Z"
              fill={color}
              opacity="0.8"
            />
          </svg>
        </div>
      </div>
      {showText && (
        <div className="fire-loader-text" style={{ color }}>
          {text}
        </div>
      )}
    </div>
  );
};

/**
 * FireLoaderOverlay - Full screen loader overlay
 */
export const FireLoaderOverlay = ({
  loading = true,
  text = 'Loading...',
  size = 200,
}) => {
  if (!loading) return null;

  return (
    <div className="fire-loader-overlay">
      <FireLoader size={size} text={text} />
    </div>
  );
};

/**
 * FireLoaderInline - Smaller inline loader
 */
export const FireLoaderInline = ({
  size = 40,
  color = '#FF6B35',
}) => {
  return (
    <div className="fire-loader-inline">
      <div
        className="fire-loader-spinner"
        style={{
          width: size,
          height: size,
          borderColor: `${color}30`,
          borderTopColor: color,
        }}
      />
      <div
        className="fire-loader-spinner fire-loader-spinner-inner"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          borderColor: `${color}20`,
          borderTopColor: `${color}80`,
        }}
      />
    </div>
  );
};

export default FireLoader;
