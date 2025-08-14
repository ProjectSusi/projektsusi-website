'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
  color?: string
  showPercentage?: boolean
  duration?: number
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  className = '',
  children,
  color = '#3B82F6',
  showPercentage = true,
  duration = 2
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference
  const center = size / 2

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset }}
          transition={{ duration, ease: "easeOut", delay: 0.5 }}
          className="drop-shadow-sm"
        />
        
        {/* Glow effect */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset }}
          transition={{ duration, ease: "easeOut", delay: 0.5 }}
          className="opacity-30 blur-sm"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? (
          children
        ) : showPercentage ? (
          <motion.div
            className="text-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.span
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {Math.round(progress)}%
            </motion.span>
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}

export default ProgressRing