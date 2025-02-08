import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [showSettings, setShowSettings] = useState(true)
  const [particles, setParticles] = useState([])
  const [settings, setSettings] = useState({
    particleCount: 100,
    blackHoleRadius: 50,
    gravityStrength: 0.007,
    diskRadius: 200,
    particleSize: 2,
    particleColor: '#FFD700',
    trailOpacity: 0.1
  })
  
  const canvasRef = useRef(null)
  const requestRef = useRef()

  // Add keyboard shortcut for settings panel
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') setShowSettings(false)
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const initializeParticles = useCallback(() => {
    const initialParticles = Array.from({ length: settings.particleCount }, () => {
      const angle = Math.random() * Math.PI * 2
      const distance = settings.diskRadius + (Math.random() * 100)
      return {
        x: window.innerWidth/2 + Math.cos(angle) * distance,
        y: window.innerHeight/2 + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * settings.particleSize + 1,
        color: settings.particleColor
      }
    })
    setParticles(initialParticles)
  }, [settings])

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = `rgba(0, 0, 0, ${settings.trailOpacity})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw black hole
    ctx.beginPath()
    const gradient = ctx.createRadialGradient(
      window.innerWidth/2, window.innerHeight/2, settings.blackHoleRadius * 0.8,
      window.innerWidth/2, window.innerHeight/2, settings.blackHoleRadius * 1.5
    )
    gradient.addColorStop(0, 'black')
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.8)')
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.arc(window.innerWidth/2, window.innerHeight/2, settings.blackHoleRadius * 1.5, 0, Math.PI * 2)
    ctx.fill()

    setParticles(prev => prev.map(particle => {
      const dx = window.innerWidth/2 - particle.x
      const dy = window.innerHeight/2 - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < settings.blackHoleRadius) {
        const angle = Math.random() * Math.PI * 2
        return {
          ...particle,
          x: window.innerWidth/2 + Math.cos(angle) * settings.diskRadius,
          y: window.innerHeight/2 + Math.sin(angle) * settings.diskRadius,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2
        }
      }

      const force = settings.gravityStrength / (distance * 0.5)
      const newVx = particle.vx + dx * force
      const newVy = particle.vy + dy * force

      ctx.beginPath()
      ctx.fillStyle = particle.color
      ctx.shadowBlur = 15
      ctx.shadowColor = particle.color
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      return {
        ...particle,
        x: particle.x + newVx,
        y: particle.y + newVy,
        vx: newVx,
        vy: newVy
      }
    }))

    requestRef.current = requestAnimationFrame(updateParticles)
  }, [settings])

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    initializeParticles()
    requestRef.current = requestAnimationFrame(updateParticles)
    
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initializeParticles()
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(requestRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [initializeParticles, updateParticles])

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          background: '#000',
          position: 'fixed',
          top: 0,
          left: 0
        }}
      />
      <button 
        className="settings-toggle"
        onClick={() => setShowSettings(!showSettings)}
        title={showSettings ? 'Close Settings' : 'Open Settings'}
      >
        {showSettings ? '×' : '⚙'}
      </button>
      <div className={`settings-panel ${showSettings ? 'show' : ''}`}>
        <div className="settings-header">
          <h3>Black Hole Settings</h3>
          <button 
            className="close-button"
            onClick={() => setShowSettings(false)}
          >
            ×
          </button>
        </div>
        
        <label>
          Particle Count:
          <input
            type="range"
            min="10"
            max="1000"
            value={settings.particleCount}
            onChange={e => {
              setSettings(prev => ({
                ...prev,
                particleCount: parseInt(e.target.value)
              }))
              initializeParticles()
            }}
          />
          <span>{settings.particleCount}</span>
        </label>

        <label>
          Black Hole Radius:
          <input
            type="range"
            min="10"
            max="100"
            value={settings.blackHoleRadius}
            onChange={e => setSettings(prev => ({
              ...prev,
              blackHoleRadius: parseInt(e.target.value)
            }))}
          />
          <span>{settings.blackHoleRadius}px</span>
        </label>

        <label>
          Gravity Strength:
          <input
            type="range"
            min="0.001"
            max="0.02"
            step="0.001"
            value={settings.gravityStrength}
            onChange={e => setSettings(prev => ({
              ...prev,
              gravityStrength: parseFloat(e.target.value)
            }))}
          />
          <span>{settings.gravityStrength.toFixed(3)}</span>
        </label>

        <label>
          Disk Radius:
          <input
            type="range"
            min="100"
            max="500"
            value={settings.diskRadius}
            onChange={e => setSettings(prev => ({
              ...prev,
              diskRadius: parseInt(e.target.value)
            }))}
          />
          <span>{settings.diskRadius}px</span>
        </label>

        <label>
          Particle Size:
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={settings.particleSize}
            onChange={e => setSettings(prev => ({
              ...prev,
              particleSize: parseFloat(e.target.value)
            }))}
          />
          <span>{settings.particleSize}px</span>
        </label>

        <label>
          Trail Opacity:
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={settings.trailOpacity}
            onChange={e => setSettings(prev => ({
              ...prev,
              trailOpacity: parseFloat(e.target.value)
            }))}
          />
          <span>{settings.trailOpacity}</span>
        </label>

        <label>
          Particle Color:
          <input
            type="color"
            value={settings.particleColor}
            onChange={e => setSettings(prev => ({
              ...prev,
              particleColor: e.target.value
            }))}
          />
        </label>

        <button
          onClick={() => {
            setSettings({
              particleCount: 100,
              blackHoleRadius: 50,
              gravityStrength: 0.007,
              diskRadius: 200,
              particleSize: 2,
              particleColor: '#FFD700',
              trailOpacity: 0.1
            })
            initializeParticles()
          }}
        >
          Reset Settings
        </button>
      </div>
    </>
  )
}

export default App