'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { SwissFlag, SwissShield, SwissAlps } from './swiss-visuals'
import { 
  Crown, 
  Sparkles, 
  Star, 
  Zap, 
  Award,
  Shield,
  CheckCircle,
  ArrowRight,
  MousePointer,
  Eye,
  Heart
} from 'lucide-react'

// World-Class Loading Experience
export const WorldClassLoader: React.FC<{
  isLoading: boolean
  progress?: number
  message?: string
  className?: string
}> = ({ isLoading, progress = 0, message, className }) => {
  const [dots, setDots] = useState('')
  const [stage, setStage] = useState(0)

  const stages = [
    'Initializing Swiss Engineering',
    'Loading Premium Components',
    'Establishing Secure Connection',
    'Optimizing Performance',
    'Finalizing Excellence'
  ]

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStage(prev => (prev + 1) % stages.length)
    }, 2000)

    return () => clearInterval(stageInterval)
  }, [])

  if (!isLoading) return null

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-red-900',
      className
    )}>
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="neural-network" />
        <SwissAlps className="absolute bottom-0 left-0 w-full h-1/2 opacity-20" />
      </div>

      <div className="relative text-center">
        {/* Swiss Flag with 3D Animation */}
        <div className="swiss-flag-3d mb-8 mx-auto">
          <SwissFlag className="w-16 h-16" />
        </div>

        {/* Premium Loading Text */}
        <h2 className="text-4xl font-bold luxury-gradient-text mb-4">
          Swiss AI Excellence
        </h2>
        
        <p className="text-white/80 text-lg mb-8">
          {stages[stage]}{dots}
        </p>

        {/* Advanced Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="4"
              fill="transparent"
            />
            
            {/* Progress Circle */}
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={377}
              strokeDashoffset={377 - (progress / 100) * 377}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF0000" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#0066CC" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-pulse" />
              <span className="text-2xl font-bold text-white">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        {message && (
          <p className="text-white/60 text-sm animate-pulse">{message}</p>
        )}

        {/* Swiss Quality Indicators */}
        <div className="flex justify-center space-x-6 mt-8">
          <div className="flex items-center space-x-2 text-white/60">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-sm">Swiss Security</span>
          </div>
          <div className="flex items-center space-x-2 text-white/60">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Lightning Fast</span>
          </div>
          <div className="flex items-center space-x-2 text-white/60">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">World Class</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Success Animation with Swiss Flair
export const SwissSuccessAnimation: React.FC<{
  isVisible: boolean
  title: string
  message: string
  onComplete?: () => void
  className?: string
}> = ({ isVisible, title, message, onComplete, className }) => {
  const [stage, setStage] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!isVisible) return

    const stages = [0, 1, 2, 3]
    let currentStage = 0

    const nextStage = () => {
      if (currentStage < stages.length - 1) {
        currentStage++
        setStage(currentStage)
        timeoutRef.current = setTimeout(nextStage, 800)
      } else {
        timeoutRef.current = setTimeout(() => {
          onComplete?.()
        }, 2000)
      }
    }

    timeoutRef.current = setTimeout(nextStage, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm',
      className
    )}>
      <div className="text-center">
        {/* Success Icon with Animation */}
        <div className={cn(
          'relative w-32 h-32 mx-auto mb-8 transition-all duration-800',
          stage >= 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        )}>
          {/* Swiss Flag Background */}
          <div className={cn(
            'absolute inset-0 rounded-full transition-all duration-800',
            stage >= 1 ? 'scale-100 rotate-0' : 'scale-150 rotate-180'
          )}>
            <SwissShield glowing className="w-full h-full" />
          </div>
          
          {/* Success Checkmark */}
          <div className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-800 delay-400',
            stage >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          )}>
            <CheckCircle className="w-16 h-16 text-green-400 drop-shadow-lg" />
          </div>
          
          {/* Sparkle Effects */}
          {stage >= 2 && (
            <>
              <Sparkles className="absolute -top-4 -left-4 w-8 h-8 text-yellow-400 animate-bounce" />
              <Sparkles className="absolute -top-4 -right-4 w-6 h-6 text-blue-400 animate-pulse" />
              <Sparkles className="absolute -bottom-4 -left-4 w-6 h-6 text-red-400 animate-pulse" />
              <Sparkles className="absolute -bottom-4 -right-4 w-8 h-8 text-green-400 animate-bounce" />
            </>
          )}
        </div>

        {/* Success Text */}
        <div className={cn(
          'transition-all duration-800 delay-800',
          stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        )}>
          <h2 className="text-4xl font-bold text-white mb-4 luxury-gradient-text">
            {title}
          </h2>
          <p className="text-xl text-white/80 max-w-md mx-auto">
            {message}
          </p>
          
          {/* Swiss Quality Seal */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            <SwissFlag className="w-6 h-6" />
            <span className="text-white/60 font-medium">Swiss Made Excellence</span>
            <Crown className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Premium Cursor Trail Effect
export const PremiumCursorTrail: React.FC = () => {
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [isActive, setIsActive] = useState(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newPoint = {
      x: e.clientX,
      y: e.clientY,
      id: Date.now()
    }

    setTrail(prev => [newPoint, ...prev.slice(0, 10)])
  }, [])

  const handleMouseEnter = () => setIsActive(true)
  const handleMouseLeave = () => setIsActive(false)

  useEffect(() => {
    if (!isActive) return

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isActive, handleMouseMove])

  useEffect(() => {
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            left: point.x - 4,
            top: point.y - 4,
            background: `linear-gradient(135deg, rgba(255, 0, 0, ${1 - index * 0.1}), rgba(0, 102, 204, ${1 - index * 0.1}))`,
            transform: `scale(${1 - index * 0.1})`,
            transition: 'all 0.2s ease-out'
          }}
        />
      ))}
    </div>
  )
}

