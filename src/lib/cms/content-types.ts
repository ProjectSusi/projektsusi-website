// Content Management System Types
export interface CMSContent {
  id: string
  slug: string
  type: ContentType
  locale: 'de' | 'en'
  title: string
  description?: string
  content: Record<string, any>
  metadata?: CMSMetadata
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  publishedAt?: string
  author?: string
  version: number
}

export interface CMSMetadata {
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  canonicalUrl?: string
  noIndex?: boolean
  schemaMarkup?: Record<string, any>
}

export type ContentType = 
  | 'page'
  | 'hero'
  | 'feature'
  | 'pricing'
  | 'testimonial'
  | 'faq'
  | 'solution'
  | 'blog'
  | 'case-study'
  | 'announcement'
  | 'navigation'
  | 'footer'
  | 'global'

export interface HeroContent {
  headline: string
  subheadline?: string
  description: string
  primaryCTA: {
    text: string
    href: string
    variant?: string
  }
  secondaryCTA?: {
    text: string
    href: string
    variant?: string
  }
  backgroundImage?: string
  badges?: string[]
  stats?: Array<{
    value: string
    label: string
    prefix?: string
    suffix?: string
  }>
}

export interface FeatureContent {
  title: string
  description: string
  icon?: string
  image?: string
  benefits?: string[]
  link?: {
    text: string
    href: string
  }
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: {
    amount: number
    currency: string
    period?: 'month' | 'year' | 'once'
    displayPrice?: string
  }
  features: string[]
  highlighted?: boolean
  badge?: string
  cta: {
    text: string
    href: string
  }
}

export interface TestimonialContent {
  quote: string
  author: string
  role: string
  company: string
  image?: string
  rating?: number
  logo?: string
}

export interface FAQContent {
  question: string
  answer: string
  category?: string
  order?: number
}

export interface SolutionContent {
  industry: string
  title: string
  description: string
  image?: string
  benefits: string[]
  features: string[]
  caseStudies?: string[]
  cta: {
    text: string
    href: string
  }
}

export interface BlogPost {
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  author: {
    name: string
    image?: string
    bio?: string
  }
  category: string
  tags: string[]
  publishedAt: string
  readTime?: number
  relatedPosts?: string[]
}

export interface NavigationItem {
  label: string
  href: string
  description?: string
  icon?: string
  children?: NavigationItem[]
  highlight?: boolean
  external?: boolean
}

export interface GlobalSettings {
  siteName: string
  siteDescription: string
  logo: string
  favicon: string
  socialMedia: {
    twitter?: string
    linkedin?: string
    github?: string
    facebook?: string
  }
  contact: {
    email: string
    phone?: string
    address?: string
  }
  analytics: {
    gtmId?: string
    plausibleDomain?: string
    sentryDsn?: string
  }
  features: {
    maintenance?: boolean
    newsletter?: boolean
    cookieBanner?: boolean
    liveChat?: boolean
  }
}

// Content validation schemas
export const contentSchemas = {
  hero: {
    required: ['headline', 'description', 'primaryCTA'],
    maxLength: {
      headline: 100,
      subheadline: 150,
      description: 500
    }
  },
  feature: {
    required: ['title', 'description'],
    maxLength: {
      title: 100,
      description: 300
    }
  },
  pricing: {
    required: ['name', 'price', 'features', 'cta'],
    maxLength: {
      name: 50,
      description: 200
    }
  },
  testimonial: {
    required: ['quote', 'author', 'company'],
    maxLength: {
      quote: 500,
      author: 100,
      role: 100,
      company: 100
    }
  },
  faq: {
    required: ['question', 'answer'],
    maxLength: {
      question: 200,
      answer: 1000
    }
  },
  blog: {
    required: ['title', 'slug', 'excerpt', 'content', 'author', 'category'],
    maxLength: {
      title: 200,
      excerpt: 500
    }
  }
}

// Helper type for content updates
export interface ContentUpdate<T = any> {
  id: string
  updates: Partial<T>
  locale?: 'de' | 'en'
  publish?: boolean
}

// Helper type for content queries
export interface ContentQuery {
  type?: ContentType
  locale?: 'de' | 'en'
  status?: 'draft' | 'published' | 'archived'
  slug?: string
  limit?: number
  offset?: number
  orderBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title'
  order?: 'asc' | 'desc'
  search?: string
}