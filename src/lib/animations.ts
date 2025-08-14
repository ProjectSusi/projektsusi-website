import { Variants } from 'framer-motion'

// Utility function to create staggered children
export const createStaggeredChildren = (delay: number = 0.1) => ({
  visible: {
    transition: {
      staggerChildren: delay
    }
  }
})

// Smooth fade animations
export const fadeIn: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0,
    y: 40,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

export const fadeInScale: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

// Stagger children animations (toned down)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0,
    y: 10,
    scale: 0.98
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Slide animations
export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// Hover animations (toned down)
export const hoverScale = {
  scale: 1.02,
  transition: {
    duration: 0.2,
    ease: "easeInOut"
  }
}

export const hoverGlow = {
  boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)",
  transition: {
    duration: 0.3,
    ease: "easeInOut"
  }
}

// Page transition
export const pageTransition: Variants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
}

// Floating animation (toned down)
export const float = {
  y: [0, -5, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

// Pulse animation (toned down)
export const pulse = {
  scale: [1, 1.02, 1],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

// Smooth scroll reveal
export const scrollReveal: Variants = {
  hidden: { 
    opacity: 0,
    y: 60,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Card hover effect (toned down)
export const cardHover = {
  scale: 1.01,
  y: -2,
  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
  transition: {
    duration: 0.2,
    ease: "easeOut"
  }
}

// Button tap effect
export const buttonTap = {
  scale: 0.95,
  transition: {
    duration: 0.1,
    ease: "easeInOut"
  }
}

// Text reveal animation
export const textReveal: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
    clipPath: "inset(100% 0% 0% 0%)"
  },
  visible: { 
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: {
      duration: 0.8,
      ease: [0.65, 0, 0.35, 1]
    }
  }
}

// Smooth parallax
export const parallax = (offset: number = 50) => ({
  y: [0, offset],
  transition: {
    duration: 0,
    ease: "linear"
  }
})

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.61, 1, 0.88, 1]
    }
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.61, 1, 0.88, 1]
    }
  },
}

// Advanced scroll animations
export const scrollSlideUp: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.61, 1, 0.88, 1]
    }
  }
}

export const scrollSlideLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.61, 1, 0.88, 1]
    }
  }
}

export const scrollSlideRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.61, 1, 0.88, 1]
    }
  }
}

// Floating animations (toned down)
export const floatingAnimation = {
  y: [-5, 5, -5],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

export const pulseGlow = {
  scale: [1, 1.01, 1],
  filter: [
    "drop-shadow(0 0 0px rgba(59, 130, 246, 0.3))",
    "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))",
    "drop-shadow(0 0 0px rgba(59, 130, 246, 0.3))"
  ],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

// Navigation animations (toned down)
export const navItemHover = {
  scale: 1.02,
  y: -1,
  transition: {
    duration: 0.2,
    ease: "easeOut"
  }
}

export const mobileMenuSlide: Variants = {
  hidden: {
    opacity: 0,
    x: '100%'
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.61, 1, 0.88, 1]
    }
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: 0.3,
      ease: [0.61, 1, 0.88, 1]
    }
  }
}

// Loading animations
export const loadingDots = {
  animate: {
    opacity: [1, 0.3, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const shimmerEffect = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// Counter animation
export const counterAnimation: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.61, 1, 0.88, 1]
    }
  }
}