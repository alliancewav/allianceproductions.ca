import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Simple in-memory rate limiting (resets on server restart)
// For production, consider using Redis or a database
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5 // Max 5 booking requests per hour per IP

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    // New window or expired - reset
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW }
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now }
  }
  
  record.count++
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now }
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  const entries = Array.from(rateLimitMap.entries())
  entries.forEach(([key, record]) => {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  })
}, 10 * 60 * 1000) // Clean up every 10 minutes

interface BookingData {
  contact: {
    name: string
    email: string
    phone: string
    instagram: string
    preferredDate: string
    preferredTime: string
    projectDescription: string
    additionalNotes: string
  }
  sessionMode: 'recording' | 'rental'
  session: {
    hours: number
    includeEngineer: boolean
    includeProducer: boolean
    producerHours?: number
    isAfterHours: boolean
    afterHoursCount?: number
    total: number
  }
  postProduction: {
    mixing: { qty: number; price: number; revisionsIncluded: number; includesVocalTuning: boolean; includesVocalEditing: boolean }
    mastering: { qty: number; price: number }
    mixMasterBundle: { qty: number; price: number; revisionsIncluded: number; includesVocalTuning: boolean; includesVocalEditing: boolean }
    vocalTuning?: { qty: number; price: number; freeQty: number }
    vocalEditing?: { qty: number; price: number; freeQty: number }
    extraRevisions?: { qty: number; price: number }
    total: number
  } | null
  deliverables: {
    altVersions: number
    stemsExport: number
    stemsExportFree: boolean
    multitrackExport: number
    usbMedia: number
    total: number
  }
  rush: {
    option: string
    price: number
  } | null
  totals: {
    session: number
    post: number
    deliverables: number
    rush: number
    grand: number
  }
  bundleSavings: number
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
})

