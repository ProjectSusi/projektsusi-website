'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

interface ScrollToTopProps {
  showAfter?: number
  className?: string
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ 
  showAfter = 500, 
  className = '' 
}) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > showAfter)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showAfter])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg hover:shadow-xl transition-shadow ${className}`}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default ScrollToTop