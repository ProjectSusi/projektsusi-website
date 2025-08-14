import type { NextApiRequest, NextApiResponse } from 'next'

interface NewsletterSignupData {
  email: string
  locale: string
}

interface NewsletterResponse {
  success: boolean
  message: string
  error?: string
}

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Sanitize input to prevent XSS
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .toLowerCase()
    .substring(0, 255) // Limit length
}

// Simple rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 5 // Max 5 signups per 15 minutes per IP

  const current = rateLimitStore.get(ip)
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewsletterResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const { email, locale }: NewsletterSignupData = req.body

    // Input validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Missing email address',
        error: 'Email is required'
      })
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedLocale = locale ? sanitizeInput(locale) : 'en'

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'Please provide a valid email address'
      })
    }

    // Rate limiting
    const clientIP = (req.headers['x-forwarded-for'] as string) || 
                     (req.connection.remoteAddress as string) || 
                     'unknown'
    
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests',
        error: 'Too many signup attempts. Please try again later.'
      })
    }

    // Check for common disposable email domains
    const disposableEmailDomains = [
      '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 
      'tempmail.org', 'throwaway.email', 'temp-mail.org'
    ]
    
    const emailDomain = sanitizedEmail.split('@')[1]
    if (disposableEmailDomains.includes(emailDomain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email domain',
        error: 'Please use a permanent email address'
      })
    }

    // Here you would typically:
    // 1. Check if email already exists in your database/newsletter service
    // 2. Add to newsletter service (Mailchimp, ConvertKit, etc.)
    // 3. Send welcome email
    // 4. Store subscription in database with timestamp
    
    // Log the newsletter signup
    console.log('Newsletter signup:', {
      timestamp: new Date().toISOString(),
      email: sanitizedEmail,
      locale: sanitizedLocale,
      clientIP,
      userAgent: req.headers['user-agent']
    })

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // In a real implementation, you would:
    /*
    // Add to newsletter service (example with Mailchimp)
    const mailchimp = require('@mailchimp/mailchimp_marketing')
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX
    })
    
    await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
      email_address: sanitizedEmail,
      status: 'subscribed',
      merge_fields: {
        LOCALE: sanitizedLocale,
        SIGNUP_SOURCE: 'website'
      },
      tags: ['website-signup', `locale-${sanitizedLocale}`]
    })
    
    // Send welcome email
    await sendWelcomeEmail({
      email: sanitizedEmail,
      locale: sanitizedLocale
    })
    
    // Store in database
    await saveNewsletterSubscription({
      email: sanitizedEmail,
      locale: sanitizedLocale,
      source: 'website',
      ipAddress: clientIP,
      userAgent: req.headers['user-agent']
    })
    */

    return res.status(200).json({
      success: true,
      message: sanitizedLocale === 'de' 
        ? 'Erfolgreich angemeldet! Willkommen bei Projekt Susi.'
        : 'Successfully subscribed! Welcome to Projekt Susi.'
    })

  } catch (error) {
    console.error('Newsletter signup error:', error)
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected error occurred. Please try again later.'
    })
  }
}

// Helper function for sending welcome emails (placeholder)
/*
async function sendWelcomeEmail(data: {
  email: string
  locale: string
}) {
  const isGerman = data.locale === 'de'
  
  // Send welcome email with newsletter template
  await sendEmail({
    to: data.email,
    subject: isGerman ? 'Willkommen bei Projekt Susi!' : 'Welcome to Projekt Susi!',
    template: 'newsletter-welcome',
    variables: {
      locale: data.locale,
      unsubscribeUrl: `https://ai.sirth.ch/unsubscribe?email=${encodeURIComponent(data.email)}`
    }
  })
}

async function saveNewsletterSubscription(data: {
  email: string
  locale: string
  source: string
  ipAddress: string
  userAgent?: string
}) {
  // Save to your database
  // Example with Prisma:
  // await prisma.newsletterSubscription.create({
  //   data: {
  //     email: data.email,
  //     locale: data.locale,
  //     source: data.source,
  //     ipAddress: data.ipAddress,
  //     userAgent: data.userAgent,
  //     subscribedAt: new Date(),
  //     isActive: true
  //   }
  // })
}
*/