function formatDate(dateString: string): string {
  if (!dateString) return 'Not specified'
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('en-CA', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function formatTime(timeString: string): string {
  if (!timeString) return 'Flexible'
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes || '00'} ${ampm}`
}

function generateStudioEmailHTML(data: BookingData): string {
  const { contact, sessionMode, session, postProduction, deliverables, rush, totals, bundleSavings } = data
  
  const postItems: string[] = []
  if (postProduction) {
    if (postProduction.mixMasterBundle.qty > 0) {
      postItems.push(`Mix + Master Bundle x${postProduction.mixMasterBundle.qty} - CA$${postProduction.mixMasterBundle.qty * postProduction.mixMasterBundle.price} (5 revisions, vocal tuning & editing included)`)
    }
    if (postProduction.mixing.qty > 0) {
      postItems.push(`Mixing x${postProduction.mixing.qty} - CA$${postProduction.mixing.qty * postProduction.mixing.price} (2 revisions, vocal tuning included)`)
    }
    if (postProduction.mastering.qty > 0) {
      postItems.push(`Mastering x${postProduction.mastering.qty} - CA$${postProduction.mastering.qty * postProduction.mastering.price}`)
    }
    if (postProduction.vocalTuning && postProduction.vocalTuning.qty > postProduction.vocalTuning.freeQty) {
      const paidQty = postProduction.vocalTuning.qty - postProduction.vocalTuning.freeQty
      postItems.push(`Vocal Tuning x${paidQty} - CA$${paidQty * postProduction.vocalTuning.price}`)
    }
    if (postProduction.vocalEditing && postProduction.vocalEditing.qty > postProduction.vocalEditing.freeQty) {
      const paidQty = postProduction.vocalEditing.qty - postProduction.vocalEditing.freeQty
      postItems.push(`Vocal Editing x${paidQty} - CA$${paidQty * postProduction.vocalEditing.price}`)
    }
    if (postProduction.extraRevisions && postProduction.extraRevisions.qty > 0) {
      const freeRevisions = (postProduction.mixing.qty * 2) + (postProduction.mixMasterBundle.qty * 5)
      const paidRevisions = Math.max(0, postProduction.extraRevisions.qty - freeRevisions)
      if (paidRevisions > 0) {
        postItems.push(`Extra Revisions x${paidRevisions} - CA$${paidRevisions * postProduction.extraRevisions.price}`)
      }
    }
  }

  const deliverableItems: string[] = []
  if (deliverables.altVersions > 0) deliverableItems.push(`Alt Versions Pack - CA$${deliverables.altVersions}`)
  if (deliverables.stemsExport > 0 || deliverables.stemsExportFree) {
    deliverableItems.push(`Stems Export - ${deliverables.stemsExportFree ? 'FREE (included with bundle)' : `CA$${deliverables.stemsExport}`}`)
  }
  if (deliverables.multitrackExport > 0) deliverableItems.push(`Multitrack Export - CA$${deliverables.multitrackExport}`)
  if (deliverables.usbMedia > 0) deliverableItems.push(`USB Media - CA$${deliverables.usbMedia}`)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header with Logo -->
    <div style="background-color: #18181b; border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center;">
      <img src="https://allianceproductions.ca/AP-logo-square.jpg" alt="Alliance Productions" style="width: 56px; height: 56px; border-radius: 12px; margin-bottom: 16px;" />
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">New Session Request</h1>
      <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 13px;">${new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' })}</p>
    </div>

    <!-- Main Content Card -->
    <div style="background-color: #ffffff; border-radius: 0 0 12px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <!-- Session Type -->
      <div style="padding: 24px; border-bottom: 1px solid #e4e4e7; text-align: center;">
        <span style="display: inline-block; background-color: ${sessionMode === 'recording' ? '#fef3c7' : '#f4f4f5'}; color: ${sessionMode === 'recording' ? '#92400e' : '#52525b'}; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          ${sessionMode === 'recording' ? 'Recording Session' : 'Studio Rental'}
        </span>
      </div>

      <!-- Client Info -->
      <div style="padding: 24px; border-bottom: 1px solid #e4e4e7;">
        <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Client Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 14px; width: 100px;">Name</td>
            <td style="padding: 8px 0; color: #18181b; font-weight: 600; font-size: 14px;">${contact.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Email</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${contact.email}" style="color: #b45309; text-decoration: none;">${contact.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Phone</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="tel:${contact.phone}" style="color: #b45309; text-decoration: none;">${contact.phone}</a></td>
          </tr>
          ${contact.instagram ? `
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Instagram</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="https://instagram.com/${contact.instagram.replace('@', '')}" style="color: #b45309; text-decoration: none;">${contact.instagram}</a></td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- Session Details -->
      <div style="padding: 24px; border-bottom: 1px solid #e4e4e7;">
        <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Session Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; color: #18181b; font-weight: 600; font-size: 14px; text-align: right;">${formatDate(contact.preferredDate)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; color: #18181b; font-size: 14px; text-align: right;">${formatTime(contact.preferredTime)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Duration</td>
            <td style="padding: 8px 0; color: #18181b; font-weight: 600; font-size: 14px; text-align: right;">${session.hours} hour${session.hours > 1 ? 's' : ''}</td>
          </tr>
        </table>
        
        <!-- Session Price Breakdown -->
        <div style="margin-top: 16px; padding: 12px; background: #f4f4f5; border-radius: 8px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 4px 0; color: #71717a; font-size: 13px;">Studio Workspace (${session.hours}hr × CA$35/hr)</td>
              <td style="padding: 4px 0; color: #18181b; font-size: 13px; text-align: right;">CA$${session.hours * 35}</td>
            </tr>
            ${session.includeEngineer ? `
            <tr>
              <td style="padding: 4px 0; color: #71717a; font-size: 13px;">Recording Engineer (${session.hours}hr × CA$23/hr)</td>
              <td style="padding: 4px 0; color: #18181b; font-size: 13px; text-align: right;">CA$${session.hours * 23}</td>
            </tr>
            ` : ''}
            ${session.includeProducer ? `
            <tr>
              <td style="padding: 4px 0; color: #71717a; font-size: 13px;">Session Producer (${session.producerHours || session.hours}hr × CA$27/hr)</td>
              <td style="padding: 4px 0; color: #18181b; font-size: 13px; text-align: right;">CA$${(session.producerHours || session.hours) * 27}</td>
            </tr>
            ` : ''}
            ${session.isAfterHours ? `
            <tr>
              <td style="padding: 4px 0; color: #b45309; font-size: 13px;">After-Hours Premium (${session.afterHoursCount || 1}hr × CA$5/hr)</td>
              <td style="padding: 4px 0; color: #b45309; font-size: 13px; text-align: right;">+CA$${(session.afterHoursCount || 1) * 5}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e4e4e7;">
          <table style="width: 100%;">
            <tr>
              <td style="color: #71717a; font-size: 14px;">Session Subtotal</td>
              <td style="color: #18181b; font-weight: 700; font-size: 16px; text-align: right;">CA$${totals.session}</td>
            </tr>
          </table>
        </div>
      </div>

      ${postItems.length > 0 ? `
      <!-- Post-Production -->
      <div style="padding: 24px; border-bottom: 1px solid #e4e4e7;">
        <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Post-Production</h2>
        ${postItems.map(item => `<p style="margin: 10px 0; color: #3f3f46; font-size: 14px; line-height: 1.5;">${item}</p>`).join('')}
        ${bundleSavings > 0 ? `<p style="margin: 16px 0 0 0; color: #15803d; font-size: 13px; font-weight: 500;">Bundle savings: CA$${bundleSavings}</p>` : ''}
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e4e4e7;">
          <table style="width: 100%;">
            <tr>
              <td style="color: #71717a; font-size: 14px;">Post-Production Subtotal</td>
              <td style="color: #18181b; font-weight: 600; font-size: 14px; text-align: right;">CA$${totals.post}</td>
            </tr>
          </table>
        </div>
      </div>
      ` : ''}

      ${deliverableItems.length > 0 ? `
      <!-- Deliverables -->
      <div style="padding: 24px; border-bottom: 1px solid #e4e4e7;">
        <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Deliverables</h2>
        ${deliverableItems.map(item => `<p style="margin: 10px 0; color: #3f3f46; font-size: 14px;">${item}</p>`).join('')}
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e4e4e7;">
          <table style="width: 100%;">
            <tr>
              <td style="color: #71717a; font-size: 14px;">Deliverables Subtotal</td>
              <td style="color: #18181b; font-weight: 600; font-size: 14px; text-align: right;">CA$${totals.deliverables}</td>
            </tr>
          </table>
        </div>
      </div>
      ` : ''}

      ${rush ? `
      <!-- Rush -->
      <div style="padding: 24px; border-bottom: 1px solid #e4e4e7;">
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px;">
          <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">${rush.option === 'rush24' ? '24-Hour' : '48-Hour'} Rush Turnaround</p>
          <p style="color: #b45309; margin: 4px 0 0 0; font-size: 14px;">+CA$${rush.price}</p>
        </div>
      </div>
      ` : ''}

      <!-- Grand Total -->
      <div style="padding: 24px; background-color: #18181b; border-radius: 0 0 12px 12px;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #a1a1aa; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Total</td>
            <td style="color: #ffffff; font-size: 28px; font-weight: 700; text-align: right;">CA$${totals.grand}</td>
          </tr>
        </table>
      </div>
    </div>

    ${contact.projectDescription ? `
    <!-- Project Description -->
    <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #18181b; margin: 0 0 12px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Project Description</h2>
      <p style="color: #3f3f46; margin: 0; line-height: 1.6; font-size: 14px;">${contact.projectDescription}</p>
    </div>
    ` : ''}

    ${contact.additionalNotes ? `
    <!-- Additional Notes -->
    <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #18181b; margin: 0 0 12px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Additional Notes</h2>
      <p style="color: #3f3f46; margin: 0; line-height: 1.6; font-size: 14px;">${contact.additionalNotes}</p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="text-align: center; padding: 32px 0 16px 0;">
      <p style="color: #71717a; font-size: 12px; margin: 0;">Alliance Productions Records Inc.</p>
      <p style="color: #a1a1aa; font-size: 11px; margin: 6px 0 0 0;">Montreal, QC</p>
    </div>
  </div>
</body>
</html>
`
}

function generateClientConfirmationHTML(data: BookingData): string {
  const { contact, sessionMode, session, postProduction, deliverables, rush, totals, bundleSavings } = data
  
  // Build pricing breakdown for customer email
  const pricingItems: { name: string; price: string; note?: string }[] = []
  
  // Session
  pricingItems.push({ name: `Studio Session (${session.hours}hr${session.hours > 1 ? 's' : ''})`, price: `CA$${totals.session}` })
  
  // Post-production with details
  if (postProduction) {
    if (postProduction.mixMasterBundle.qty > 0) {
      pricingItems.push({ 
        name: `Mix + Master Bundle ×${postProduction.mixMasterBundle.qty}`, 
        price: `CA$${postProduction.mixMasterBundle.qty * postProduction.mixMasterBundle.price}`,
        note: 'Includes vocal tuning, editing, 5 revisions, stems'
      })
    }
    if (postProduction.mixing.qty > 0) {
      pricingItems.push({ 
        name: `Mixing ×${postProduction.mixing.qty}`, 
        price: `CA$${postProduction.mixing.qty * postProduction.mixing.price}`,
        note: 'Includes vocal tuning, 2 revisions'
      })
    }
    if (postProduction.mastering.qty > 0) {
      pricingItems.push({ name: `Mastering ×${postProduction.mastering.qty}`, price: `CA$${postProduction.mastering.qty * postProduction.mastering.price}` })
    }
    if (postProduction.vocalTuning && postProduction.vocalTuning.qty > postProduction.vocalTuning.freeQty) {
      const paidQty = postProduction.vocalTuning.qty - postProduction.vocalTuning.freeQty
      pricingItems.push({ name: `Extra Vocal Tuning ×${paidQty}`, price: `CA$${paidQty * postProduction.vocalTuning.price}` })
    }
    if (postProduction.vocalEditing && postProduction.vocalEditing.qty > postProduction.vocalEditing.freeQty) {
      const paidQty = postProduction.vocalEditing.qty - postProduction.vocalEditing.freeQty
      pricingItems.push({ name: `Extra Vocal Editing ×${paidQty}`, price: `CA$${paidQty * postProduction.vocalEditing.price}` })
    }
    if (postProduction.extraRevisions && postProduction.extraRevisions.qty > 0) {
      const freeRevisions = (postProduction.mixing.qty * 2) + (postProduction.mixMasterBundle.qty * 5)
      const paidRevisions = Math.max(0, postProduction.extraRevisions.qty - freeRevisions)
      if (paidRevisions > 0) {
        pricingItems.push({ name: `Extra Revisions ×${paidRevisions}`, price: `CA$${paidRevisions * postProduction.extraRevisions.price}` })
      }
    }
  }
  
  // Deliverables
  if (deliverables.altVersions > 0) pricingItems.push({ name: 'Alt Versions Pack', price: `CA$${deliverables.altVersions}` })
  if (deliverables.stemsExportFree) {
    pricingItems.push({ name: 'Stems Export', price: 'FREE', note: 'Included with bundle' })
  } else if (deliverables.stemsExport > 0) {
    pricingItems.push({ name: 'Stems Export', price: `CA$${deliverables.stemsExport}` })
  }
  if (deliverables.multitrackExport > 0) pricingItems.push({ name: 'Multitrack Export', price: `CA$${deliverables.multitrackExport}` })
  if (deliverables.usbMedia > 0) pricingItems.push({ name: 'USB Media', price: `CA$${deliverables.usbMedia}` })
  
  // Rush
  if (rush) {
    pricingItems.push({ name: `${rush.option === 'rush24' ? '24-Hour' : '48-Hour'} Rush`, price: `+CA$${rush.price}` })
  }

  const postItems: string[] = []
  if (postProduction) {
    if (postProduction.mixMasterBundle.qty > 0) postItems.push(`Mix + Master Bundle ×${postProduction.mixMasterBundle.qty}`)
    if (postProduction.mixing.qty > 0) postItems.push(`Mixing ×${postProduction.mixing.qty}`)
    if (postProduction.mastering.qty > 0) postItems.push(`Mastering ×${postProduction.mastering.qty}`)
    if (postProduction.vocalTuning && postProduction.vocalTuning.qty > 0) postItems.push(`Vocal Tuning ×${postProduction.vocalTuning.qty}`)
    if (postProduction.vocalEditing && postProduction.vocalEditing.qty > 0) postItems.push(`Vocal Editing ×${postProduction.vocalEditing.qty}`)
    if (postProduction.extraRevisions && postProduction.extraRevisions.qty > 0) postItems.push(`Extra Revisions ×${postProduction.extraRevisions.qty}`)
  }

  const deliverableItems: string[] = []
  if (deliverables.altVersions > 0) deliverableItems.push('Alt Versions Pack')
  if (deliverables.stemsExport > 0 || deliverables.stemsExportFree) deliverableItems.push('Stems Export')
  if (deliverables.multitrackExport > 0) deliverableItems.push('Multitrack Export')
  if (deliverables.usbMedia > 0) deliverableItems.push('USB Media')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header with Logo -->
    <div style="background-color: #18181b; border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center;">
      <img src="https://allianceproductions.ca/AP-logo-square.jpg" alt="Alliance Productions" style="width: 56px; height: 56px; border-radius: 12px; margin-bottom: 16px;" />
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">Request Received</h1>
      <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 13px;">Thank you for choosing Alliance Productions</p>
    </div>

    <!-- Main Content Card -->
    <div style="background-color: #ffffff; border-radius: 0 0 12px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <!-- Greeting -->
      <div style="padding: 28px 24px; border-bottom: 1px solid #e4e4e7;">
        <p style="color: #18181b; font-size: 16px; margin: 0 0 12px 0; font-weight: 500;">Hey ${contact.name.split(' ')[0]},</p>
        <p style="color: #52525b; margin: 0; line-height: 1.6; font-size: 14px;">
          We've received your ${sessionMode === 'recording' ? 'session' : 'studio rental'} request. Our team will review your booking and get back to you within <strong style="color: #18181b;">24 hours</strong> to confirm availability.
        </p>
      </div>

      <!-- Session Summary -->
      <div style="padding: 24px; border-bottom: 1px solid #e4e4e7;">
        <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your ${sessionMode === 'recording' ? 'Session' : 'Rental'} Summary</h2>
        
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #71717a; font-size: 14px;">Date</td>
              <td style="padding: 6px 0; color: #18181b; font-weight: 600; text-align: right; font-size: 14px;">${formatDate(contact.preferredDate)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #71717a; font-size: 14px;">Time</td>
              <td style="padding: 6px 0; color: #18181b; text-align: right; font-size: 14px;">${formatTime(contact.preferredTime)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #71717a; font-size: 14px;">Duration</td>
              <td style="padding: 6px 0; color: #18181b; text-align: right; font-size: 14px;">${session.hours} hour${session.hours > 1 ? 's' : ''}</td>
            </tr>
          </table>
        </div>

        <!-- Services -->
        <div style="margin-bottom: 12px;">
          <p style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; font-weight: 500;">Session Breakdown</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #15803d; font-size: 14px; width: 24px; vertical-align: top;">&#10003;</td>
              <td style="padding: 6px 0; color: #18181b; font-size: 14px;">Studio Workspace (${session.hours} hrs)</td>
              <td style="padding: 6px 0; color: #71717a; font-size: 14px; text-align: right;">CA$${session.hours * 35}</td>
            </tr>
            ${session.includeEngineer ? `
            <tr>
              <td style="padding: 6px 0; color: #15803d; font-size: 14px; width: 24px; vertical-align: top;">&#10003;</td>
              <td style="padding: 6px 0; color: #18181b; font-size: 14px;">Recording Engineer (${session.hours} hrs)</td>
              <td style="padding: 6px 0; color: #71717a; font-size: 14px; text-align: right;">CA$${session.hours * 23}</td>
            </tr>
            ` : ''}
            ${session.includeProducer ? `
            <tr>
              <td style="padding: 6px 0; color: #15803d; font-size: 14px; width: 24px; vertical-align: top;">&#10003;</td>
              <td style="padding: 6px 0; color: #18181b; font-size: 14px;">Session Producer (${session.producerHours || session.hours} hrs)</td>
              <td style="padding: 6px 0; color: #71717a; font-size: 14px; text-align: right;">CA$${(session.producerHours || session.hours) * 27}</td>
            </tr>
            ` : ''}
            ${session.isAfterHours ? `
            <tr>
              <td style="padding: 6px 0; color: #b45309; font-size: 14px; width: 24px; vertical-align: top;">*</td>
              <td style="padding: 6px 0; color: #18181b; font-size: 14px;">After-Hours Premium (${session.afterHoursCount || 1} hrs)</td>
              <td style="padding: 6px 0; color: #b45309; font-size: 14px; text-align: right;">+CA$${(session.afterHoursCount || 1) * 5}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${postItems.length > 0 ? `
        <div style="margin-bottom: 12px; padding-top: 16px; border-top: 1px solid #e4e4e7;">
          <p style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; font-weight: 500;">Post-Production</p>
          <table style="width: 100%; border-collapse: collapse;">
            ${postItems.map(item => `
            <tr>
              <td style="padding: 6px 0; color: #15803d; font-size: 14px; width: 24px; vertical-align: top;">&#10003;</td>
              <td style="padding: 6px 0; color: #18181b; font-size: 14px;">${item}</td>
            </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}

        ${deliverableItems.length > 0 ? `
        <div style="padding-top: 16px; border-top: 1px solid #e4e4e7;">
          <p style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; font-weight: 500;">Deliverables</p>
          <table style="width: 100%; border-collapse: collapse;">
            ${deliverableItems.map(item => `
            <tr>
              <td style="padding: 6px 0; color: #15803d; font-size: 14px; width: 24px; vertical-align: top;">&#10003;</td>
              <td style="padding: 6px 0; color: #18181b; font-size: 14px;">${item}</td>
            </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}

        ${rush ? `
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 12px 16px; margin-top: 16px;">
          <p style="color: #92400e; margin: 0; font-weight: 600; font-size: 13px;">${rush.option === 'rush24' ? '24-Hour' : '48-Hour'} Rush Turnaround</p>
        </div>
        ` : ''}
      </div>

      <!-- Pricing Breakdown -->
      <div style="padding: 24px; border-bottom: 1px solid #e4e4e7;">
        <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Pricing Breakdown</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${pricingItems.map(item => `
          <tr>
            <td style="padding: 10px 0; color: #18181b; font-size: 14px; border-bottom: 1px solid #f4f4f5;">
              ${item.name}
              ${item.note ? `<br><span style="color: #71717a; font-size: 12px;">${item.note}</span>` : ''}
            </td>
            <td style="padding: 10px 0; color: ${item.price === 'FREE' ? '#15803d' : '#18181b'}; font-size: 14px; text-align: right; font-weight: 600; border-bottom: 1px solid #f4f4f5; white-space: nowrap;">${item.price}</td>
          </tr>
          `).join('')}
        </table>
        ${bundleSavings > 0 ? `
        <div style="margin-top: 16px; padding: 12px 16px; background-color: #f0fdf4; border-radius: 8px;">
          <p style="color: #15803d; margin: 0; font-size: 13px; font-weight: 600;">You're saving CA$${bundleSavings} with the bundle</p>
        </div>
        ` : ''}
      </div>

      <!-- Estimated Total -->
      <div style="padding: 24px; background-color: #18181b; border-radius: 0 0 12px 12px;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #a1a1aa; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Total</td>
            <td style="color: #ffffff; font-size: 28px; font-weight: 700; text-align: right;">CA$${totals.grand}</td>
          </tr>
        </table>
        <p style="color: #71717a; margin: 8px 0 0 0; font-size: 12px; text-align: right;">Final invoice may vary based on session details</p>
      </div>
    </div>

    <!-- What's Next -->
    <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 15px; font-weight: 600;">What Happens Next</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 32px; vertical-align: top; padding: 0 0 14px 0;">
            <div style="width: 24px; height: 24px; background-color: #18181b; border-radius: 50%; text-align: center; line-height: 24px; color: #ffffff; font-size: 12px; font-weight: 600;">1</div>
          </td>
          <td style="vertical-align: top; padding: 2px 0 14px 0; color: #52525b; font-size: 14px;">We'll review your request and check availability</td>
        </tr>
        <tr>
          <td style="width: 32px; vertical-align: top; padding: 0 0 14px 0;">
            <div style="width: 24px; height: 24px; background-color: #18181b; border-radius: 50%; text-align: center; line-height: 24px; color: #ffffff; font-size: 12px; font-weight: 600;">2</div>
          </td>
          <td style="vertical-align: top; padding: 2px 0 14px 0; color: #52525b; font-size: 14px;">You'll receive a confirmation with final details</td>
        </tr>
        <tr>
          <td style="width: 32px; vertical-align: top; padding: 0;">
            <div style="width: 24px; height: 24px; background-color: #18181b; border-radius: 50%; text-align: center; line-height: 24px; color: #ffffff; font-size: 12px; font-weight: 600;">3</div>
          </td>
          <td style="vertical-align: top; padding: 2px 0 0 0; color: #52525b; font-size: 14px;">Show up, create, and let's make it happen</td>
        </tr>
      </table>
    </div>

    <!-- Studio Policies -->
    <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Studio Policies</h2>
      
      <!-- Fees -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
        <p style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0; font-weight: 500;">Session Fees</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #3f3f46; font-size: 13px;">After-Hours Premium</td>
            <td style="padding: 6px 0; color: #b45309; font-size: 13px; text-align: right; font-weight: 600;">+CA$5/hr</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 0 0 10px 0; color: #a1a1aa; font-size: 11px;">Sessions outside 11am-10pm</td>
          </tr>
          <tr style="border-top: 1px solid #e4e4e7;">
            <td style="padding: 10px 0 6px 0; color: #3f3f46; font-size: 13px;">Overtime Fee</td>
            <td style="padding: 10px 0 6px 0; color: #dc2626; font-size: 13px; text-align: right; font-weight: 600;">CA$35 / 30 min</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 0 0 10px 0; color: #a1a1aa; font-size: 11px;">When sessions extend beyond booked time</td>
          </tr>
          <tr style="border-top: 1px solid #e4e4e7;">
            <td style="padding: 10px 0 6px 0; color: #3f3f46; font-size: 13px;">Late Arrival / No-Show</td>
            <td style="padding: 10px 0 6px 0; color: #dc2626; font-size: 13px; text-align: right; font-weight: 600;">CA$60</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 0; color: #a1a1aa; font-size: 11px;">Arrivals 30+ minutes late may incur this fee</td>
          </tr>
        </table>
      </div>
      
      <!-- Deposit -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
        <p style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 500;">Booking Deposit</p>
        <p style="color: #52525b; font-size: 13px; margin: 0 0 8px 0; line-height: 1.5;">New clients are required to pay a refundable deposit to secure their booking. The deposit is applied as credit toward your final invoice.</p>
        <p style="color: #a1a1aa; font-size: 11px; margin: 0;">Card payment required for first session. Cash accepted for future bookings.</p>
      </div>
      
      <!-- Agreement -->
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px;">
        <p style="color: #92400e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 600;">Service Agreement</p>
        <p style="color: #78350f; font-size: 12px; margin: 0; line-height: 1.6;">
          By submitting this booking request, you acknowledge: Arrivals 30+ minutes late may be treated as a late/no-show. Time beyond the booked end time is billed as overtime. Sessions outside regular hours include an after-hours premium. Payment is due upon receipt. Your time is reserved once payment is received.
        </p>
      </div>
    </div>

    <!-- Contact -->
    <div style="background-color: #ffffff; border-radius: 12px; padding: 24px; margin-top: 16px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <p style="color: #52525b; margin: 0 0 16px 0; font-size: 14px;">Questions? Reach out anytime</p>
      <a href="mailto:contact@allianceproductions.ca" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">contact@allianceproductions.ca</a>
      <p style="color: #a1a1aa; margin: 16px 0 0 0; font-size: 13px;">Follow us <a href="https://www.instagram.com/alliance.wav" style="color: #18181b; text-decoration: none; font-weight: 500;">@alliance.wav</a></p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 32px 0 16px 0;">
      <p style="color: #71717a; font-size: 12px; margin: 0;">Alliance Productions Records Inc.</p>
      <p style="color: #a1a1aa; font-size: 11px; margin: 6px 0 0 0;">Montreal, QC</p>
    </div>
  </div>
</body>
</html>
`
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request)
    const rateLimit = checkRateLimit(rateLimitKey)
    
    if (!rateLimit.allowed) {
      const minutesUntilReset = Math.ceil(rateLimit.resetIn / 60000)
      return NextResponse.json(
        { error: `Too many booking requests. Please try again in ${minutesUntilReset} minutes.` },
        { status: 429 }
      )
    }

    const data = await request.json()

    // Honeypot check - if website field is filled, it's likely a bot
    if (data.website || data.url || data.honeypot) {
      // Silently reject but return success to not alert bots
      console.log('Honeypot triggered - rejecting spam submission')
      return NextResponse.json({ success: true, message: 'Booking request submitted successfully' })
    }

    // Timestamp check - reject if form was submitted too quickly (< 3 seconds)
    if (data.formLoadTime) {
      const submissionTime = Date.now()
      const timeDiff = submissionTime - data.formLoadTime
      if (timeDiff < 3000) {
        // Form submitted in less than 3 seconds - likely a bot
        console.log('Form submitted too quickly - rejecting spam submission')
        return NextResponse.json({ success: true, message: 'Booking request submitted successfully' })
      }
    }

    const studioEmail = process.env.STUDIO_EMAIL || 'contact.alliancewav@gmail.com'
    const senderEmail = process.env.MAIL_SENDER || process.env.MAIL_USERNAME
    const replyToEmail = process.env.MAIL_REPLY_TO || 'contact.alliancewav@gmail.com'

    // Handle Project Inquiry (full-project path)
    if (data.type === 'project-inquiry' && data.bookingPath === 'full-project') {
      // Validate project inquiry fields
      if (!data.contact?.artistName || !data.contact?.email || !data.contact?.phone) {
        return NextResponse.json(
          { error: 'Missing required contact information' },
          { status: 400 }
        )
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.contact.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Phone format validation
      const phoneClean = data.contact.phone.replace(/[\s\-\(\)\.]/g, '')
      if (phoneClean.length < 10 || !/^\+?\d+$/.test(phoneClean)) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        )
      }

      // Generate project inquiry emails
      const projectTypeLabels: Record<string, string> = {
        'single': 'Single',
        'ep': 'EP (2-5 songs)',
        'album': 'Album (6+ songs)',
        'other': 'Other'
      }
      const timelineLabels: Record<string, string> = {
        'asap': 'ASAP',
        '1month': 'Within 1 month',
        '2-3months': '2-3 months',
        'flexible': 'Flexible'
      }
      const budgetLabels: Record<string, string> = {
        'under1k': 'Under $1,000',
        '1k-3k': '$1,000 - $3,000',
        '3k-5k': '$3,000 - $5,000',
        '5k-10k': '$5,000 - $10,000',
        '10k+': '$10,000+'
      }
      const hasBeatsLabels: Record<string, string> = {
        'yes': 'Has their own beats',
        'no': 'Needs beats',
        'need-production': 'Needs full production'
      }

      const studioEmailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #7c3aed; border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center;">
      <img src="https://allianceproductions.ca/AP-logo-square.jpg" alt="Alliance Productions" style="width: 56px; height: 56px; border-radius: 12px; margin-bottom: 16px;" />
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">New Project Inquiry</h1>
      <p style="color: #e9d5ff; margin: 8px 0 0 0; font-size: 13px;">${new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' })}</p>
    </div>
    <div style="background-color: #ffffff; padding: 24px; border-bottom: 1px solid #e4e4e7;">
      <span style="display: inline-block; background-color: #f3e8ff; color: #7c3aed; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase;">High-Ticket Lead</span>
    </div>
    <div style="background-color: #ffffff; padding: 24px; border-bottom: 1px solid #e4e4e7;">
      <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase;">Contact Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Artist/Project</td><td style="padding: 8px 0; color: #18181b; font-weight: 600; font-size: 14px;">${data.contact.artistName}</td></tr>
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Email</td><td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${data.contact.email}" style="color: #7c3aed;">${data.contact.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Phone</td><td style="padding: 8px 0; font-size: 14px;"><a href="tel:${data.contact.phone}" style="color: #7c3aed;">${data.contact.phone}</a></td></tr>
      </table>
    </div>
    <div style="background-color: #ffffff; padding: 24px; border-bottom: 1px solid #e4e4e7;">
      <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase;">Project Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Project Type</td><td style="padding: 8px 0; color: #18181b; font-weight: 600; font-size: 14px;">${projectTypeLabels[data.project?.type] || data.project?.type || 'Not specified'}</td></tr>
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Genres</td><td style="padding: 8px 0; color: #18181b; font-size: 14px;">${data.project?.genres?.length > 0 ? data.project.genres.join(', ') : 'Not specified'}</td></tr>
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Beats/Production</td><td style="padding: 8px 0; color: #18181b; font-size: 14px;">${hasBeatsLabels[data.project?.hasBeats] || 'Not specified'}</td></tr>
        ${data.project?.referenceArtists ? `<tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Reference Artists</td><td style="padding: 8px 0; color: #18181b; font-size: 14px;">${data.project.referenceArtists}</td></tr>` : ''}
        ${data.project?.vision ? `<tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Vision</td><td style="padding: 8px 0; color: #18181b; font-size: 14px;">${data.project.vision}</td></tr>` : ''}
      </table>
    </div>
    <div style="background-color: #ffffff; padding: 24px; border-bottom: 1px solid #e4e4e7;">
      <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase;">Timeline & Budget</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Timeline</td><td style="padding: 8px 0; color: #18181b; font-weight: 600; font-size: 14px;">${timelineLabels[data.timeline] || 'Not specified'}</td></tr>
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 14px;">Budget Range</td><td style="padding: 8px 0; color: #7c3aed; font-weight: 600; font-size: 14px;">${budgetLabels[data.budget] || 'Not specified'}</td></tr>
      </table>
    </div>
    <div style="background-color: #18181b; border-radius: 0 0 12px 12px; padding: 24px; text-align: center;">
      <p style="color: #a1a1aa; margin: 0; font-size: 13px;">Reply to this email to respond directly to the client</p>
    </div>
  </div>
</body>
</html>`

      const clientEmailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #18181b; border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center;">
      <img src="https://allianceproductions.ca/AP-logo-square.jpg" alt="Alliance Productions" style="width: 56px; height: 56px; border-radius: 12px; margin-bottom: 16px;" />
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">Inquiry Received</h1>
      <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 13px;">Thank you for reaching out</p>
    </div>
    <div style="background-color: #ffffff; padding: 28px 24px; border-bottom: 1px solid #e4e4e7;">
      <p style="color: #18181b; font-size: 16px; margin: 0 0 12px 0; font-weight: 500;">Hey ${data.contact.artistName.split(' ')[0]},</p>
      <p style="color: #52525b; margin: 0; line-height: 1.6; font-size: 14px;">
        We've received your project inquiry and we're excited to learn more about your vision. Our team will review your submission and get back to you within <strong style="color: #18181b;">24-48 hours</strong> with a custom quote.
      </p>
    </div>
    <div style="background-color: #ffffff; padding: 24px; border-bottom: 1px solid #e4e4e7;">
      <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase;">Your Inquiry Summary</h2>
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #71717a; font-size: 14px;">Project Type</td><td style="padding: 6px 0; color: #18181b; font-weight: 600; text-align: right; font-size: 14px;">${projectTypeLabels[data.project?.type] || data.project?.type || 'Not specified'}</td></tr>
          <tr><td style="padding: 6px 0; color: #71717a; font-size: 14px;">Genres</td><td style="padding: 6px 0; color: #18181b; text-align: right; font-size: 14px;">${data.project?.genres?.length > 0 ? data.project.genres.join(', ') : 'Not specified'}</td></tr>
          <tr><td style="padding: 6px 0; color: #71717a; font-size: 14px;">Timeline</td><td style="padding: 6px 0; color: #18181b; text-align: right; font-size: 14px;">${timelineLabels[data.timeline] || 'Flexible'}</td></tr>
          <tr><td style="padding: 6px 0; color: #71717a; font-size: 14px;">Budget Range</td><td style="padding: 6px 0; color: #18181b; text-align: right; font-size: 14px;">${budgetLabels[data.budget] || 'Not specified'}</td></tr>
        </table>
      </div>
    </div>
    <div style="background-color: #ffffff; padding: 24px; border-bottom: 1px solid #e4e4e7;">
      <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 15px; font-weight: 600;">What Happens Next</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 32px; vertical-align: top; padding: 0 0 14px 0;"><div style="width: 24px; height: 24px; background-color: #18181b; border-radius: 50%; text-align: center; line-height: 24px; color: #ffffff; font-size: 12px; font-weight: 600;">1</div></td>
          <td style="vertical-align: top; padding: 2px 0 14px 0; color: #52525b; font-size: 14px;">We review your project details and requirements</td>
        </tr>
        <tr>
          <td style="width: 32px; vertical-align: top; padding: 0 0 14px 0;"><div style="width: 24px; height: 24px; background-color: #18181b; border-radius: 50%; text-align: center; line-height: 24px; color: #ffffff; font-size: 12px; font-weight: 600;">2</div></td>
          <td style="vertical-align: top; padding: 2px 0 14px 0; color: #52525b; font-size: 14px;">You'll receive a custom quote tailored to your vision</td>
        </tr>
        <tr>
          <td style="width: 32px; vertical-align: top; padding: 0;"><div style="width: 24px; height: 24px; background-color: #18181b; border-radius: 50%; text-align: center; line-height: 24px; color: #ffffff; font-size: 12px; font-weight: 600;">3</div></td>
          <td style="vertical-align: top; padding: 2px 0 0 0; color: #52525b; font-size: 14px;">We'll schedule a call to discuss your project in detail</td>
        </tr>
      </table>
    </div>
    <div style="background-color: #ffffff; border-radius: 0 0 12px 12px; padding: 24px; text-align: center;">
      <p style="color: #52525b; margin: 0 0 16px 0; font-size: 14px;">Questions? Reach out anytime</p>
      <a href="mailto:contact@allianceproductions.ca" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">contact@allianceproductions.ca</a>
    </div>
    <div style="text-align: center; padding: 32px 0 16px 0;">
      <p style="color: #71717a; font-size: 12px; margin: 0;">Alliance Productions Records Inc.</p>
      <p style="color: #a1a1aa; font-size: 11px; margin: 6px 0 0 0;">Montreal, QC</p>
    </div>
  </div>
</body>
</html>`

      // Send email to studio
      await transporter.sendMail({
        from: `"Alliance Productions" <${senderEmail}>`,
        to: studioEmail,
        replyTo: data.contact.email,
        subject: `🎯 Project Inquiry — ${data.contact.artistName} (${budgetLabels[data.budget] || 'Custom Quote'})`,
        html: studioEmailHTML,
      })

      // Send confirmation email to client
      await transporter.sendMail({
        from: `"Alliance Productions" <${senderEmail}>`,
        to: data.contact.email,
        replyTo: replyToEmail,
        subject: `Your Project Inquiry — Alliance Productions`,
        html: clientEmailHTML,
      })

      return NextResponse.json({ success: true, message: 'Project inquiry submitted successfully' })
    }

    // Handle regular session booking
    // Validate required fields
    if (!data.contact?.name || !data.contact?.email || !data.contact?.phone || !data.contact?.preferredDate) {
      return NextResponse.json(
        { error: 'Missing required contact information' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.contact.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Phone format validation (basic - allows various formats)
    const phoneClean = data.contact.phone.replace(/[\s\-\(\)\.]/g, '')
    if (phoneClean.length < 10 || !/^\+?\d+$/.test(phoneClean)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Name validation - must be at least 2 characters, no URLs
    if (data.contact.name.length < 2 || /https?:\/\//.test(data.contact.name)) {
      return NextResponse.json(
        { error: 'Invalid name' },
        { status: 400 }
      )
    }

    // Check for spam patterns in text fields
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|winner|click here|buy now|free money)\b/i,
      /https?:\/\/[^\s]+\.(ru|cn|tk|ml|ga|cf)\b/i,
      /<script|<iframe|javascript:/i,
    ]
    
    const textFields = [
      data.contact.projectDescription || '',
      data.contact.additionalNotes || '',
      data.contact.name,
    ].join(' ')
    
    if (spamPatterns.some(pattern => pattern.test(textFields))) {
      console.log('Spam pattern detected - rejecting submission')
      return NextResponse.json({ success: true, message: 'Booking request submitted successfully' })
    }

    // Send email to studio
    await transporter.sendMail({
      from: `"Alliance Productions" <${senderEmail}>`,
      to: studioEmail,
      replyTo: data.contact.email,
      subject: `New Session Request — ${data.contact.name} (${formatDate(data.contact.preferredDate)})`,
      html: generateStudioEmailHTML(data),
    })

    // Send confirmation email to client
    await transporter.sendMail({
      from: `"Alliance Productions" <${senderEmail}>`,
      to: data.contact.email,
      replyTo: replyToEmail,
      subject: `Your Session Request — Alliance Productions`,
      html: generateClientConfirmationHTML(data),
    })

    return NextResponse.json({ success: true, message: 'Booking request submitted successfully' })
  } catch (error) {
    console.error('Booking submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process booking request' },
      { status: 500 }
    )
  }
}
