'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

// Enhanced Button with Ripple Effect
export const RippleButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'premium' | 'glass' | 'outline'
}> = ({ children, className, onClick, disabled, variant = 'premium' }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  const createRipple = (event: React.MouseEvent) => {
    if (!buttonRef.current || disabled) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const id = Date.now()

    setRipples(prev => [...prev, { x, y, id }])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id))
    }, 600)

    onClick?.()
  }

  const baseClasses = {
    premium: 'btn-premium relative overflow-hidden',
    glass: 'glass-morphism border-2 border-white/30 text-white hover:bg-white/10 relative overflow-hidden',
    outline: 'border-2 border-current bg-transparent hover:bg-current hover:text-white relative overflow-hidden'
  }

  return (
    <button
      ref={buttonRef}
      className={cn(
        baseClasses[variant],
        'transition-all duration-300 hover-lift micro-bounce disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      onClick={createRipple}
      disabled={disabled}
    >
      {children}
      
      {/* Ripple Effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
            animationDuration: '600ms'
          }}
        />
      ))}
    </button>
  )
}

// Magnetic Button Effect
export const MagneticButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  strength?: number
}> = ({ children, className, onClick, strength = 0.3 }) => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!buttonRef.current || !isHovered) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    buttonRef.current.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0) scale(1.05)`
  }, [isHovered, strength])

  const handleMouseLeave = () => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'translate3d(0px, 0px, 0) scale(1)'
    }
    setIsHovered(false)
  }

  useEffect(() => {
    if (isHovered) {
      document.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isHovered, handleMouseMove])

  return (
    <div
      ref={buttonRef}
      className={cn(
        'inline-block transition-all duration-300 ease-out cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Swiss Cross Loader with Physics
export const SwissCrossLoader: React.FC<{
  size?: number
  className?: string
  loading?: boolean
}> = ({ size = 40, className, loading = true }) => {
  const [rotation, setRotation] = useState(0)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!loading) return

    const animate = () => {
      setRotation(prev => (prev + 3) % 360)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [loading])

  if (!loading) return null

  return (
    <div 
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: 'conic-gradient(from 0deg, #FF0000, #ffffff, #FF0000)',
          borderRadius: '50%',
          padding: '2px',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
          <div className="relative">
            {/* Swiss Cross */}
            <div 
              className="absolute bg-primary-600"
              style={{
                width: size * 0.6,
                height: size * 0.15,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
            <div 
              className="absolute bg-primary-600"
              style={{
                width: size * 0.15,
                height: size * 0.6,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Morphing Card Container
export const MorphingCard: React.FC<{
  children: React.ReactNode
  className?: string
  variant?: 'luxury' | 'glass' | 'outline'
  morphIntensity?: number
}> = ({ children, className, variant = 'luxury', morphIntensity = 20 }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / centerY * morphIntensity
    const rotateY = (centerX - x) / centerX * morphIntensity

    cardRef.current.style.transform = `
      perspective(1000px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg)
      scale3d(1.05, 1.05, 1.05)
    `
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    }
    setIsHovered(false)
  }

  const baseClasses = {
    luxury: 'luxury-card',
    glass: 'glass-morphism',
    outline: 'border-2 border-white/20 bg-transparent backdrop-blur-sm'
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        baseClasses[variant],
        'transition-all duration-300 ease-out transform-gpu',
        isHovered && 'hover-glow',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

// Floating Action Button with Trail
export const FloatingActionButton: React.FC<{
  icon: React.ReactNode
  onClick?: () => void
  className?: string
  trailCount?: number
}> = ({ icon, onClick, className, trailCount = 3 }) => {
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const id = Date.now()

    setTrail(prev => [
      { x, y, id },
      ...prev.slice(0, trailCount - 1)
    ])
  }

  return (
    <button
      ref={buttonRef}
      className={cn(
        'relative w-14 h-14 rounded-full btn-premium shadow-2xl hover-lift micro-bounce overflow-visible',
        className
      )}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Trail Effects */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${point.x}px, ${point.y}px) scale(${1 - index * 0.2})`,
            opacity: 1 - index * 0.3,
            transition: 'all 200ms ease-out',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF0000, #0066CC)',
            marginLeft: '-4px',
            marginTop: '-4px'
          }}
        />
      ))}
      
      {/* Main Icon */}
      <div className="relative z-10">
        {icon}
      </div>
    </button>
  )
}

// Animated Counter with Odometer Effect
export const AnimatedCounter: React.FC<{
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
}> = ({ value, duration = 2000, className, prefix = '', suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp

      const progress = (timestamp - startTime) / duration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      if (progress < 1) {
        setDisplayValue(value * easeOutQuart)
        animationFrame = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, value, duration])

  return (
    <span
      ref={counterRef}
      className={cn('tabular-nums', className)}
    >
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  )
}

// Progress Ring with Animation
export const ProgressRing: React.FC<{
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  className?: string
  children?: React.ReactNode
}> = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  color = '#FF0000',
  backgroundColor = 'rgba(255, 255, 255, 0.2)',
  className,
  children 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 100)

    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (animatedProgress / 100) * circumference}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.3))'
          }}
        />
      </svg>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <span className="text-white font-bold text-lg">
            {Math.round(animatedProgress)}%
          </span>
        )}
      </div>
    </div>
  )
}

// Parallax Container
export const ParallaxContainer: React.FC<{
  children: React.ReactNode
  speed?: number
  className?: string
}> = ({ children, speed = 0.5, className }) => {
  const [offset, setOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const scrolled = window.pageYOffset
      const rate = scrolled * speed

      setOffset(rate)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  )
}

// Staggered Fade In Animation
export const StaggeredFadeIn: React.FC<{
  children: React.ReactNode[]
  delay?: number
  className?: string
}> = ({ children, delay = 100, className }) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems(prev => new Set(prev).add(index))
            }, index * delay)
          })
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [children, delay])

  return (
    <div ref={containerRef} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-700',
            visibleItems.has(index) 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          )}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

// Glitch Text Effect
export const GlitchText: React.FC<{
  children: string
  className?: string
  intensity?: number
}> = ({ children, className, intensity = 2 }) => {
  const [isGlitching, setIsGlitching] = useState(false)

  const triggerGlitch = () => {
    setIsGlitching(true)
    setTimeout(() => setIsGlitching(false), 200)
  }

  return (
    <span
      className={cn(
        'relative inline-block cursor-pointer',
        isGlitching && 'animate-pulse',
        className
      )}
      onClick={triggerGlitch}
      onMouseEnter={triggerGlitch}
    >
      <span className="relative z-10">{children}</span>
      
      {isGlitching && (
        <>
          <span
            className="absolute top-0 left-0 text-primary-500 opacity-80"
            style={{
              transform: `translate(${Math.random() * intensity - intensity/2}px, ${Math.random() * intensity - intensity/2}px)`,
              clipPath: 'inset(0 0 50% 0)'
            }}
          >
            {children}
          </span>
          <span
            className="absolute top-0 left-0 text-blue-500 opacity-80"
            style={{
              transform: `translate(${Math.random() * intensity - intensity/2}px, ${Math.random() * intensity - intensity/2}px)`,
              clipPath: 'inset(50% 0 0 0)'
            }}
          >
            {children}
          </span>
        </>
      )}
    </span>
  )
}

export default {
  RippleButton,
  MagneticButton,
  SwissCrossLoader,
  MorphingCard,
  FloatingActionButton,
  AnimatedCounter,
  ProgressRing,
  ParallaxContainer,
  StaggeredFadeIn,
  GlitchText
}