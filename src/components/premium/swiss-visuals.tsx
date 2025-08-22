'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// Swiss Flag Component with Physics Animation
export const SwissFlag: React.FC<{ className?: string; animated?: boolean }> = ({ 
  className, 
  animated = true 
}) => {
  const flagRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!animated || !flagRef.current) return

    const flag = flagRef.current
    let animationId: number

    const animate = () => {
      const time = Date.now() * 0.002
      const wave1 = Math.sin(time) * 2
      const wave2 = Math.sin(time * 1.3) * 1.5
      
      flag.style.transform = `
        perspective(1000px) 
        rotateY(${wave1}deg) 
        rotateX(${wave2}deg)
        translateZ(${Math.sin(time * 0.7) * 5}px)
      `
      
      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [animated])

  return (
    <div 
      ref={flagRef}
      className={cn(
        "relative inline-block bg-primary-600 border border-primary-700 shadow-lg transition-all duration-500",
        animated && "hover:scale-110",
        className
      )}
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '6px'
      }}
    >
      {/* Swiss Cross */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Horizontal bar */}
          <div 
            className="absolute bg-white shadow-inner"
            style={{
              width: '32px',
              height: '8px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
          {/* Vertical bar */}
          <div 
            className="absolute bg-white shadow-inner"
            style={{
              width: '8px',
              height: '32px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      </div>
      
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 rounded-md opacity-30"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.2) 100%)'
        }}
      />
    </div>
  )
}

// Swiss Alps SVG Illustration
export const SwissAlps: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <svg
        viewBox="0 0 1200 300"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
      >
        <defs>
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="30%" stopColor="#D1D5DB" />
            <stop offset="70%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#6B7280" />
          </linearGradient>
          <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F3F4F6" />
          </linearGradient>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        
        {/* Sky */}
        <rect width="1200" height="300" fill="url(#skyGradient)" opacity="0.3" />
        
        {/* Mountain Range */}
        <path
          d="M0,300 L0,200 L100,120 L200,180 L300,80 L400,140 L500,60 L600,120 L700,40 L800,100 L900,20 L1000,80 L1100,140 L1200,100 L1200,300 Z"
          fill="url(#mountainGradient)"
          className="opacity-90"
        />
        
        {/* Snow Caps */}
        <path
          d="M250,80 L300,80 L320,95 L280,95 Z"
          fill="url(#snowGradient)"
        />
        <path
          d="M450,60 L500,60 L520,75 L480,75 Z"
          fill="url(#snowGradient)"
        />
        <path
          d="M650,40 L700,40 L720,55 L680,55 Z"
          fill="url(#snowGradient)"
        />
        <path
          d="M850,20 L900,20 L920,35 L880,35 Z"
          fill="url(#snowGradient)"
        />
      </svg>
    </div>
  )
}

// Animated Swiss Cross Loader
export const SwissCrossLoader: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className 
}) => {
  return (
    <div 
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
    >
      <div 
        className="absolute inset-0 animate-spin"
        style={{
          background: 'conic-gradient(from 0deg, #FF0000, #ffffff, #FF0000)',
          borderRadius: '50%',
          padding: '2px'
        }}
      >
        <div 
          className="w-full h-full bg-white rounded-full flex items-center justify-center"
        >
          <SwissFlag className="w-6 h-6" animated={false} />
        </div>
      </div>
    </div>
  )
}

// Premium Floating Particles
export const FloatingParticles: React.FC<{ count?: number; className?: string }> = ({ 
  count = 20, 
  className 
}) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.2
  }))

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
    </div>
  )
}

// Swiss Precision Grid Pattern
export const SwissPrecisionGrid: React.FC<{ className?: string; intensity?: number }> = ({ 
  className, 
  intensity = 0.05 
}) => {
  return (
    <div 
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 0, 0, ${intensity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 0, 0, ${intensity}) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}
    />
  )
}

