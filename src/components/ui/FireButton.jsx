import './FireButton.css'

const gradientMapping = {
  fire: 'linear-gradient(135deg, hsl(20, 90%, 50%), hsl(35, 95%, 55%))',
  orange: 'linear-gradient(135deg, hsl(25, 90%, 50%), hsl(40, 90%, 55%))',
  red: 'linear-gradient(135deg, hsl(5, 90%, 50%), hsl(15, 90%, 55%))',
  purple: 'linear-gradient(135deg, hsl(270, 90%, 55%), hsl(285, 90%, 60%))',
  blue: 'linear-gradient(135deg, hsl(210, 90%, 50%), hsl(225, 90%, 55%))',
  green: 'linear-gradient(135deg, hsl(140, 80%, 45%), hsl(155, 80%, 50%))',
  gold: 'linear-gradient(135deg, hsl(45, 95%, 50%), hsl(35, 90%, 55%))',
}

const FireButton = ({
  children,
  icon,
  color = 'fire',
  variant = 'solid', // 'solid', 'glass', 'outline'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  ...props
}) => {
  const getBackgroundStyle = () => {
    if (gradientMapping[color]) {
      return { background: gradientMapping[color] }
    }
    return { background: color }
  }

  const sizeClass = `fb-${size}`
  const variantClass = `fb-${variant}`

  return (
    <button
      type={type}
      className={`fire-btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{ '--btn-color': gradientMapping[color] || color }}
      {...props}
    >
      <span className="fb-back" style={getBackgroundStyle()} />
      <span className="fb-glow" />
      <span className="fb-front">
        {icon && <span className="fb-icon">{icon}</span>}
        {children && <span className="fb-label">{children}</span>}
      </span>
      <span className="fb-sparks">
        <span className="fb-spark" />
        <span className="fb-spark" />
        <span className="fb-spark" />
      </span>
    </button>
  )
}

// Icon-only variant
export const FireIconButton = ({
  icon,
  color = 'fire',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  label,
  ...props
}) => {
  const getBackgroundStyle = () => {
    if (gradientMapping[color]) {
      return { background: gradientMapping[color] }
    }
    return { background: color }
  }

  const sizeClass = `fib-${size}`

  return (
    <button
      type="button"
      className={`fire-icon-btn ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{ '--btn-color': gradientMapping[color] || color }}
      {...props}
    >
      <span className="fib-back" style={getBackgroundStyle()} />
      <span className="fib-glow" />
      <span className="fib-front">
        <span className="fib-icon">{icon}</span>
      </span>
    </button>
  )
}

// Button group for icon buttons
export const FireButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`fire-btn-group ${className}`}>
      {children}
    </div>
  )
}

export default FireButton
