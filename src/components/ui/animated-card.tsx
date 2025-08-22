'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cardHover } from '@/lib/animations'

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  glass?: boolean
  border?: boolean
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, hover = true, gradient = false, glass = false, border = true, ...props }, ref) => {
    const baseStyles = cn(
      'relative rounded-xl overflow-hidden transition-all duration-300',
      border && 'border border-gray-200',
      glass && 'backdrop-blur-lg bg-white/80',
      !glass && 'bg-white',
      'shadow-sm',
      className
    )

    return (
      <motion.div
        ref={ref}
        className={baseStyles}
        whileHover={hover ? cardHover : undefined}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        {...props}
      >
        {/* Gradient border effect */}
        {gradient && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary via-primary-400 to-primary opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ padding: '1px' }}
          >
            <div className="h-full w-full bg-white rounded-xl" />
          </motion.div>
        )}

        {/* Animated gradient background */}
        {gradient && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary-50 to-gray-50 opacity-0 hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Card content */}
        <div className="relative z-10 h-full">
          {children}
        </div>

        {/* Hover glow effect */}
        {hover && (
          <motion.div
            className="absolute inset-0 opacity-0 hover:opacity-100 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>
    )
  }
)

AnimatedCard.displayName = 'AnimatedCard'

export default AnimatedCard