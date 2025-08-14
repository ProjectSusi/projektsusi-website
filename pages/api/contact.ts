import type { NextApiRequest, NextApiResponse } from 'next'

interface ContactFormData {
  name: string
  company: string
  email: string
  phone?: string
  industry: string
  message: string
  interest: string
}

interface ContactResponse {
  success: boolean
  message: string
  error?: string
}

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Simple phone validation (optional field)
const isValidPhone = (phone: string): boolean => {
  if (!phone) return true // Optional field
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.length >= 8
}

// Sanitize input to prevent XSS
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000) // Limit length
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const { 
      name, 
      company, 
      email, 
      phone, 
      industry, 
      message, 
      interest 
    }: ContactFormData = req.body

    // Input validation
    if (!name || !email || !company || !industry || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'Name, email, company, industry, and message are required'
      })
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      company: sanitizeInput(company),
      email: sanitizeInput(email),
      phone: phone ? sanitizeInput(phone) : '',
      industry: sanitizeInput(industry),
      message: sanitizeInput(message),
      interest: sanitizeInput(interest)
    }

    // Validate email format
    if (!isValidEmail(sanitizedData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        error: 'Please provide a valid email address'
      })
    }

    // Validate phone if provided
    if (sanitizedData.phone && !isValidPhone(sanitizedData.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone format',
        error: 'Please provide a valid phone number'
      })
    }

    // Rate limiting - simple in-memory store (in production, use Redis or database)
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    
    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Add to CRM system
    // 4. Send confirmation email to user
    
    // For now, we'll just log the form submission
    console.log('Contact form submission:', {
      timestamp: new Date().toISOString(),
      clientIP,
      data: sanitizedData
    })

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In a real implementation, you would:
    // - Send an email using a service like SendGrid, AWS SES, or Nodemailer
    // - Save to a database (PostgreSQL, MongoDB, etc.)
    // - Add to a CRM system
    // - Send a confirmation email
    
    // Example of what you might do:
    /*
    // Send email notification
    await sendEmailNotification({
      to: 'hello@projektsusi.ch',
      subject: `New contact form submission from ${sanitizedData.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitizedData.name}</p>
        <p><strong>Company:</strong> ${sanitizedData.company}</p>
        <p><strong>Email:</strong> ${sanitizedData.email}</p>
        <p><strong>Phone:</strong> ${sanitizedData.phone}</p>
        <p><strong>Industry:</strong> ${sanitizedData.industry}</p>
        <p><strong>Interest:</strong> ${sanitizedData.interest}</p>
        <p><strong>Message:</strong></p>
        <p>${sanitizedData.message.replace(/\n/g, '<br>')}</p>
      `
    })

    // Send confirmation email to user
    await sendConfirmationEmail({
      to: sanitizedData.email,
      name: sanitizedData.name
    })

    // Save to database
    await saveContactSubmission(sanitizedData)
    */

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully! We will get back to you within 24 hours.'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'An unexpected error occurred. Please try again later.'
    })
  }
}

// Helper function for sending emails (placeholder)
/*
async function sendEmailNotification(emailData: {
  to: string
  subject: string
  html: string
}) {
  // Implement with your preferred email service
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // await sgMail.send({
  //   to: emailData.to,
  //   from: 'noreply@projektsusi.ch',
  //   subject: emailData.subject,
  //   html: emailData.html
  // })
}

async function sendConfirmationEmail(data: {
  to: string
  name: string
}) {
  // Send confirmation email to the user
}

async function saveContactSubmission(data: ContactFormData) {
  // Save to your database
  // Example with Prisma or direct SQL
}
*/