// Swiss Quality Badge
export const SwissQualityBadge: React.FC<{
  className?: string
  animated?: boolean
}> = ({ className, animated = true }) => {
  return (
    <div className={cn(
      'inline-flex items-center space-x-3 glass-morphism rounded-full px-6 py-3',
      animated && 'hover-glow precision-movement',
      className
    )}>
      <SwissFlag className="w-6 h-6" animated={animated} />
      <div className="text-center">
        <div className="text-white font-bold text-sm">Swiss Made</div>
        <div className="text-white/70 text-xs">Enterprise Grade</div>
      </div>
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
        ))}
      </div>
    </div>
  )
}

// Performance Monitoring Overlay
export const PerformanceOverlay: React.FC = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    renderTime: 0,
    loadTime: 0
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measurePerformance = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        const memory = (performance as any).memory?.usedJSHeapSize || 0
        const renderTime = currentTime - lastTime
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memory: Math.round(memory / 1048576),
          renderTime: Math.round(renderTime),
          loadTime: Math.round(performance.now())
        }))
        
        frameCount = 0
        lastTime = currentTime
      }
      
      animationId = requestAnimationFrame(measurePerformance)
    }

    measurePerformance()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          'glass-morphism rounded-lg p-3 text-white hover-lift micro-bounce',
          metrics.fps < 30 && 'bg-red-500/20',
          metrics.fps >= 30 && metrics.fps < 55 && 'bg-yellow-500/20',
          metrics.fps >= 55 && 'bg-green-500/20'
        )}
      >
        <Eye className="w-5 h-5" />
      </button>
      
      {showDetails && (
        <div className="absolute top-16 right-0 glass-morphism rounded-lg p-4 text-white font-mono text-sm min-w-[200px]">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className={cn(
                metrics.fps < 30 && 'text-red-400',
                metrics.fps >= 30 && metrics.fps < 55 && 'text-yellow-400',
                metrics.fps >= 55 && 'text-green-400'
              )}>
                {metrics.fps}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Memory:</span>
              <span>{metrics.memory}MB</span>
            </div>
            <div className="flex justify-between">
              <span>Render:</span>
              <span>{metrics.renderTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span>Load:</span>
              <span>{(metrics.loadTime / 1000).toFixed(2)}s</span>
            </div>
            
            {/* Quality Indicator */}
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="flex items-center space-x-2">
                <SwissFlag className="w-4 h-4" />
                <span className="text-xs">
                  {metrics.fps >= 55 && metrics.memory < 100 ? 'Swiss Quality' : 
                   metrics.fps >= 30 && metrics.memory < 200 ? 'Good Performance' : 
                   'Optimization Needed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// World-Class Error Boundary
export const WorldClassErrorBoundary: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [hasError, setHasError] = useState(false)
  const [errorInfo, setErrorInfo] = useState<string>('')

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true)
      setErrorInfo(event.error?.message || 'An unexpected error occurred')
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setHasError(true)
      setErrorInfo(event.reason?.message || 'Promise rejection occurred')
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-red-900">
        <div className="text-center max-w-md mx-auto p-8">
          <SwissShield className="w-16 h-16 mx-auto mb-6" />
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Swiss Quality Assurance
          </h2>
          
          <p className="text-white/80 mb-6">
            Our Swiss engineering standards detected an issue. We're working with precision to resolve it.
          </p>
          
          <div className="glass-morphism rounded-lg p-4 mb-6 text-left">
            <p className="text-red-300 text-sm font-mono">{errorInfo}</p>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="btn-premium px-6 py-3 inline-flex items-center space-x-2"
          >
            <ArrowRight className="w-5 h-5" />
            <span>Reload with Swiss Precision</span>
          </button>
          
          <div className="mt-6 flex items-center justify-center space-x-2 text-white/60 text-sm">
            <Heart className="w-4 h-4 text-red-400" />
            <span>Engineered in Switzerland</span>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Export all polish components
export default {
  WorldClassLoader,
  SwissSuccessAnimation,
  PremiumCursorTrail,
  SwissQualityBadge,
  PerformanceOverlay,
  WorldClassErrorBoundary
}