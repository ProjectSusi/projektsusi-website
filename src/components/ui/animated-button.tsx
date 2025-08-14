'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { buttonTap } from '@/lib/animations'

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'swiss'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  className?: string
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    children, 
    className,
    loading = false,
    icon,
    iconPosition = 'left',
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl',
      secondary: 'bg-gradient-to-r from-secondary to-secondary/90 text-white hover:from-secondary/90 hover:to-secondary/80 shadow-lg hover:shadow-xl',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
      ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
      gradient: 'bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl',
      swiss: 'bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={buttonTap}
        className={cn(
          'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={loading}
        {...props}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        
        {/* Loading spinner */}
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          </motion.div>
        )}

        {/* Button content */}
        <span className={cn(
          'relative z-10 inline-flex items-center gap-2',
          loading && 'opacity-0'
        )}>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </span>

        {/* Ripple effect on click */}
        <motion.span
          className="absolute inset-0 rounded-lg"
          initial={{ scale: 0, opacity: 0.5 }}
          whileTap={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)' }}
        />
      </motion.button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

export default AnimatedButton