'use client'

import React, { createContext, useContext, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

interface AnimationContextType {
  isTransitioning: boolean
  setIsTransitioning: (value: boolean) => void
  pageKey: string
  setPageKey: (key: string) => void
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

export const useAnimation = () => {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider')
  }
  return context
}

interface AnimationProviderProps {
  children: React.ReactNode
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [pageKey, setPageKey] = useState('')

  const value = {
    isTransitioning,
    setIsTransitioning,
    pageKey,
    setPageKey
  }

  return (
    <AnimationContext.Provider value={value}>
      <AnimatePresence mode="wait" onExitComplete={() => setIsTransitioning(false)}>
        {children}
      </AnimatePresence>
    </AnimationContext.Provider>
  )
}

export default AnimationProvider