import { useState, useEffect, useRef } from 'react'
import './App.css'

function Blackhole() {
  const [particles, setParticles] = useState([])
  const canvasRef = useRef(null)
  const requestRef = useRef()
  
  const PARTICLE_COUNT = 100 // More particles
  const BLACK_HOLE_RADIUS = 50 // Larger radius
  const GRAVITY_STRENGTH = 0.007 // Stronger gravity
  const ACCRETION_DISK_RADIUS = 200 // Larger disk

  useEffect(() => {
    // Initialize canvas size
    const canvas = canvasRef.current
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Initialize particles in a circle around black hole
    const initialParticles = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2
      const distance = ACCRETION_DISK_RADIUS + (Math.random() * 100)
      return {
        x: window.innerWidth/2 + Math.cos(angle) * distance,
        y: window.innerHeight/2 + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 2 + 1,
        color: `hsl(${Math.random() * 60 + 20}, 100%, 60%)`
      }
    })
    setParticles(initialParticles)

    // Start animation
    requestRef.current = requestAnimationFrame(updateParticles)
    
    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [])

  const updateParticles = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw black hole
    ctx.beginPath()
    ctx.fillStyle = 'black'
    ctx.arc(window.innerWidth/2, window.innerHeight/2, BLACK_HOLE_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // Update and draw particles
    setParticles(prev => prev.map(particle => {
      const dx = window.innerWidth/2 - particle.x
      const dy = window.innerHeight/2 - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < BLACK_HOLE_RADIUS) {
        const angle = Math.random() * Math.PI * 2
        return {
          ...particle,
          x: window.innerWidth/2 + Math.cos(angle) * ACCRETION_DISK_RADIUS,
          y: window.innerHeight/2 + Math.sin(angle) * ACCRETION_DISK_RADIUS,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2
        }
      }

      const force = GRAVITY_STRENGTH / (distance * 0.5)
      const newVx = particle.vx + dx * force
      const newVy = particle.vy + dy * force

      // Draw particle
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
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        background: '#000',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    />
  )
}

export default Blackhole