'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.61, 1, 0.88, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.61, 1, 0.88, 1]
    }
  }
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const router = useRouter()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.asPath}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className={`min-h-screen ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition