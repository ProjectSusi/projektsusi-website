import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number, currency: string = 'CHF'): string => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('de-CH').format(number)
}

export const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

export const generateDemoSessionId = (): string => {
  return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const calculateROI = (employees: number, documentsPerMonth: number): {
  annualSavings: number;
  timesSaved: number;
  costReduction: number;
} => {
  // Assumptions based on Swiss market research
  const avgHourlyRate = 65 // CHF per hour for knowledge workers
  const hoursPerDocumentAnalysis = 0.5 // 30 minutes manual vs 2 minutes with AI
  const timeSavedPerDocument = 0.47 // 28 minutes saved per document
  
  const monthlyTimeSaved = documentsPerMonth * timeSavedPerDocument
  const annualTimeSaved = monthlyTimeSaved * 12
  const annualSavings = annualTimeSaved * avgHourlyRate
  
  return {
    annualSavings: Math.round(annualSavings),
    timesSaved: Math.round(annualTimeSaved),
    costReduction: Math.round(annualSavings * 0.4) // 40% cost reduction typical
  }
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidSwissCompany = (domain: string): boolean => {
  const swissDomains = ['.ch', '.swiss', '.geneva', '.zurich']
  return swissDomains.some(suffix => domain.toLowerCase().endsWith(suffix))
}

export const getIndustryIcon = (industry: string): string => {
  const icons: Record<string, string> = {
    banking: '🏦',
    finance: '💰',
    pharma: '💊',
    manufacturing: '🏭',
    government: '🏛️',
    healthcare: '🏥',
    insurance: '🛡️',
    legal: '⚖️',
    consulting: '📊',
  }
  return icons[industry.toLowerCase()] || '🏢'
}

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Analytics tracking (Plausible or similar)
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(eventName, { props: properties })
  }
}

export const generateMetaTags = (page: {
  title: string;
  description: string;
  path: string;
  locale: string;
}): Record<string, string> => {
  const baseUrl = 'https://projektsusui.ch'
  const fullUrl = `${baseUrl}${page.path}`
  
  return {
    title: page.title,
    description: page.description,
    'og:title': page.title,
    'og:description': page.description,
    'og:url': fullUrl,
    'og:type': 'website',
    'og:locale': page.locale,
    'twitter:card': 'summary_large_image',
    'twitter:title': page.title,
    'twitter:description': page.description,
    canonical: fullUrl,
  }
}