// Luxury Gradient Orb
export const LuxuryGradientOrb: React.FC<{ 
  size?: number; 
  colors?: string[]; 
  className?: string;
  animated?: boolean;
}> = ({ 
  size = 300, 
  colors = ['#FF0000', '#0066CC', '#FFD700'], 
  className,
  animated = true 
}) => {
  return (
    <div 
      className={cn("relative rounded-full blur-3xl opacity-30", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from 0deg, ${colors.join(', ')})`,
        animation: animated ? 'gradient-shift 8s ease infinite, float 6s ease-in-out infinite' : 'none'
      }}
    />
  )
}

// Swiss Watch Inspired Clock
export const SwissClockElement: React.FC<{ className?: string; showTime?: boolean }> = ({ 
  className, 
  showTime = false 
}) => {
  const [time, setTime] = React.useState(new Date())

  useEffect(() => {
    if (!showTime) return
    
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [showTime])

  const hourAngle = ((time.getHours() % 12) * 30) + (time.getMinutes() * 0.5)
  const minuteAngle = time.getMinutes() * 6
  const secondAngle = time.getSeconds() * 6

  return (
    <div className={cn("relative inline-block", className)}>
      <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg">
        {/* Watch face */}
        <circle
          cx="40"
          cy="40"
          r="38"
          fill="white"
          stroke="#1F2937"
          strokeWidth="2"
        />
        
        {/* Swiss cross at center */}
        <g transform="translate(40, 40)">
          <rect x="-8" y="-2" width="16" height="4" fill="#FF0000" />
          <rect x="-2" y="-8" width="4" height="16" fill="#FF0000" />
        </g>
        
        {/* Hour markers */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30) * (Math.PI / 180)
          const x1 = 40 + Math.sin(angle) * 30
          const y1 = 40 - Math.cos(angle) * 30
          const x2 = 40 + Math.sin(angle) * 35
          const y2 = 40 - Math.cos(angle) * 35
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#1F2937"
              strokeWidth={i % 3 === 0 ? "3" : "1"}
            />
          )
        })}
        
        {showTime && (
          <>
            {/* Hour hand */}
            <line
              x1="40"
              y1="40"
              x2={40 + Math.sin(hourAngle * Math.PI / 180) * 20}
              y2={40 - Math.cos(hourAngle * Math.PI / 180) * 20}
              stroke="#1F2937"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* Minute hand */}
            <line
              x1="40"
              y1="40"
              x2={40 + Math.sin(minuteAngle * Math.PI / 180) * 28}
              y2={40 - Math.cos(minuteAngle * Math.PI / 180) * 28}
              stroke="#1F2937"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Second hand */}
            <line
              x1="40"
              y1="40"
              x2={40 + Math.sin(secondAngle * Math.PI / 180) * 30}
              y2={40 - Math.cos(secondAngle * Math.PI / 180) * 30}
              stroke="#FF0000"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </>
        )}
        
        {/* Center dot */}
        <circle cx="40" cy="40" r="3" fill="#1F2937" />
      </svg>
    </div>
  )
}

// Premium Data Visualization
export const DataVisualization: React.FC<{ 
  data?: number[]; 
  className?: string; 
  animated?: boolean;
}> = ({ 
  data = [65, 85, 92, 78, 95, 88, 76, 91], 
  className,
  animated = true 
}) => {
  const maxValue = Math.max(...data)
  
  return (
    <div className={cn("flex items-end space-x-2 h-24", className)}>
      {data.map((value, index) => (
        <div
          key={index}
          className="relative flex-1 bg-gradient-to-t from-primary-500 to-blue-500 rounded-t-sm transition-all duration-1000 hover:scale-110"
          style={{
            height: animated ? `${(value / maxValue) * 100}%` : '100%',
            animationDelay: `${index * 100}ms`,
            minWidth: '8px'
          }}
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600">
            {value}%
          </div>
        </div>
      ))}
    </div>
  )
}

// Swiss Shield Icon with Animation
export const SwissShield: React.FC<{ className?: string; glowing?: boolean }> = ({ 
  className, 
  glowing = false 
}) => {
  return (
    <div className={cn("relative inline-block", className)}>
      <svg width="48" height="56" viewBox="0 0 48 56" className="drop-shadow-lg">
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="100%" stopColor="#CC0000" />
          </linearGradient>
          {glowing && (
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Shield shape */}
        <path
          d="M24 4 L4 12 L4 28 Q4 42 24 52 Q44 42 44 28 L44 12 Z"
          fill="url(#shieldGradient)"
          stroke="#AA0000"
          strokeWidth="1"
          filter={glowing ? "url(#glow)" : undefined}
        />
        
        {/* Swiss cross */}
        <g transform="translate(24, 28)" fill="white">
          <rect x="-8" y="-2" width="16" height="4" />
          <rect x="-2" y="-8" width="4" height="16" />
        </g>
        
        {/* Highlight */}
        <path
          d="M24 4 L4 12 L4 28 Q4 32 8 36"
          fill="rgba(255, 255, 255, 0.2)"
          stroke="none"
        />
      </svg>
    </div>
  )
}

// Advanced Swiss Pattern Background
export const SwissPatternBackground: React.FC<{ 
  className?: string; 
  variant?: 'cross' | 'grid' | 'hexagon';
  opacity?: number;
}> = ({ 
  className, 
  variant = 'cross', 
  opacity = 0.1 
}) => {
  const patterns = {
    cross: `
      <defs>
        <pattern id="swiss-cross" patternUnits="userSpaceOnUse" width="40" height="40">
          <rect width="40" height="40" fill="transparent"/>
          <rect x="16" y="8" width="8" height="24" fill="rgba(255,0,0,${opacity})"/>
          <rect x="8" y="16" width="24" height="8" fill="rgba(255,0,0,${opacity})"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#swiss-cross)"/>
    `,
    grid: `
      <defs>
        <pattern id="swiss-grid" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill="transparent"/>
          <rect x="0" y="0" width="1" height="20" fill="rgba(255,0,0,${opacity})"/>
          <rect x="0" y="0" width="20" height="1" fill="rgba(255,0,0,${opacity})"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#swiss-grid)"/>
    `,
    hexagon: `
      <defs>
        <pattern id="swiss-hex" patternUnits="userSpaceOnUse" width="60" height="52">
          <rect width="60" height="52" fill="transparent"/>
          <polygon points="30,4 45,14 45,34 30,44 15,34 15,14" fill="none" stroke="rgba(255,0,0,${opacity})" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#swiss-hex)"/>
    `
  }

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <svg width="100%" height="100%" className="w-full h-full">
        <defs>
          {patterns[variant] && (
            <g dangerouslySetInnerHTML={{ __html: patterns[variant] }} />
          )}
        </defs>
      </svg>
    </div>
  )
}

export default {
  SwissFlag,
  SwissAlps,
  SwissCrossLoader,
  FloatingParticles,
  SwissPrecisionGrid,
  LuxuryGradientOrb,
  SwissClockElement,
  DataVisualization,
  SwissShield,
  SwissPatternBackground
}