'use client'

import React, { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

interface ScrollProgressProps {
  className?: string
  color?: string
}

const ScrollProgress: React.FC<ScrollProgressProps> = ({ 
  className = '', 
  color = '#DC2626' 
}) => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary transform-origin-left z-50 ${className}`}
      style={{ scaleX }}
    />
  )
}

export default ScrollProgress