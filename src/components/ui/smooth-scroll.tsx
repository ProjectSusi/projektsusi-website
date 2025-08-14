'use client'

import React, { useEffect } from 'react'

interface SmoothScrollProps {
  children: React.ReactNode
}

const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  useEffect(() => {
    // Add smooth scrolling behavior
    const style = document.createElement('style')
    style.innerHTML = `
      html {
        scroll-behavior: smooth;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f5f9;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #dc2626, #2563eb);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #b91c1c, #1d4ed8);
      }
    `
    document.head.appendChild(style)

    // Smooth scroll for anchor links
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.href && target.href.includes('#')) {
        const id = target.href.split('#')[1]
        const element = document.getElementById(id)
        if (element) {
          e.preventDefault()
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  return <>{children}</>
}

export default SmoothScroll