'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// Mobile-Optimized Swiss Hero
export const MobileSwissHero: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  const [deviceOrientation, setDeviceOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [touchSupport, setTouchSupport] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setDeviceOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    const checkTouchSupport = () => {
      setTouchSupport('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkOrientation()
    checkTouchSupport()

    window.addEventListener('orientationchange', checkOrientation)
    window.addEventListener('resize', checkOrientation)

    return () => {
      window.removeEventListener('orientationchange', checkOrientation)
      window.removeEventListener('resize', checkOrientation)
    }
  }, [])

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden',
        deviceOrientation === 'portrait' ? 'mobile-portrait' : 'mobile-landscape',
        touchSupport && 'touch-optimized',
        className
      )}
    >
      {/* Mobile-optimized background */}
      <div className="absolute inset-0 mobile-bg-pattern" />
      
      {/* Reduced particle count for mobile */}
      <div className="absolute inset-0 mobile-particles" />
      
      {children}
    </div>
  )
}

// Touch-Optimized Button
export const TouchOptimizedButton: React.FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}> = ({ children, className, onClick, variant = 'primary', size = 'md' }) => {
  const [isPressed, setIsPressed] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
    xl: 'px-12 py-6 text-xl min-h-[56px]'
  }

  const variantClasses = {
    primary: 'btn-premium',
    secondary: 'glass-morphism border-2 border-white/30 text-white',
    outline: 'border-2 border-current bg-transparent'
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setIsPressed(true)

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPressed(false)
    
    if (touchStart) {
      const touch = e.changedTouches[0]
      const deltaX = Math.abs(touch.clientX - touchStart.x)
      const deltaY = Math.abs(touch.clientY - touchStart.y)
      
      // Only trigger onClick if touch didn't move too much (not a swipe)
      if (deltaX < 10 && deltaY < 10) {
        onClick?.()
      }
    }
    
    setTouchStart(null)
  }

  return (
    <button
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        'relative transition-all duration-200 rounded-xl font-semibold',
        'active:scale-95 touch-manipulation',
        isPressed && 'pressed-state',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        setIsPressed(false)
        setTouchStart(null)
      }}
      onClick={onClick}
    >
      {children}
      
      {/* Touch feedback overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-white/10 rounded-xl transition-opacity duration-200',
          isPressed ? 'opacity-100' : 'opacity-0'
        )}
      />
    </button>
  )
}

// Mobile-Optimized Card Stack
export const MobileCardStack: React.FC<{
  children: React.ReactNode[]
  className?: string
  snapToCenter?: boolean
}> = ({ children, className, snapToCenter = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const stackRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX - startX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const threshold = 50
    
    if (currentX > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (currentX < -threshold && currentIndex < children.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    
    setCurrentX(0)
    setIsDragging(false)
  }

  return (
    <div className={cn('relative overflow-hidden touch-pan-y', className)}>
      <div
        ref={stackRef}
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${isDragging ? currentX : 0}px))`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className={cn(
              'w-full flex-shrink-0 px-4',
              index === currentIndex && 'mobile-card-active'
            )}
          >
            {child}
          </div>
        ))}
      </div>
      
      {/* Pagination Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {children.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-200',
              index === currentIndex
                ? 'bg-red-500 scale-125'
                : 'bg-white/30 hover:bg-white/50'
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}

// Mobile Navigation Drawer
export const MobileNavDrawer: React.FC<{
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}> = ({ isOpen, onClose, children }) => {
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const deltaY = e.touches[0].clientY - startY
    if (deltaY > 0) {
      setCurrentY(deltaY)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    if (currentY > 100) {
      onClose()
    }
    
    setCurrentY(0)
    setIsDragging(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 max-h-[80vh] overflow-y-auto',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{
          transform: `translateY(${isOpen ? currentY : '100%'}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-6" />
        
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </>
  )
}

// Pull-to-Refresh Component
export const PullToRefresh: React.FC<{
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}> = ({ onRefresh, children, className }) => {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || window.scrollY > 0) return
    
    const currentY = e.touches[0].clientY
    const distance = Math.max(0, (currentY - startY) * 0.5)
    setPullDistance(Math.min(distance, 100))
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setPullDistance(0)
    setStartY(0)
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold rounded-b-xl transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? 1 : 0,
          transform: `translateY(-${Math.max(0, 100 - pullDistance)}px)`
        }}
      >
        {isRefreshing ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Refreshing...</span>
          </div>
        ) : pullDistance > 60 ? (
          <span>Release to refresh</span>
        ) : (
          <span>Pull to refresh</span>
        )}
      </div>
      
      <div
        style={{
          transform: `translateY(${Math.min(pullDistance, 100)}px)`,
          transition: pullDistance > 0 ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Mobile-Optimized Pricing Calculator
export const MobilePricingCalculator: React.FC<{
  onCalculate: (values: any) => void
  className?: string
}> = ({ onCalculate, className }) => {
  const [values, setValues] = useState({
    users: 10,
    documents: 1000,
    queries: 500
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSliderChange = (key: string, value: number) => {
    const newValues = { ...values, [key]: value }
    setValues(newValues)
    onCalculate(newValues)
  }

  return (
    <div className={cn('glass-morphism rounded-2xl p-6 touch-manipulation', className)}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-bold text-white">ROI Calculator</h3>
        <div className={cn('transition-transform duration-300', isExpanded && 'rotate-180')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" className="text-white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isExpanded ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
      )}>
        <div className="space-y-6">
          {Object.entries(values).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-white font-medium capitalize">{key}</label>
                <span className="text-white font-bold">{value}</span>
              </div>
              <input
                type="range"
                min={key === 'users' ? 1 : key === 'documents' ? 100 : 50}
                max={key === 'users' ? 500 : key === 'documents' ? 50000 : 10000}
                step={key === 'users' ? 1 : key === 'documents' ? 100 : 50}
                value={value}
                onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer mobile-slider"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mobile Performance Monitor
export const MobilePerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    connection: 'unknown'
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }))
        frameCount = 0
        lastTime = currentTime
      }
      
      animationId = requestAnimationFrame(measureFPS)
    }

    measureFPS()

    // Memory usage (if available)
    if ('memory' in performance) {
      const memInfo = (performance as any).memory
      setMetrics(prev => ({
        ...prev,
        memory: Math.round(memInfo.usedJSHeapSize / 1048576)
      }))
    }

    // Network connection info
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      setMetrics(prev => ({
        ...prev,
        connection: conn.effectiveType || conn.type || 'unknown'
      }))
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded z-50 font-mono">
      <div>FPS: {metrics.fps}</div>
      <div>Memory: {metrics.memory}MB</div>
      <div>Network: {metrics.connection}</div>
    </div>
  )
}

export default {
  MobileSwissHero,
  TouchOptimizedButton,
  MobileCardStack,
  MobileNavDrawer,
  PullToRefresh,
  MobilePricingCalculator,
  MobilePerformanceMonitor
}