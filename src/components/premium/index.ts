// Premium Components - World-Class Swiss AI Website Components
// Export all premium components for easy importing

// Hero Components
export { default as PremiumHero } from './premium-hero'

// Demo Components  
export { default as PremiumDemoWidget } from './premium-demo-widget'

// Pricing Components
export { default as PremiumPricing } from './premium-pricing'

// Swiss Visual Elements
export {
  SwissFlag,
  SwissAlps,
  SwissCrossLoader,
  FloatingParticles,
  SwissPrecisionGrid,
  LuxuryGradientOrb,
  SwissClockElement,
  DataVisualization,
  SwissShield,
  SwissPatternBackground
} from './swiss-visuals'

// Micro-Interactions
export {
  RippleButton,
  MagneticButton,
  SwissCrossLoader as MicroSwissCrossLoader,
  MorphingCard,
  FloatingActionButton,
  AnimatedCounter,
  ProgressRing,
  ParallaxContainer,
  StaggeredFadeIn,
  GlitchText
} from './micro-interactions'

// Mobile Experience
export {
  MobileSwissHero,
  TouchOptimizedButton,
  MobileCardStack,
  MobileNavDrawer,
  PullToRefresh,
  MobilePricingCalculator,
  MobilePerformanceMonitor
} from './mobile-experience'

// World-Class Polish
export {
  WorldClassLoader,
  SwissSuccessAnimation,
  PremiumCursorTrail,
  SwissQualityBadge,
  PerformanceOverlay,
  WorldClassErrorBoundary
} from './world-class-polish'

// Utility exports for ROI calculations
export { calculateBusinessROI } from './premium-pricing'

// Component collections for different use cases
export const HeroComponents = {
  PremiumHero: () => import('./premium-hero'),
  SwissFlag: () => import('./swiss-visuals'),
  SwissAlps: () => import('./swiss-visuals')
}

export const InteractiveComponents = {
  PremiumDemoWidget: () => import('./premium-demo-widget'),
  PremiumPricing: () => import('./premium-pricing'),
  MicroInteractions: () => import('./micro-interactions')
}

export const MobileComponents = {
  MobileExperience: () => import('./mobile-experience'),
  TouchOptimized: () => import('./mobile-experience')
}

export const PolishComponents = {
  WorldClassPolish: () => import('./world-class-polish'),
  Performance: () => import('./world-class-polish')
}