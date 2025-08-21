'use client'

import { useEffect, useRef } from 'react'
import { useAnimation, useInView } from 'framer-motion'

interface ScrollAnimationOptions {
  threshold?: number
  triggerOnce?: boolean
  delay?: number
  duration?: number
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    triggerOnce = true,
    delay = 0,
    duration = 0.6
  } = options

  const ref = useRef(null)
  const isInView = useInView(ref, { 
    amount: threshold, 
    once: triggerOnce 
  })
  const animation = useAnimation()

  useEffect(() => {
    if (isInView) {
      animation.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: [0.61, 1, 0.88, 1]
        }
      })
    } else if (!triggerOnce) {
      animation.start({
        opacity: 0,
        y: 20,
        scale: 0.95
      })
    }
  }, [isInView, animation, delay, duration, triggerOnce])

  return {
    ref,
    animation,
    isInView
  }
}

export const useStaggeredScrollAnimation = (
  itemCount: number,
  options: ScrollAnimationOptions = {}
) => {
  const {
    threshold = 0.1,
    triggerOnce = true,
    delay = 0,
    duration = 0.6
  } = options

  const ref = useRef(null)
  const isInView = useInView(ref, { 
    amount: threshold, 
    once: triggerOnce 
  })
  const animations = Array.from({ length: itemCount }, (_, index) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAnimation()
  })

  useEffect(() => {
    if (isInView) {
      animations.forEach((animation, index) => {
        animation.start({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration,
            delay: delay + index * 0.1,
            ease: [0.61, 1, 0.88, 1]
          }
        })
      })
    } else if (!triggerOnce) {
      animations.forEach((animation) => {
        animation.start({
          opacity: 0,
          y: 20,
          scale: 0.95
        })
      })
    }
  }, [isInView, animations, delay, duration, triggerOnce])

  return {
    ref,
    animations,
    isInView
  }
}

export default useScrollAnimation