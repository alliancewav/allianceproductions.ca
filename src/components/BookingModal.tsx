'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Mic2, 
  Music, 
  Sliders, 
  Clock, 
  Plus, 
  Minus, 
  User, 
  Mail, 
  Phone, 
  Instagram,
  Calendar,
  Check,
  Loader2,
  Sparkles,
  Package,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  Link2,
  Info
} from 'lucide-react'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
}

// Business hours configuration
const BUSINESS_HOURS = {
  0: { open: 11, close: 22 }, // Sunday
  1: { open: 11, close: 22 }, // Monday
  2: { open: 11, close: 22 }, // Tuesday
  3: { open: 11, close: 22 }, // Wednesday
  4: { open: 11, close: 22 }, // Thursday
  5: { open: 11, close: 22 }, // Friday
  6: { open: 11, close: 22 }, // Saturday
}

// Pricing constants
const PRICES = {
  studioWorkspace: 35,
  recordingEngineer: 23,
  producer: 27,
  afterHoursPremium: 5,
  mixing: 55,
  mastering: 25,
  mixMasterBundle: 100,
  vocalTuning: 60,
  vocalEditing: 50,
  stemsMix: 15,
  altVersions: 25,
  stemsExport: 25,
  multitrackExport: 35,
  usbMedia: 15,
  rush24: 100,
  rush48: 50,
}

type SessionMode = 'recording' | 'rental'
type BookingPath = 'record-only' | 'full-project' | null

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(0)
  const [bookingPath, setBookingPath] = useState<BookingPath>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showBundleInfo, setShowBundleInfo] = useState(false)
  
  // Rental mode confirmation modal (shown when user drags to 1 hour)
  const [showRentalConfirm, setShowRentalConfirm] = useState(false)
  const pendingOneHourRef = useRef(false)
  
  // Session configuration
  const [sessionHours, setSessionHours] = useState(2)
  const [includeEngineer, setIncludeEngineer] = useState(true)
  const [includeProducer, setIncludeProducer] = useState(false)
  const [producerHours, setProducerHours] = useState(2) // Min 2, max sessionHours
  
  // Post-production selections (single song only - boolean toggles)
  const [includeMixing, setIncludeMixing] = useState(false)
  const [includeMastering, setIncludeMastering] = useState(false)
  const [includeMixMasterBundle, setIncludeMixMasterBundle] = useState(false)
  const [includeVocalTuning, setIncludeVocalTuning] = useState(false)
  const [includeVocalEditing, setIncludeVocalEditing] = useState(false)
  
  // Deliverables
  const [altVersions, setAltVersions] = useState(false)
  const [stemsExport, setStemsExport] = useState(false)
  const [multitrackExport, setMultitrackExport] = useState(false)
  const [usbMedia, setUsbMedia] = useState(false)
  
  // Rush
  const [rushOption, setRushOption] = useState<'none' | 'rush48' | 'rush24'>('none')
  
  // Contact info
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    preferredDate: '',
    preferredTime: '',
    projectDescription: '',
    additionalNotes: '',
    referenceUrl: ''
  })

  // Genre options for multiselect
  const GENRE_OPTIONS = [
    'Hip-Hop', 'R&B', 'Pop', 'Trap', 'Drill', 'Afrobeats', 
    'Dancehall', 'Reggae', 'Soul', 'Jazz', 'Rock', 'Electronic',
    'Latin', 'Country', 'Gospel', 'Spoken Word', 'Podcast', 'Other'
  ]

  // Full project inquiry form (high-ticket clients)
  const [projectInquiry, setProjectInquiry] = useState({
    artistName: '',
    email: '',
    phone: '',
    projectType: '' as '' | 'single' | 'ep' | 'album' | 'other',
    genres: [] as string[],
    timeline: '' as '' | 'asap' | '1month' | '2-3months' | 'flexible',
    hasBeats: '' as '' | 'yes' | 'no' | 'need-production',
    referenceArtists: '',
    projectVision: '',
    budget: '' as '' | 'under1k' | '1k-3k' | '3k-5k' | '5k-10k' | '10k+'
  })
  
  // Genre dropdown state
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)
  const genreDropdownRef = useRef<HTMLDivElement>(null)

  // Security: honeypot field (should remain empty) and form load timestamp
  const [honeypot, setHoneypot] = useState('')
  const [formLoadTime] = useState(() => Date.now())

  // Custom picker states
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  // Refs for click-outside handling
  const calendarRef = useRef<HTMLDivElement>(null)
  const calendarPortalRef = useRef<HTMLDivElement>(null)
  const timePickerRef = useRef<HTMLDivElement>(null)
  const timePickerPortalRef = useRef<HTMLDivElement>(null)
  const timeScrollRef = useRef<HTMLDivElement>(null)
  const contentScrollRef = useRef<HTMLDivElement>(null)
  
  // Flag to prevent save effect from running before restore completes (fixes race condition)
  const hasRestoredRef = useRef(false)
  
  // Refs for input buttons to position pickers
  const dateInputRef = useRef<HTMLButtonElement>(null)
  const timeInputRef = useRef<HTMLButtonElement>(null)
  
  // State for picker positions (above or below input)
  const [calendarAbove, setCalendarAbove] = useState(false)
  const [timePickerAbove, setTimePickerAbove] = useState(false)
  const [calendarPos, setCalendarPos] = useState({ top: 0, left: 0, width: 0 })
  const [timePickerPos, setTimePickerPos] = useState({ top: 0, left: 0, width: 0 })
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const [windowWidth, setWindowWidth] = useState(1200) // Default to desktop
  
  // Set portal container and window width on mount, track resize
  useEffect(() => {
    setPortalContainer(document.body)
    setWindowWidth(window.innerWidth)
    
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Persist booking state to sessionStorage so it's remembered during the session
  useEffect(() => {
    if (!isOpen) return
    // Don't save until restore has completed (prevents race condition)
    if (!hasRestoredRef.current) return
    
    const state = {
      bookingPath,
      sessionHours,
      includeEngineer,
      includeProducer,
      producerHours,
      includeMixing,
      includeMastering,
      includeMixMasterBundle,
      includeVocalTuning,
      includeVocalEditing,
      altVersions,
      stemsExport,
      multitrackExport,
      usbMedia,
      rushOption,
      contactInfo,
      step
    }
    sessionStorage.setItem('bookingState', JSON.stringify(state))
  }, [isOpen, bookingPath, sessionHours, includeEngineer, includeProducer, producerHours, includeMixing, includeMastering, includeMixMasterBundle, includeVocalTuning, includeVocalEditing, altVersions, stemsExport, multitrackExport, usbMedia, rushOption, contactInfo, step])

  // Restore booking state from sessionStorage when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset the flag when modal closes so restore runs again next time
      hasRestoredRef.current = false
      return
    }
    
    // Only restore once per modal open
    if (hasRestoredRef.current) return
    
    const savedState = sessionStorage.getItem('bookingState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        // Validate sessionHours is one of the valid slider options
        const validHours = [1, 2, 3, 4, 5, 6, 8, 10, 12]
        if (state.bookingPath) setBookingPath(state.bookingPath)
        if (state.sessionHours && validHours.includes(state.sessionHours)) {
          setSessionHours(state.sessionHours)
        }
        if (typeof state.includeEngineer === 'boolean') setIncludeEngineer(state.includeEngineer)
        if (typeof state.includeProducer === 'boolean') setIncludeProducer(state.includeProducer)
        if (typeof state.producerHours === 'number') setProducerHours(state.producerHours)
        if (typeof state.includeMixing === 'boolean') setIncludeMixing(state.includeMixing)
        if (typeof state.includeMastering === 'boolean') setIncludeMastering(state.includeMastering)
        if (typeof state.includeMixMasterBundle === 'boolean') setIncludeMixMasterBundle(state.includeMixMasterBundle)
        if (typeof state.includeVocalTuning === 'boolean') setIncludeVocalTuning(state.includeVocalTuning)
        if (typeof state.includeVocalEditing === 'boolean') setIncludeVocalEditing(state.includeVocalEditing)
        if (typeof state.altVersions === 'boolean') setAltVersions(state.altVersions)
        if (typeof state.stemsExport === 'boolean') setStemsExport(state.stemsExport)
        if (typeof state.multitrackExport === 'boolean') setMultitrackExport(state.multitrackExport)
        if (typeof state.usbMedia === 'boolean') setUsbMedia(state.usbMedia)
        if (state.rushOption) setRushOption(state.rushOption)
        if (state.contactInfo) setContactInfo(prev => ({ ...prev, ...state.contactInfo }))
        if (typeof state.step === 'number' && state.step < 5) setStep(state.step)
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    // Mark restore as complete so save effect can now run
    hasRestoredRef.current = true
  }, [isOpen])

  // Hide/show OpenWidget bubble when modal opens/closes
  useEffect(() => {
    // Create/update a style element to hide OpenWidget with CSS
    let styleEl = document.getElementById('openwidget-hide-style') as HTMLStyleElement
    
    if (isOpen) {
      // Create style element if it doesn't exist
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'openwidget-hide-style'
        document.head.appendChild(styleEl)
      }
      // Hide all OpenWidget elements with CSS
      styleEl.textContent = `
        [class*="openwidget"], 
        #openwidget-container, 
        .openwidget-widget,
        iframe[src*="openwidget"],
        div[data-openwidget],
        #openwidget-btn,
        .ow-bubble,
        [data-lc-id],
        div[role="main"][data-lc-id="0"],
        #chat-widget-minimized,
        iframe[name="chat-widget-minimized"],
        iframe[title*="OpenWidget"],
        div:has(> iframe[name="chat-widget-minimized"]),
        div:has(> div > iframe[name="chat-widget-minimized"]) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: -9999 !important;
        }
      `
    } else {
      // Remove the style element to show OpenWidget again
      if (styleEl) {
        styleEl.remove()
      }
    }
    
    return () => {
      // Cleanup on unmount
      const el = document.getElementById('openwidget-hide-style')
      if (el) el.remove()
    }
  }, [isOpen])

  // Available hours: 6AM to 1AM (next day) = hours 6-24 + hour 1 (represented as 25)
  const availableHours = useMemo(() => {
    const hours: number[] = []
    for (let h = 6; h <= 24; h++) hours.push(h) // 6AM to midnight (24 = 12AM)
    hours.push(25) // 1AM next day (represented as 25 for sorting)
    return hours
  }, [])

  // Ref for scroll debounce timeout
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialScrollRef = useRef(false)
  
  // Drag-to-scroll state for time picker
  const isDraggingTimeRef = useRef(false)
  const dragStartYRef = useRef(0)
  const dragStartScrollRef = useRef(0)
  const hasDraggedRef = useRef(false) // Track if actual drag movement occurred
  const mouseDownTimeRef = useRef(0) // Track when mousedown started
  const clickBlockedUntilRef = useRef(0) // Block clicks until this timestamp
  
  // Document-level drag handlers for time picker (needed for portal)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingTimeRef.current || !timeScrollRef.current) return
      const deltaY = dragStartYRef.current - e.clientY
      if (Math.abs(deltaY) > 3) {
        hasDraggedRef.current = true
      }
      timeScrollRef.current.scrollTop = dragStartScrollRef.current + deltaY
    }
    
    const handleMouseUp = () => {
      if (isDraggingTimeRef.current) {
        isDraggingTimeRef.current = false
        // Only block clicks if user actually dragged
        if (hasDraggedRef.current) {
          clickBlockedUntilRef.current = Date.now() + 300
          setTimeout(() => { hasDraggedRef.current = false }, 300)
        }
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Store the time value when picker opens to scroll to correct position
  const timeOnOpenRef = useRef(contactInfo.preferredTime)
  
  // Update ref when picker opens
  useEffect(() => {
    if (showTimePicker) {
      timeOnOpenRef.current = contactInfo.preferredTime
    }
  }, [showTimePicker, contactInfo.preferredTime])

  // Scroll to selected time when picker opens
  useEffect(() => {
    if (showTimePicker && timeScrollRef.current) {
      isInitialScrollRef.current = true
      const selectedHour = parseInt(timeOnOpenRef.current.split(':')[0])
      // Convert to our hour system (1AM = 25, 0 = 24)
      const hourIndex = availableHours.findIndex(h => 
        h === selectedHour || (h === 25 && selectedHour === 1) || (h === 24 && selectedHour === 0)
      )
      if (hourIndex !== -1) {
        const itemHeight = 44 // Height of each time item
        const scrollPosition = hourIndex * itemHeight
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          timeScrollRef.current?.scrollTo({ top: scrollPosition, behavior: 'auto' })
          // Reset flag after scroll completes
          setTimeout(() => { isInitialScrollRef.current = false }, 100)
        })
      } else {
        setTimeout(() => { isInitialScrollRef.current = false }, 100)
      }
    }
  }, [showTimePicker, availableHours])

  // Handle scroll end to auto-select centered time
  const handleTimeScroll = useCallback(() => {
    // Skip if this is the initial programmatic scroll
    if (isInitialScrollRef.current) return
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (!timeScrollRef.current) return
      
      const scrollTop = timeScrollRef.current.scrollTop
      const itemHeight = 44
      const centeredIndex = Math.round(scrollTop / itemHeight)
      const clampedIndex = Math.max(0, Math.min(centeredIndex, availableHours.length - 1))
      const hour = availableHours[clampedIndex]
      
      // Convert to 24h format for storage
      const actualHour = hour === 25 ? 1 : hour === 24 ? 0 : hour
      const timeValue = `${actualHour.toString().padStart(2, '0')}:00`
      
      setContactInfo(prev => {
        if (prev.preferredTime !== timeValue) {
          return { ...prev, preferredTime: timeValue }
        }
        return prev
      })
      setErrors(prev => prev.preferredTime ? { ...prev, preferredTime: '' } : prev)
      
      // Smooth scroll to snap position
      const targetScroll = clampedIndex * itemHeight
      if (Math.abs(scrollTop - targetScroll) > 5) {
        timeScrollRef.current?.scrollTo({ top: targetScroll, behavior: 'smooth' })
      }
    }, 80) // Reduced debounce for snappier response
  }, [availableHours])

  // Format phone number as (000) 000-0000
  const formatPhoneNumber = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length === 0) return ''
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }, [])

  // Real-time field validation
  const validateField = useCallback((field: string, value: string) => {
    let error = ''
    
    switch (field) {
      case 'email':
        if (value.trim()) {
          const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
          if (!emailRegex.test(value)) {
            error = 'Please enter a valid email address'
          }
        }
        break
      case 'phone':
        if (value.trim()) {
          const digitsOnly = value.replace(/\D/g, '')
          if (digitsOnly.length > 0 && digitsOnly.length < 10) {
            error = 'Please enter a complete 10-digit phone number'
          }
        }
        break
      case 'referenceUrl':
        if (value.trim()) {
          try {
            const url = new URL(value)
            if (!['http:', 'https:'].includes(url.protocol)) {
              error = 'URL must start with http:// or https://'
            }
          } catch {
            error = 'Please enter a valid URL (e.g., https://example.com)'
          }
        }
        break
    }
    
    setErrors(prev => {
      if (error) {
        return { ...prev, [field]: error }
      } else {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      }
    })
  }, [])

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check both the trigger element ref AND the portal content ref for calendar
      const clickedInCalendarTrigger = calendarRef.current?.contains(event.target as Node)
      const clickedInCalendarPortal = calendarPortalRef.current?.contains(event.target as Node)
      if (showCalendar && !clickedInCalendarTrigger && !clickedInCalendarPortal) {
        setShowCalendar(false)
      }
      // Check both the trigger element ref AND the portal content ref for time picker
      const clickedInTimeTrigger = timePickerRef.current?.contains(event.target as Node)
      const clickedInTimePortal = timePickerPortalRef.current?.contains(event.target as Node)
      if (showTimePicker && !clickedInTimeTrigger && !clickedInTimePortal) {
        setShowTimePicker(false)
      }
      // Genre dropdown
      if (showGenreDropdown && !genreDropdownRef.current?.contains(event.target as Node)) {
        setShowGenreDropdown(false)
      }
    }

    if (showCalendar || showTimePicker || showGenreDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar, showTimePicker, showGenreDropdown])

  // Character limits
  const PROJECT_DESC_LIMIT = 500
  const ADDITIONAL_NOTES_LIMIT = 300

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Determine session mode
  const sessionMode: SessionMode = useMemo(() => {
    return includeEngineer || includeProducer ? 'recording' : 'rental'
  }, [includeEngineer, includeProducer])

  // Calculate number of after-hours (per-hour billing)
  const afterHoursCount = useMemo(() => {
    if (!contactInfo.preferredDate || !contactInfo.preferredTime) return 0
    
    const date = new Date(contactInfo.preferredDate)
    const dayOfWeek = date.getDay()
    const hours = BUSINESS_HOURS[dayOfWeek as keyof typeof BUSINESS_HOURS]
    
    if (!hours) return sessionHours // Fallback if day not configured
    
    const [startHour] = contactInfo.preferredTime.split(':').map(Number)
    const sessionEndHour = startHour + sessionHours
    
    let afterHours = 0
    
    // Count hours before opening (e.g., session starts at 9am but opens at 11am)
    if (startHour < hours.open) {
      afterHours += Math.min(hours.open - startHour, sessionHours)
    }
    
    // Count hours after closing (e.g., session ends at 11pm but closes at 10pm)
    if (sessionEndHour > hours.close) {
      const hoursAfterClose = sessionEndHour - hours.close
      // Don't double count if session is entirely outside hours
      afterHours += Math.min(hoursAfterClose, sessionHours - afterHours)
    }
    
    return Math.min(afterHours, sessionHours) // Can't exceed total session hours
  }, [contactInfo.preferredDate, contactInfo.preferredTime, sessionHours])

  // Boolean for UI display
  const isAfterHours = afterHoursCount > 0

  // Check if any post-production is selected (for showing rush options)
  const hasPostProduction = includeMixing || includeMastering || includeMixMasterBundle

  // Check if stems export should be free (only with bundle now)
  const isStemsExportFree = includeMixMasterBundle

  // Show confirmation when user tries to select 1 hour (recording requires min 2 hours)
  useEffect(() => {
    if (sessionHours === 1 && includeEngineer && !pendingOneHourRef.current) {
      // User had engineer enabled and dragged to 1 hour - show confirmation
      pendingOneHourRef.current = true
      setShowRentalConfirm(true)
      // Temporarily revert to 2 hours until user confirms
      setSessionHours(2)
    }
  }, [sessionHours, includeEngineer])

  // Handle rental confirmation
  const handleConfirmRental = () => {
    pendingOneHourRef.current = false
    setShowRentalConfirm(false)
    setSessionHours(1)
    setIncludeEngineer(false)
    setIncludeProducer(false)
  }

  const handleCancelRental = () => {
    pendingOneHourRef.current = false
    setShowRentalConfirm(false)
    // Explicitly set to 2 hours (minimum for recording sessions)
    setSessionHours(2)
  }

  // Constrain producerHours when sessionHours changes
  useEffect(() => {
    if (producerHours > sessionHours) {
      setProducerHours(sessionHours)
    }
    // Also ensure minimum of 2 hours
    if (sessionHours >= 2 && producerHours < 2) {
      setProducerHours(2)
    }
  }, [sessionHours, producerHours])

  // Reset post-production and deliverables when switching to rental mode
  useEffect(() => {
    if (sessionMode === 'rental') {
      setIncludeMixing(false)
      setIncludeMastering(false)
      setIncludeMixMasterBundle(false)
      setIncludeVocalTuning(false)
      setIncludeVocalEditing(false)
      setAltVersions(false)
      setStemsExport(false)
      setMultitrackExport(false)
      setUsbMedia(false)
    }
  }, [sessionMode])

  // Auto-select vocal tuning when mixing or bundle is selected (it's included free)
  useEffect(() => {
    if (includeMixing || includeMixMasterBundle) {
      setIncludeVocalTuning(true)
    }
  }, [includeMixing, includeMixMasterBundle])

  // Auto-select vocal editing when bundle is selected (it's included free)
  useEffect(() => {
    if (includeMixMasterBundle) {
      setIncludeVocalEditing(true)
    }
  }, [includeMixMasterBundle])

  // Auto-select stems export when bundle is selected (it's included free)
  useEffect(() => {
    if (includeMixMasterBundle) {
      setStemsExport(true)
    }
  }, [includeMixMasterBundle])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(0)
        setSubmitSuccess(false)
        setSubmitError('')
        setErrors({})
      }, 300)
    }
  }, [isOpen])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  // Calculate totals (simplified for single song booking)
  const totals = useMemo(() => {
    let session = PRICES.studioWorkspace * sessionHours
    if (includeEngineer) session += PRICES.recordingEngineer * sessionHours
    if (includeProducer) session += PRICES.producer * producerHours
    if (afterHoursCount > 0) session += PRICES.afterHoursPremium * afterHoursCount

    let post = 0
    if (includeMixing) post += PRICES.mixing
    if (includeMastering) post += PRICES.mastering
    if (includeMixMasterBundle) post += PRICES.mixMasterBundle
    
    // Vocal tuning: free if mixing or bundle is selected
    // Vocal editing: only free with bundle (not mixing)
    const vocalTuningFree = includeMixing || includeMixMasterBundle
    const vocalEditingFree = includeMixMasterBundle
    if (includeVocalTuning && !vocalTuningFree) post += PRICES.vocalTuning
    if (includeVocalEditing && !vocalEditingFree) post += PRICES.vocalEditing

    let deliverables = 0
    if (altVersions) deliverables += PRICES.altVersions
    if (stemsExport && !isStemsExportFree) deliverables += PRICES.stemsExport
    if (multitrackExport) deliverables += PRICES.multitrackExport
    if (usbMedia) deliverables += PRICES.usbMedia

    let rush = 0
    if (rushOption === 'rush24') rush = PRICES.rush24
    if (rushOption === 'rush48') rush = PRICES.rush48

    return {
      session,
      post,
      deliverables,
      rush,
      grand: session + post + deliverables + rush
    }
  }, [sessionHours, includeEngineer, includeProducer, producerHours, afterHoursCount, includeMixing, includeMastering, includeMixMasterBundle, includeVocalTuning, includeVocalEditing, altVersions, stemsExport, isStemsExportFree, multitrackExport, usbMedia, rushOption])

  // Bundle savings calculation (single song)
  const bundleSavings = useMemo(() => {
    if (!includeMixMasterBundle) return 0
    // Bundle ($100) vs Individual: Mixing ($55) + Mastering ($25) + Vocal Editing ($50) + Stems ($25) + 2 extra revisions ($10) = $165
    const individualCost = PRICES.mixing + PRICES.mastering + PRICES.vocalEditing + PRICES.stemsExport + 10
    return individualCost - PRICES.mixMasterBundle
  }, [includeMixMasterBundle])

  // Total savings for display
  const totalSavings = bundleSavings

  // Sanitize text input to prevent XSS and injection attacks
  // Note: Do NOT trim() here - it prevents typing spaces. Trim on submission instead.
  const sanitizeText = useCallback((text: string): string => {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>"'&]/g, '') // Remove dangerous characters
  }, [])

  // Validate contact form
  const validateContact = useCallback(() => {
    const newErrors: Record<string, string> = {}
    
    // Name validation
    if (!contactInfo.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (contactInfo.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (contactInfo.name.trim().length > 100) {
      newErrors.name = 'Name is too long'
    }
    
    // Email validation - comprehensive regex
    if (!contactInfo.email.trim()) {
      newErrors.email = 'Email is required'
    } else {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      if (!emailRegex.test(contactInfo.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }
    
    // Phone validation - North American format with flexibility
    if (!contactInfo.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else {
      const digitsOnly = contactInfo.phone.replace(/\D/g, '')
      if (digitsOnly.length < 10) {
        newErrors.phone = 'Phone number must have at least 10 digits'
      } else if (digitsOnly.length > 15) {
        newErrors.phone = 'Phone number is too long'
      } else if (!/^[\d\s\-\+\(\)\.]+$/.test(contactInfo.phone)) {
        newErrors.phone = 'Phone contains invalid characters'
      }
    }
    
    // Date validation
    if (!contactInfo.preferredDate) {
      newErrors.preferredDate = 'Please select a date'
    } else {
      const selectedDate = new Date(contactInfo.preferredDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const minBookingDate = new Date(today)
      minBookingDate.setDate(minBookingDate.getDate() + 2)
      if (selectedDate < minBookingDate) {
        newErrors.preferredDate = 'Bookings require at least 2 days advance notice'
      }
    }
    
    // Time validation
    if (!contactInfo.preferredTime) {
      newErrors.preferredTime = 'Please select a time'
    }

    // Reference URL validation (optional but must be valid if provided)
    if (contactInfo.referenceUrl.trim()) {
      try {
        const url = new URL(contactInfo.referenceUrl)
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.referenceUrl = 'URL must start with http:// or https://'
        }
      } catch {
        newErrors.referenceUrl = 'Please enter a valid URL'
      }
    }

    // Character limit validation
    if (contactInfo.projectDescription.length > PROJECT_DESC_LIMIT) {
      newErrors.projectDescription = `Maximum ${PROJECT_DESC_LIMIT} characters allowed`
    }
    if (contactInfo.additionalNotes.length > ADDITIONAL_NOTES_LIMIT) {
      newErrors.additionalNotes = `Maximum ${ADDITIONAL_NOTES_LIMIT} characters allowed`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [contactInfo, PROJECT_DESC_LIMIT, ADDITIONAL_NOTES_LIMIT])

  // Proper validation check - not just presence but actual validity
  const isContactValid = useMemo(() => {
    // Name: at least 2 characters
    if (!contactInfo.name || contactInfo.name.trim().length < 2) return false
    // Email: valid format
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!contactInfo.email || !emailRegex.test(contactInfo.email)) return false
    // Phone: at least 10 digits
    const phoneDigits = (contactInfo.phone || '').replace(/\D/g, '')
    if (phoneDigits.length < 10) return false
    // Date and time required
    if (!contactInfo.preferredDate || !contactInfo.preferredTime) return false
    return true
  }, [contactInfo])

  // Proper validation check for Project Inquiry form
  const isProjectInquiryValid = useMemo(() => {
    // Artist name: at least 2 characters
    if (!projectInquiry.artistName || projectInquiry.artistName.trim().length < 2) return false
    // Email: valid format
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!projectInquiry.email || !emailRegex.test(projectInquiry.email)) return false
    // Phone: at least 10 digits
    const phoneDigits = (projectInquiry.phone || '').replace(/\D/g, '')
    if (phoneDigits.length < 10) return false
    // Project type required
    if (!projectInquiry.projectType) return false
    return true
  }, [projectInquiry])

  const handleSubmit = async () => {
    if (!validateContact()) return
    
    setIsSubmitting(true)
    setSubmitError('')

    const bookingData = {
      contact: contactInfo,
      bookingPath,
      sessionMode,
      // Security fields
      honeypot,
      formLoadTime,
      session: {
        hours: sessionHours,
        includeEngineer,
        includeProducer,
        producerHours: includeProducer ? producerHours : 0,
        isAfterHours: afterHoursCount > 0,
        afterHoursCount,
        total: totals.session
      },
      postProduction: sessionMode === 'recording' ? {
        mixing: { qty: includeMixing ? 1 : 0, price: PRICES.mixing, revisionsIncluded: 2, includesVocalTuning: true, includesVocalEditing: false },
        mastering: { qty: includeMastering ? 1 : 0, price: PRICES.mastering },
        mixMasterBundle: { qty: includeMixMasterBundle ? 1 : 0, price: PRICES.mixMasterBundle, revisionsIncluded: 5, includesVocalTuning: true, includesVocalEditing: true },
        vocalTuning: { qty: includeVocalTuning ? 1 : 0, price: PRICES.vocalTuning, freeQty: (includeMixing || includeMixMasterBundle) ? 1 : 0 },
        vocalEditing: { qty: includeVocalEditing ? 1 : 0, price: PRICES.vocalEditing, freeQty: includeMixMasterBundle ? 1 : 0 },
        total: totals.post
      } : null,
      deliverables: {
        altVersions: altVersions ? PRICES.altVersions : 0,
        stemsExport: stemsExport ? (isStemsExportFree ? 0 : PRICES.stemsExport) : 0,
        stemsExportFree: stemsExport && isStemsExportFree,
        multitrackExport: multitrackExport ? PRICES.multitrackExport : 0,
        usbMedia: usbMedia ? PRICES.usbMedia : 0,
        total: totals.deliverables
      },
      rush: rushOption !== 'none' ? {
        option: rushOption,
        price: rushOption === 'rush24' ? PRICES.rush24 : PRICES.rush48
      } : null,
      totals,
      bundleSavings
    }

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit booking request')
      }

      setSubmitSuccess(true)
      setStep(4)
      // Clear sessionStorage after successful submission so next booking starts fresh
      sessionStorage.removeItem('bookingState')
    } catch (error) {
      setSubmitError('Something went wrong. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validate project inquiry form
  const validateProjectInquiry = useCallback(() => {
    const newErrors: Record<string, string> = {}
    
    if (!projectInquiry.artistName.trim()) {
      newErrors.inquiryArtistName = 'Artist/project name is required'
    } else if (projectInquiry.artistName.trim().length < 2) {
      newErrors.inquiryArtistName = 'Name must be at least 2 characters'
    }
    
    if (!projectInquiry.email.trim()) {
      newErrors.inquiryEmail = 'Email is required'
    } else {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      if (!emailRegex.test(projectInquiry.email)) {
        newErrors.inquiryEmail = 'Please enter a valid email address'
      }
    }
    
    if (!projectInquiry.phone.trim()) {
      newErrors.inquiryPhone = 'Phone is required'
    } else {
      const digitsOnly = projectInquiry.phone.replace(/\D/g, '')
      if (digitsOnly.length < 10) {
        newErrors.inquiryPhone = 'Phone must have at least 10 digits'
      }
    }
    
    if (!projectInquiry.projectType) {
      newErrors.inquiryProjectType = 'Please select a project type'
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }, [projectInquiry])

  // Handle project inquiry submission (full-project path)
  const handleProjectInquirySubmit = async () => {
    if (!validateProjectInquiry()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    const inquiryData = {
      type: 'project-inquiry',
      bookingPath: 'full-project',
      // Security fields
      honeypot,
      formLoadTime,
      contact: {
        artistName: projectInquiry.artistName,
        email: projectInquiry.email,
        phone: projectInquiry.phone
      },
      project: {
        type: projectInquiry.projectType,
        genres: projectInquiry.genres,
        hasBeats: projectInquiry.hasBeats,
        referenceArtists: projectInquiry.referenceArtists,
        vision: projectInquiry.projectVision
      },
      timeline: projectInquiry.timeline,
      budget: projectInquiry.budget
    }

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit project inquiry')
      }

      setSubmitSuccess(true)
      setStep(4)
      sessionStorage.removeItem('bookingState')
    } catch (error) {
      setSubmitError('Something went wrong. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render modal to document.body via portal to escape all stacking contexts
  if (!portalContainer) return null
  
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - subtle, allows seeing site behind */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-[9998]"
          />
          
          {/* Modal - frosted glass effect with floating feel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-6 md:inset-10 lg:inset-y-10 lg:inset-x-[15%] xl:inset-x-[20%] bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl z-[9999] flex flex-col max-h-[calc(100vh-32px)] sm:max-h-[calc(100vh-48px)] shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/5 shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-display text-white uppercase tracking-wide">
                    {step === 0 ? 'Book Your Session' : bookingPath === 'full-project' ? 'Project Inquiry' : 'Configure Your Session'}
                  </h2>
                  <p className="text-white/50 text-xs sm:text-sm mt-0.5">
                    {step === 0 ? 'How can we help you today?' : bookingPath === 'full-project' ? 'Let\'s bring your vision to life' : sessionMode === 'rental' ? 'Studio Rental' : 'Recording Session'}
                  </p>
                </div>
                {/* Session Type Badge - Only show on config steps for record-only path */}
                {step > 0 && bookingPath === 'record-only' && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={sessionMode}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={`flex items-center px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                        sessionMode === 'rental'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {sessionMode === 'rental' ? 'Rental' : 'Recording'}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Progress Steps - Only show for record-only path after path selection */}
            {step > 0 && bookingPath !== 'full-project' && (
              <div className="flex items-center justify-center gap-2 py-4 border-b border-white/10 shrink-0">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center">
                    <button
                      onClick={() => {
                        if (s < step) {
                          setStep(s)
                          contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      }}
                      disabled={s > step}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                        step >= s 
                          ? 'bg-white text-black' 
                          : 'bg-white/10 text-white/40'
                      } ${s < step ? 'cursor-pointer hover:bg-white/80' : ''}`}
                    >
                      {step > s ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : s}
                    </button>
                    {s < 2 && (
                      <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${step > s ? 'bg-white' : 'bg-white/10'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            <div 
              ref={contentScrollRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6"
              onScroll={() => {
                setShowCalendar(false)
                setShowTimePicker(false)
              }}
            >
              <AnimatePresence mode="wait">
                {/* Step 0: Booking Path Selection */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    {/* Header */}
                    <div className="text-center">
                      <h3 className="text-2xl font-display text-white mb-1">Let's Get Started</h3>
                      <p className="text-white/50 text-sm">Choose the option that fits your needs</p>
                    </div>

                    {/* Main Options - Grid on desktop, stack on mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Option 1: Book a Session */}
                      <button
                        onClick={() => {
                          setBookingPath('record-only')
                          setStep(1)
                        }}
                        className="p-4 sm:p-5 bg-white rounded-2xl transition-all duration-300 text-left group hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 sm:p-3 bg-black/10 rounded-xl shrink-0">
                            <Mic2 className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="text-base sm:text-lg font-semibold text-black">Book a Session</h4>
                              <ChevronRight className="w-5 h-5 text-black/40 group-hover:translate-x-1 transition-transform shrink-0" />
                            </div>
                            <span className="inline-block text-[10px] bg-black/10 text-black/70 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide mb-2">Most Popular</span>
                            <p className="text-black/60 text-xs sm:text-sm">
                              Recording, mixing, mastering with à la carte pricing
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Option 2: Project Inquiry */}
                      <button
                        onClick={() => {
                          setBookingPath('full-project')
                          setStep(1)
                        }}
                        className="p-4 sm:p-5 bg-white/[0.08] rounded-2xl border border-white/15 hover:bg-white/[0.12] hover:border-white/25 transition-all duration-300 text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 sm:p-3 bg-white/15 rounded-xl shrink-0">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="text-base sm:text-lg font-semibold text-white">Project Inquiry</h4>
                              <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform shrink-0" />
                            </div>
                            <span className="inline-block text-[10px] bg-white/15 text-white/70 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide mb-2">Custom Quote</span>
                            <p className="text-white/50 text-xs sm:text-sm">
                              Albums, EPs, brand collabs, ads & more
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Studio Rental Option */}
                    <button
                      onClick={() => {
                        setBookingPath('record-only')
                        setSessionHours(1)
                        setIncludeEngineer(false)
                        setIncludeProducer(false)
                        setStep(1)
                      }}
                      className="w-full p-3 sm:p-4 bg-white/[0.04] rounded-xl border border-white/10 hover:bg-white/[0.08] transition-all duration-300 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg shrink-0">
                          <Building2 className="w-4 h-4 text-white/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-white/80 text-sm font-medium">Studio Rental Only</span>
                          <p className="text-white/40 text-xs">Bring your own engineer • From CA$35/hr</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                    </button>

                    {/* Quick Info Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                      <div className="p-3 bg-white/[0.04] rounded-xl text-center">
                        <Clock className="w-4 h-4 text-white/40 mx-auto mb-1" />
                        <p className="text-white/70 text-xs font-medium">Open Daily</p>
                        <p className="text-white/40 text-[10px]">11am – 10pm</p>
                      </div>
                      <div className="p-3 bg-white/[0.04] rounded-xl text-center">
                        <Sliders className="w-4 h-4 text-white/40 mx-auto mb-1" />
                        <p className="text-white/70 text-xs font-medium">Studio Rate</p>
                        <p className="text-white/40 text-[10px]">From CA${PRICES.studioWorkspace}/hr</p>
                      </div>
                      <div className="p-3 bg-white/[0.04] rounded-xl text-center">
                        <Mic2 className="w-4 h-4 text-white/40 mx-auto mb-1" />
                        <p className="text-white/70 text-xs font-medium">Engineer</p>
                        <p className="text-white/40 text-[10px]">+CA${PRICES.recordingEngineer}/hr</p>
                      </div>
                      <div className="p-3 bg-white/[0.04] rounded-xl text-center">
                        <Music className="w-4 h-4 text-white/40 mx-auto mb-1" />
                        <p className="text-white/70 text-xs font-medium">Mix + Master</p>
                        <p className="text-white/40 text-[10px]">CA${PRICES.mixMasterBundle} bundle</p>
                      </div>
                    </div>

                    {/* Help Text */}
                    <p className="text-white/30 text-xs text-center">
                      Not sure which to pick? <span className="text-white/50">Book a Session</span> works for most artists.
                    </p>
                  </motion.div>
                )}

                {/* Step 1: Full Project Inquiry Form (high-ticket clients) */}
                {step === 1 && bookingPath === 'full-project' && (
                  <motion.div
                    key="step1-project"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Header */}
                    <div className="text-center mb-2">
                      <h3 className="text-xl font-display text-white mb-2">Tell Us About Your Project</h3>
                      <p className="text-white/50 text-sm">We'll create a custom quote tailored to your vision</p>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white/[0.08] rounded-xl p-4 border border-white/15">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/30 rounded-lg">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-white font-medium">Your Info</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-white/60 text-xs mb-1.5">Artist / Project Name *</label>
                          <input
                            type="text"
                            value={projectInquiry.artistName}
                            onChange={(e) => {
                              setProjectInquiry(prev => ({ ...prev, artistName: e.target.value }))
                              if (errors.inquiryArtistName) setErrors(prev => ({ ...prev, inquiryArtistName: '' }))
                            }}
                            onBlur={() => {
                              if (!projectInquiry.artistName.trim()) {
                                setErrors(prev => ({ ...prev, inquiryArtistName: 'Artist/project name is required' }))
                              } else if (projectInquiry.artistName.trim().length < 2) {
                                setErrors(prev => ({ ...prev, inquiryArtistName: 'Name must be at least 2 characters' }))
                              }
                            }}
                            placeholder="Your artist name or project title"
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors ${errors.inquiryArtistName ? 'border-red-500 bg-red-500/5' : 'border-white/10'}`}
                          />
                          {errors.inquiryArtistName && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.inquiryArtistName}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-white/60 text-xs mb-1.5">Email *</label>
                            <input
                              type="email"
                              value={projectInquiry.email}
                              onChange={(e) => {
                                setProjectInquiry(prev => ({ ...prev, email: e.target.value.toLowerCase() }))
                                if (errors.inquiryEmail) setErrors(prev => ({ ...prev, inquiryEmail: '' }))
                              }}
                              onBlur={() => {
                                if (!projectInquiry.email.trim()) {
                                  setErrors(prev => ({ ...prev, inquiryEmail: 'Email is required' }))
                                } else {
                                  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
                                  if (!emailRegex.test(projectInquiry.email)) {
                                    setErrors(prev => ({ ...prev, inquiryEmail: 'Please enter a valid email address' }))
                                  }
                                }
                              }}
                              placeholder="you@example.com"
                              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors ${errors.inquiryEmail ? 'border-red-500 bg-red-500/5' : 'border-white/10'}`}
                            />
                            {errors.inquiryEmail && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.inquiryEmail}</p>}
                          </div>
                          <div>
                            <label className="block text-white/60 text-xs mb-1.5">Phone *</label>
                            <input
                              type="tel"
                              value={projectInquiry.phone}
                              onChange={(e) => {
                                setProjectInquiry(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }))
                                if (errors.inquiryPhone) setErrors(prev => ({ ...prev, inquiryPhone: '' }))
                              }}
                              onBlur={() => {
                                if (!projectInquiry.phone.trim()) {
                                  setErrors(prev => ({ ...prev, inquiryPhone: 'Phone is required' }))
                                } else {
                                  const digitsOnly = projectInquiry.phone.replace(/\D/g, '')
                                  if (digitsOnly.length < 10) {
                                    setErrors(prev => ({ ...prev, inquiryPhone: 'Phone must have at least 10 digits' }))
                                  }
                                }
                              }}
                              placeholder="(514) 123-4567"
                              maxLength={14}
                              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors ${errors.inquiryPhone ? 'border-red-500 bg-red-500/5' : 'border-white/10'}`}
                            />
                            {errors.inquiryPhone && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.inquiryPhone}</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Project Type */}
                    <div className="bg-white/[0.08] rounded-xl p-4 border border-white/15">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/30 rounded-lg">
                          <Music className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-white font-medium">Project Details</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-white/60 text-xs mb-1.5">What are you creating? *</label>
                            <select
                              value={projectInquiry.projectType}
                              onChange={(e) => {
                                setProjectInquiry(prev => ({ ...prev, projectType: e.target.value as typeof prev.projectType }))
                                if (errors.inquiryProjectType) setErrors(prev => ({ ...prev, inquiryProjectType: '' }))
                              }}
                              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50 transition-colors appearance-none cursor-pointer ${errors.inquiryProjectType ? 'border-red-500 bg-red-500/5' : 'border-white/10'}`}
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                            >
                              <option value="" className="bg-zinc-900">Select project type...</option>
                              <option value="single" className="bg-zinc-900">Single</option>
                              <option value="ep" className="bg-zinc-900">EP (2-5 songs)</option>
                              <option value="album" className="bg-zinc-900">Album (6+ songs)</option>
                              <option value="other" className="bg-zinc-900">Other</option>
                            </select>
                            {errors.inquiryProjectType && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.inquiryProjectType}</p>}
                          </div>
                          <div>
                            <label className="block text-white/60 text-xs mb-1.5">Do you have beats?</label>
                            <select
                              value={projectInquiry.hasBeats}
                              onChange={(e) => setProjectInquiry(prev => ({ ...prev, hasBeats: e.target.value as typeof prev.hasBeats }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50 transition-colors appearance-none cursor-pointer"
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                            >
                              <option value="" className="bg-zinc-900">Select...</option>
                              <option value="yes" className="bg-zinc-900">Yes, I have beats</option>
                              <option value="no" className="bg-zinc-900">No, I need beats</option>
                              <option value="need-production" className="bg-zinc-900">Need full production</option>
                            </select>
                          </div>
                        </div>

                        <div ref={genreDropdownRef} className="relative">
                          <label className="block text-white/60 text-xs mb-1.5">Genre / Style</label>
                          <button
                            type="button"
                            onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-left transition-colors hover:border-white/30 focus:outline-none focus:border-white/50 min-h-[48px]"
                          >
                            {projectInquiry.genres.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {projectInquiry.genres.map(genre => (
                                  <span 
                                    key={genre}
                                    className="inline-flex items-center gap-1 bg-white/20 text-white px-2.5 py-1 rounded-full text-xs font-medium"
                                  >
                                    {genre}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setProjectInquiry(prev => ({ ...prev, genres: prev.genres.filter(g => g !== genre) }))
                                      }}
                                      className="hover:text-red-300 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-white/30">Select genres...</span>
                            )}
                          </button>
                          
                          {showGenreDropdown && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/20 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                              {GENRE_OPTIONS.map(genre => (
                                <button
                                  key={genre}
                                  type="button"
                                  onClick={() => {
                                    setProjectInquiry(prev => ({
                                      ...prev,
                                      genres: prev.genres.includes(genre)
                                        ? prev.genres.filter(g => g !== genre)
                                        : [...prev.genres, genre]
                                    }))
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                                    projectInquiry.genres.includes(genre)
                                      ? 'bg-white/15 text-white'
                                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  {genre}
                                  {projectInquiry.genres.includes(genre) && <Check className="w-4 h-4 text-green-400" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Timeline & Budget */}
                    <div className="bg-white/[0.08] rounded-xl p-4 border border-white/15">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/30 rounded-lg">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-white font-medium">Timeline & Budget</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-white/60 text-xs mb-1.5">When do you want to start?</label>
                            <select
                              value={projectInquiry.timeline}
                              onChange={(e) => setProjectInquiry(prev => ({ ...prev, timeline: e.target.value as typeof prev.timeline }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50 transition-colors appearance-none cursor-pointer"
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                            >
                              <option value="" className="bg-zinc-900">Select timeline...</option>
                              <option value="asap" className="bg-zinc-900">ASAP</option>
                              <option value="1month" className="bg-zinc-900">Within 1 month</option>
                              <option value="2-3months" className="bg-zinc-900">2-3 months</option>
                              <option value="flexible" className="bg-zinc-900">Flexible</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-white/60 text-xs mb-1.5">Budget range</label>
                            <select
                              value={projectInquiry.budget}
                              onChange={(e) => setProjectInquiry(prev => ({ ...prev, budget: e.target.value as typeof prev.budget }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50 transition-colors appearance-none cursor-pointer"
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                            >
                              <option value="" className="bg-zinc-900">Select budget...</option>
                              <option value="under1k" className="bg-zinc-900">Under $1,000</option>
                              <option value="1k-3k" className="bg-zinc-900">$1,000 - $3,000</option>
                              <option value="3k-5k" className="bg-zinc-900">$3,000 - $5,000</option>
                              <option value="5k-10k" className="bg-zinc-900">$5,000 - $10,000</option>
                              <option value="10k+" className="bg-zinc-900">$10,000+</option>
                            </select>
                            <p className="text-white/30 text-xs mt-1.5">Helps us tailor our proposal</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {submitError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {submitError}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 1: Session Configuration (record-only path) */}
                {step === 1 && bookingPath !== 'full-project' && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Session Hours */}
                    <div className="bg-white/[0.08] rounded-xl p-5 border border-white/15">
                      {/* Header with price */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/30 rounded-lg">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-white font-medium">Session Duration</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold text-lg">CA${sessionHours * PRICES.studioWorkspace}</span>
                          <span className="text-white/40 text-xs block">@ CA${PRICES.studioWorkspace}/hr</span>
                        </div>
                      </div>
                      
                      {/* Large Hours Display */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-baseline gap-2">
                          <span className="text-6xl sm:text-7xl font-bold text-white tabular-nums leading-none">{sessionHours}</span>
                          <span className="text-white/50 text-2xl font-medium">hour{sessionHours !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      {/* Swipeable Slider */}
                      <div 
                        className="relative select-none touch-pan-x"
                        onTouchStart={(e) => e.currentTarget.dataset.dragging = 'true'}
                        onTouchEnd={(e) => e.currentTarget.dataset.dragging = 'false'}
                        onTouchMove={(e) => {
                          const touch = e.touches[0]
                          const container = e.currentTarget.getBoundingClientRect()
                          const padding = 8
                          const x = touch.clientX - container.left - padding
                          const trackWidth = container.width - (padding * 2)
                          const percent = Math.max(0, Math.min(1, x / trackWidth))
                          const hours = [1, 2, 3, 4, 5, 6, 8, 10, 12]
                          const index = Math.round(percent * (hours.length - 1))
                          setSessionHours(hours[index])
                        }}
                        onMouseDown={(e) => e.currentTarget.dataset.dragging = 'true'}
                        onMouseUp={(e) => e.currentTarget.dataset.dragging = 'false'}
                        onMouseLeave={(e) => e.currentTarget.dataset.dragging = 'false'}
                        onMouseMove={(e) => {
                          if (e.buttons !== 1) return
                          const container = e.currentTarget.getBoundingClientRect()
                          const padding = 8
                          const x = e.clientX - container.left - padding
                          const trackWidth = container.width - (padding * 2)
                          const percent = Math.max(0, Math.min(1, x / trackWidth))
                          const hours = [1, 2, 3, 4, 5, 6, 8, 10, 12]
                          const index = Math.round(percent * (hours.length - 1))
                          setSessionHours(hours[index])
                        }}
                      >
                        {/* Track */}
                        <div className="relative h-12 flex items-center">
                          <div className="absolute inset-x-0 h-4 bg-white/10 rounded-full" />
                          <div 
                            className="absolute left-0 h-4 bg-white rounded-full transition-all duration-100 ease-out"
                            style={{ width: `calc(${([1, 2, 3, 4, 5, 6, 8, 10, 12].indexOf(sessionHours) / 8) * 100}%)` }}
                          />
                          {/* Thumb */}
                          <div 
                            className="absolute pointer-events-none z-10 transition-all duration-100 ease-out"
                            style={{ left: `calc(${([1, 2, 3, 4, 5, 6, 8, 10, 12].indexOf(sessionHours) / 8) * 100}%)` }}
                          >
                            <div className="w-10 h-10 -ml-5 bg-white rounded-full shadow-lg shadow-white/30 flex items-center justify-center">
                              <div className="w-3 h-3 bg-black/20 rounded-full" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Hour Buttons */}
                        <div className="flex justify-between mt-2">
                          {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hour) => (
                            <button
                              key={hour}
                              type="button"
                              onClick={() => setSessionHours(hour)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center touch-manipulation transition-all ${
                                hour === 1
                                  ? sessionHours === 1
                                    ? 'bg-amber-500/30 text-amber-400 font-bold ring-2 ring-amber-500/50'
                                    : 'text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10'
                                  : sessionHours === hour 
                                    ? 'bg-white/20 text-white font-bold' 
                                    : 'text-white/50 hover:text-white/80'
                              }`}
                            >
                              <span className="text-sm sm:text-base">{hour}</span>
                            </button>
                          ))}
                        </div>
                        
                        {/* Session Type Labels */}
                        <div className="flex justify-center mt-3">
                          <span className="text-[10px] sm:text-xs text-white/40">Recording sessions require 2+ hours</span>
                        </div>
                      </div>
                    </div>

                    {/* Session Services */}
                    <div className="bg-white/[0.08] rounded-xl p-4 border border-white/15">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/30 rounded-lg">
                          <Mic2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Session Type</h3>
                          <p className="text-white/60 text-xs">Choose your studio experience</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Engineer Toggle */}
                        <div className={`p-4 rounded-xl transition-all duration-200 ${
                          includeEngineer 
                            ? 'bg-white/15 border-2 border-white/60' 
                            : 'bg-white/[0.06] border-2 border-white/10'
                        }`}>
                          <button
                            type="button"
                            onClick={() => {
                              setIncludeEngineer(!includeEngineer)
                              if (includeEngineer && includeProducer) {
                                setIncludeProducer(false)
                              }
                            }}
                            className="flex items-center justify-between w-full text-left"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                includeEngineer ? 'bg-white border-white' : 'border-white/30'
                              }`}>
                                {includeEngineer && <Check className="w-3 h-3 text-black" />}
                              </div>
                              <div>
                                <span className="text-white font-medium block">Recording Engineer</span>
                                <p className="text-white/50 text-xs mt-0.5">Professional engineer for your session</p>
                              </div>
                            </div>
                            <span className="text-white font-bold text-sm shrink-0">+${PRICES.recordingEngineer}/hr</span>
                          </button>
                          
                          {/* Engineer Hours Display - Only show when engineer is enabled */}
                          {includeEngineer && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <div className="flex items-center justify-between">
                                <span className="text-white/60 text-xs">Engineer hours</span>
                                <span className="text-white font-bold">{sessionHours}</span>
                              </div>
                              <p className="text-white/40 text-xs mt-1">CA${sessionHours * PRICES.recordingEngineer} total</p>
                            </div>
                          )}
                        </div>

                        {/* Producer Toggle */}
                        <div className={`p-4 rounded-xl transition-all duration-200 ${
                          !includeEngineer
                            ? 'bg-white/[0.03] border-2 border-white/5 opacity-50'
                            : includeProducer 
                              ? 'bg-white/15 border-2 border-white/60' 
                              : 'bg-white/[0.06] border-2 border-white/10'
                        }`}>
                          <button
                            type="button"
                            disabled={!includeEngineer}
                            onClick={() => {
                              if (includeEngineer) {
                                setIncludeProducer(!includeProducer)
                                if (!includeProducer) {
                                  // When enabling, set to session hours by default
                                  setProducerHours(Math.max(2, sessionHours))
                                }
                              }
                            }}
                            className="flex items-center justify-between w-full text-left"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                includeProducer ? 'bg-white border-white' : 'border-white/20'
                              }`}>
                                {includeProducer && <Check className="w-3 h-3 text-black" />}
                              </div>
                              <div className="min-w-0">
                                <span className={`font-medium block ${includeEngineer ? 'text-white' : 'text-white/40'}`}>Session Producer</span>
                                <p className={`text-xs mt-0.5 ${includeEngineer ? 'text-white/50' : 'text-white/30'}`}>
                                  {includeEngineer ? 'Dedicated producer alongside your engineer' : 'Requires Recording Engineer'}
                                </p>
                              </div>
                            </div>
                            <span className={`font-bold text-sm shrink-0 ml-2 ${includeEngineer ? 'text-white' : 'text-white/30'}`}>+${PRICES.producer}/hr</span>
                          </button>
                          
                          {/* Producer Hours Selector - Show when producer is enabled, placeholder otherwise */}
                          {includeEngineer && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              {includeProducer && sessionHours >= 2 ? (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-white/60 text-xs">Producer hours (min 2)</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setProducerHours(Math.max(2, producerHours - 1))}
                                        disabled={producerHours <= 2}
                                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                      >
                                        <Minus className="w-3 h-3 text-white" />
                                      </button>
                                      <span className="w-8 text-center text-white font-bold">{producerHours}</span>
                                      <button
                                        type="button"
                                        onClick={() => setProducerHours(Math.min(sessionHours, producerHours + 1))}
                                        disabled={producerHours >= sessionHours}
                                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                      >
                                        <Plus className="w-3 h-3 text-white" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-white/40 text-xs mt-1">CA${producerHours * PRICES.producer} total</p>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-white/40 text-xs">Producer hours</span>
                                    <span className="text-white/30 font-bold">—</span>
                                  </div>
                                  <p className="text-white/30 text-xs mt-1">Add for beat production in studio</p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rental Mode Notice - Enhanced */}
                      {sessionMode === 'rental' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-amber-500/10 border border-amber-500/40 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-500/15 rounded border border-amber-500/30 shrink-0">
                              <Building2 className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-amber-400 text-sm font-semibold">Studio Rental Mode</p>
                                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-medium">NO ENGINEER</span>
                              </div>
                              <p className="text-white/60 text-xs leading-relaxed">
                                You're booking the studio space only. Bring your own engineer or work independently. Post-production services are not available in rental mode.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  // Keep current duration if already >= 2, otherwise set to 2
                                  if (sessionHours < 2) setSessionHours(2)
                                  setIncludeEngineer(true)
                                }}
                                className="mt-3 text-xs text-white font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
                              >
                                <Mic2 className="w-3.5 h-3.5" />
                                Switch to Recording Session
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </div>

                    {/* Post-Production - Only show in recording mode */}
                    {sessionMode === 'recording' && (
                      <div className="bg-white/[0.08] rounded-xl p-4 border border-white/15">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/30 rounded-lg">
                              <Sliders className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-white font-medium">Post-Production</h3>
                          </div>
                        </div>

                        {/* Quick Selection: Bundle vs À La Carte */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <button
                            type="button"
                            onClick={() => {
                              setIncludeMixMasterBundle(true)
                              // Clear à la carte selections when switching to bundle
                              setIncludeMixing(false)
                              setIncludeMastering(false)
                            }}
                            className={`p-3 rounded-xl text-center transition-all ${
                              includeMixMasterBundle 
                                ? 'bg-white text-black' 
                                : 'bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.09]'
                            }`}
                          >
                            <span className="font-medium text-sm block">Complete Bundle</span>
                            <span className={`text-xs ${includeMixMasterBundle ? 'text-black/60' : 'text-white/50'}`}>Best value</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIncludeMixMasterBundle(false)}
                            className={`p-3 rounded-xl text-center transition-all ${
                              !includeMixMasterBundle 
                                ? 'bg-white text-black' 
                                : 'bg-white/[0.06] text-white/70 border border-white/10 hover:bg-white/[0.09]'
                            }`}
                          >
                            <span className="font-medium text-sm block">À La Carte</span>
                            <span className={`text-xs ${!includeMixMasterBundle ? 'text-black/60' : 'text-white/50'}`}>Pick services</span>
                          </button>
                        </div>

                        {/* Bundle View */}
                        {includeMixMasterBundle && (
                          <div className="p-4 bg-white/[0.06] rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-white font-semibold">Mix + Master Bundle</span>
                              <div className="text-right">
                                <span className="text-white font-bold">CA${PRICES.mixMasterBundle}</span>
                                <span className="text-green-400 text-xs block">Save CA${PRICES.mixing + PRICES.mastering + PRICES.vocalEditing + PRICES.stemsExport + 10 - PRICES.mixMasterBundle}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2 text-white/60">
                                <Check className="w-3 h-3 text-green-400" />
                                <span>Full mixing</span>
                              </div>
                              <div className="flex items-center gap-2 text-white/60">
                                <Check className="w-3 h-3 text-green-400" />
                                <span>Mastering</span>
                              </div>
                              <div className="flex items-center gap-2 text-white/60">
                                <Check className="w-3 h-3 text-green-400" />
                                <span>Vocal tuning & editing</span>
                              </div>
                              <div className="flex items-center gap-2 text-white/60">
                                <Check className="w-3 h-3 text-green-400" />
                                <span>Stems export</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* À La Carte View */}
                        {!includeMixMasterBundle && (
                          <div className="space-y-2">
                            {/* Mixing */}
                            <div 
                              onClick={() => setIncludeMixing(!includeMixing)}
                              className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                                includeMixing ? 'bg-white/15 border border-white/40' : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.07]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                  includeMixing ? 'bg-white border-white' : 'border-white/30'
                                }`}>
                                  {includeMixing && <Check className="w-3 h-3 text-black" />}
                                </div>
                                <div>
                                  <span className="text-white font-medium text-sm">Mixing</span>
                                  <p className="text-white/40 text-xs">Incl. vocal tuning + 2 revisions</p>
                                </div>
                              </div>
                              <span className="text-white font-medium text-sm">CA${PRICES.mixing}</span>
                            </div>

                            {/* Mastering */}
                            <div 
                              onClick={() => setIncludeMastering(!includeMastering)}
                              className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                                includeMastering ? 'bg-white/15 border border-white/40' : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.07]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                  includeMastering ? 'bg-white border-white' : 'border-white/30'
                                }`}>
                                  {includeMastering && <Check className="w-3 h-3 text-black" />}
                                </div>
                                <div>
                                  <span className="text-white font-medium text-sm">Mastering</span>
                                  <p className="text-white/40 text-xs">For pre-mixed tracks</p>
                                </div>
                              </div>
                              <span className="text-white font-medium text-sm">CA${PRICES.mastering}</span>
                            </div>

                            {/* Vocal Tuning - only show if mixing not selected */}
                            {!includeMixing && (
                              <div 
                                onClick={() => setIncludeVocalTuning(!includeVocalTuning)}
                                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                                  includeVocalTuning ? 'bg-white/15 border border-white/40' : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.07]'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                    includeVocalTuning ? 'bg-white border-white' : 'border-white/30'
                                  }`}>
                                    {includeVocalTuning && <Check className="w-3 h-3 text-black" />}
                                  </div>
                                  <div>
                                    <span className="text-white font-medium text-sm">Vocal Tuning</span>
                                    <p className="text-white/40 text-xs">Pitch correction</p>
                                  </div>
                                </div>
                                <span className="text-white font-medium text-sm">CA${PRICES.vocalTuning}</span>
                              </div>
                            )}

                            {/* Vocal Editing */}
                            <div 
                              onClick={() => setIncludeVocalEditing(!includeVocalEditing)}
                              className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                                includeVocalEditing ? 'bg-white/15 border border-white/40' : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.07]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                  includeVocalEditing ? 'bg-white border-white' : 'border-white/30'
                                }`}>
                                  {includeVocalEditing && <Check className="w-3 h-3 text-black" />}
                                </div>
                                <div>
                                  <span className="text-white font-medium text-sm">Vocal Editing</span>
                                  <p className="text-white/40 text-xs">Comping, timing & cleanup</p>
                                </div>
                              </div>
                              <span className="text-white font-medium text-sm">CA${PRICES.vocalEditing}</span>
                            </div>

                            {/* Tip for bundle */}
                            {(includeMixing && includeMastering) && (
                              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2">
                                <Info className="w-4 h-4 text-green-400 shrink-0" />
                                <p className="text-green-400 text-xs">
                                  Switch to Complete Bundle and save CA${PRICES.mixing + PRICES.mastering + PRICES.vocalEditing + PRICES.stemsExport + 10 - PRICES.mixMasterBundle}!
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Deliverables - Only shown in recording mode */}
                    {sessionMode === 'recording' && (
                    <div className="bg-white/[0.08] rounded-xl p-4 border border-white/15">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/30 rounded-lg">
                          <Music className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Deliverables</h3>
                          <p className="text-white/60 text-xs">Additional exports & formats</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div 
                          onClick={() => setAltVersions(!altVersions)}
                          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            altVersions 
                              ? 'bg-white/15 border-2 border-white/60' 
                              : 'bg-white/[0.06] border-2 border-white/10 hover:bg-white/[0.09]'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              altVersions ? 'bg-white border-white' : 'border-white/30'
                            }`}>
                              {altVersions && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <div>
                              <span className="text-white font-medium block">Alt Versions Pack</span>
                              <p className="text-white/50 text-xs">Instrumental, Radio Edit (clean), Live version</p>
                            </div>
                          </div>
                          <span className="text-white font-bold text-sm shrink-0 ml-2">CA${PRICES.altVersions}</span>
                        </div>

                        <div 
                          onClick={() => setStemsExport(!stemsExport)}
                          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            stemsExport 
                              ? 'bg-white/15 border-2 border-white/60' 
                              : 'bg-white/[0.06] border-2 border-white/10 hover:bg-white/[0.09]'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              stemsExport ? 'bg-white border-white' : 'border-white/30'
                            }`}>
                              {stemsExport && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <div>
                              <span className="text-white font-medium block">Stems Export</span>
                              <p className="text-white/50 text-xs">Consolidated stems delivery</p>
                            </div>
                          </div>
                          {isStemsExportFree ? (
                            <span className="text-green-400 font-bold text-sm shrink-0 ml-2">FREE</span>
                          ) : (
                            <span className="text-white font-bold text-sm shrink-0 ml-2">CA${PRICES.stemsExport}</span>
                          )}
                        </div>

                        <div 
                          onClick={() => setMultitrackExport(!multitrackExport)}
                          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            multitrackExport 
                              ? 'bg-white/15 border-2 border-white/60' 
                              : 'bg-white/[0.06] border-2 border-white/10 hover:bg-white/[0.09]'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              multitrackExport ? 'bg-white border-white' : 'border-white/30'
                            }`}>
                              {multitrackExport && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <div>
                              <span className="text-white font-medium block">Multitrack Session Export</span>
                              <p className="text-white/50 text-xs">Full session export</p>
                            </div>
                          </div>
                          <span className="text-white font-bold text-sm shrink-0 ml-2">CA${PRICES.multitrackExport}</span>
                        </div>

                        <div 
                          onClick={() => setUsbMedia(!usbMedia)}
                          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                            usbMedia 
                              ? 'bg-white/15 border-2 border-white/60' 
                              : 'bg-white/[0.06] border-2 border-white/10 hover:bg-white/[0.09]'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              usbMedia ? 'bg-white border-white' : 'border-white/30'
                            }`}>
                              {usbMedia && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <div>
                              <span className="text-white font-medium block">USB / Physical Media</span>
                              <p className="text-white/50 text-xs">Delivered on USB drive</p>
                            </div>
                          </div>
                          <span className="text-white font-bold text-sm shrink-0 ml-2">CA${PRICES.usbMedia}</span>
                        </div>
                      </div>
                    </div>
                    )}

                    {/* Rush Options */}
                    {sessionMode === 'recording' && hasPostProduction && (
                      <div className="bg-white/[0.08] rounded-xl p-4 border border-white/15">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-white/30 rounded-lg">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">Rush Turnaround</h3>
                            <p className="text-white/60 text-xs">Need your mixes faster?</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div 
                            onClick={() => setRushOption('none')}
                            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                              rushOption === 'none' 
                                ? 'bg-white/15 border-2 border-white/60' 
                                : 'bg-white/[0.06] border-2 border-white/10 hover:bg-white/[0.09]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                rushOption === 'none' ? 'border-white' : 'border-white/30'
                              }`}>
                                {rushOption === 'none' && <div className="w-2.5 h-2.5 rounded-full bg-ap-red" />}
                              </div>
                              <span className="text-white font-medium">Standard (4-7 days)</span>
                            </div>
                            <span className="text-white/60 text-sm">Included</span>
                          </div>

                          <div 
                            onClick={() => setRushOption('rush48')}
                            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                              rushOption === 'rush48' 
                                ? 'bg-white/15 border-2 border-white/60' 
                                : 'bg-white/[0.06] border-2 border-white/10 hover:bg-white/[0.09]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                rushOption === 'rush48' ? 'border-white' : 'border-white/30'
                              }`}>
                                {rushOption === 'rush48' && <div className="w-2.5 h-2.5 rounded-full bg-ap-red" />}
                              </div>
                              <span className="text-white font-medium">Rush 48h</span>
                            </div>
                            <span className="text-white font-bold text-sm">+CA${PRICES.rush48}</span>
                          </div>

                          <div 
                            onClick={() => setRushOption('rush24')}
                            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                              rushOption === 'rush24' 
                                ? 'bg-white/15 border-2 border-white/60' 
                                : 'bg-white/[0.06] border-2 border-white/10 hover:bg-white/[0.09]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                rushOption === 'rush24' ? 'border-white' : 'border-white/30'
                              }`}>
                                {rushOption === 'rush24' && <div className="w-2.5 h-2.5 rounded-full bg-ap-red" />}
                              </div>
                              <span className="text-white font-medium">Rush 24h</span>
                            </div>
                            <span className="text-white font-bold text-sm">+CA${PRICES.rush24}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Session Summary */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Schedule Section - First so users see time affects pricing */}
                    <div className="bg-white/[0.08] rounded-xl p-4 border border-white/15">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/30 rounded-lg">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">When would you like to book?</h3>
                          <p className="text-white/60 text-xs">Select your preferred date and time</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Custom Date Picker */}
                        <div ref={calendarRef}>
                          <label className="block text-white/60 text-xs mb-1.5">Preferred Date *</label>
                          <div className="relative">
                            <button
                              ref={dateInputRef}
                              type="button"
                              onClick={() => {
                                if (dateInputRef.current) {
                                  const rect = dateInputRef.current.getBoundingClientRect()
                                  const calendarHeight = Math.min(400, window.innerHeight * 0.7)
                                  const spaceBelow = window.innerHeight - rect.bottom
                                  const spaceAbove = rect.top
                                  const padding = 16
                                  
                                  const above = spaceBelow < calendarHeight + padding && spaceAbove > spaceBelow
                                  
                                  let top: number
                                  if (above) {
                                    top = Math.max(padding, rect.top - calendarHeight - 8)
                                  } else {
                                    top = Math.min(rect.bottom + 8, window.innerHeight - calendarHeight - padding)
                                  }
                                  
                                  setCalendarAbove(above)
                                  setCalendarPos({
                                    top: Math.max(padding, Math.min(top, window.innerHeight - calendarHeight - padding)),
                                    left: rect.left,
                                    width: rect.width
                                  })
                                }
                                setShowCalendar(!showCalendar)
                                setShowTimePicker(false)
                              }}
                              className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm text-left transition-colors duration-200 ${
                                errors.preferredDate ? 'border-red-500 bg-red-500/5' : 'border-white/10 hover:bg-white/[0.07] focus:border-white/50'
                              } ${showCalendar ? 'border-white/50 bg-white/[0.07]' : ''}`}
                            >
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <span className={contactInfo.preferredDate ? 'text-white' : 'text-white/30'}>
                                {contactInfo.preferredDate 
                                  ? new Date(contactInfo.preferredDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                                  : 'Select a date'}
                              </span>
                            </button>
                            
                            {/* iOS Style Calendar Dropdown - Rendered via Portal */}
                            {portalContainer && createPortal(
                              <AnimatePresence>
                                {showCalendar && (
                                  <motion.div
                                    ref={calendarPortalRef}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="fixed z-[9999] bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                                    style={windowWidth >= 768 ? {
                                      top: calendarAbove ? 'auto' : calendarPos.top,
                                      bottom: calendarAbove ? window.innerHeight - calendarPos.top + 16 : 'auto',
                                      left: Math.max(16, Math.min(calendarPos.left, windowWidth - 336)),
                                      width: 320,
                                      maxHeight: 'min(400px, 80vh)'
                                    } : {
                                      top: '50%',
                                      left: 16,
                                      right: 16,
                                      transform: 'translateY(-50%)',
                                      width: 'auto',
                                      maxWidth: 'calc(100vw - 32px)'
                                    }}
                                  >
                                  <div className="flex items-center justify-between p-3 border-b border-white/10">
                                    <button
                                      type="button"
                                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                      <ChevronLeft className="w-4 h-4 text-white/60" />
                                    </button>
                                    <span className="text-white font-medium text-sm">
                                      {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                      <ChevronRight className="w-4 h-4 text-white/60" />
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-7 gap-1 px-3 pt-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                      <div key={day} className="text-center text-white/40 text-xs py-1">{day}</div>
                                    ))}
                                  </div>
                                  
                                  <div className="grid grid-cols-7 gap-1 p-3">
                                    {(() => {
                                      const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
                                      const lastDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
                                      const today = new Date()
                                      today.setHours(0, 0, 0, 0)
                                      
                                      // Minimum booking date is 2 days from now
                                      const minBookingDate = new Date(today)
                                      minBookingDate.setDate(minBookingDate.getDate() + 2)
                                      
                                      const days = []
                                      for (let i = 0; i < firstDay.getDay(); i++) {
                                        days.push(<div key={`empty-${i}`} />)
                                      }
                                      for (let day = 1; day <= lastDay.getDate(); day++) {
                                        const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
                                        const dateStr = date.toISOString().split('T')[0]
                                        const isTooSoon = date < minBookingDate
                                        const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                        const isSelected = contactInfo.preferredDate === dateStr
                                        const isToday = date.toDateString() === today.toDateString()
                                        const isDisabled = isTooSoon
                                        
                                        days.push(
                                          <button
                                            key={day}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => {
                                              setContactInfo(prev => ({ ...prev, preferredDate: dateStr }))
                                              if (errors.preferredDate) setErrors(prev => ({ ...prev, preferredDate: '' }))
                                              setShowCalendar(false)
                                            }}
                                            className={`aspect-square rounded-xl text-sm font-medium transition-all duration-200 ${
                                              isSelected 
                                                ? 'bg-white text-black' 
                                                : isDisabled
                                                  ? 'text-white/20 cursor-not-allowed'
                                                  : isToday
                                                    ? 'bg-white/10 text-white hover:bg-white/20'
                                                    : isWeekend
                                                      ? 'text-amber-400/80 hover:bg-amber-500/10'
                                                      : 'text-white/70 hover:bg-white/10'
                                            }`}
                                          >
                                            {day}
                                          </button>
                                        )
                                      }
                                      return days
                                    })()}
                                  </div>
                                  
                                  <div className="flex items-center justify-between p-3 border-t border-white/10 bg-white/5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setContactInfo(prev => ({ ...prev, preferredDate: '' }))
                                        setShowCalendar(false)
                                      }}
                                      className="text-white/50 text-xs hover:text-white transition-colors"
                                    >
                                      Clear
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setShowCalendar(false)}
                                      className="text-white text-xs font-medium hover:text-white/80 transition-colors"
                                    >
                                      Done
                                    </button>
                                  </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>,
                              portalContainer
                            )}
                          </div>
                          {errors.preferredDate && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.preferredDate}</p>}
                        </div>

                        {/* Custom Time Picker */}
                        <div ref={timePickerRef}>
                          <label className="block text-white/60 text-xs mb-1.5">Preferred Time *</label>
                          <div className="relative">
                            <button
                              ref={timeInputRef}
                              type="button"
                              onClick={() => {
                                if (timeInputRef.current) {
                                  const rect = timeInputRef.current.getBoundingClientRect()
                                  const spaceBelow = window.innerHeight - rect.bottom
                                  const above = spaceBelow < 320
                                  setTimePickerAbove(above)
                                  setTimePickerPos({
                                    top: above ? rect.top - 8 : rect.bottom + 8,
                                    left: rect.left,
                                    width: rect.width
                                  })
                                }
                                setShowTimePicker(!showTimePicker)
                                setShowCalendar(false)
                              }}
                              className={`w-full bg-white/5 border rounded-xl pl-10 pr-10 py-3 text-sm text-left transition-colors duration-200 ${
                                errors.preferredTime ? 'border-red-500 bg-red-500/5' : 'border-white/10 hover:bg-white/[0.07] focus:border-white/50'
                              } ${showTimePicker ? 'border-white/50 bg-white/[0.07]' : ''}`}
                            >
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <span className={contactInfo.preferredTime ? 'text-white' : 'text-white/40'}>
                                {(() => {
                                  if (!contactInfo.preferredTime) return 'Select a time'
                                  const hour = parseInt(contactInfo.preferredTime.split(':')[0])
                                  if (isNaN(hour)) return 'Select a time'
                                  if (hour === 0) return '12:00 AM'
                                  if (hour === 12) return '12:00 PM'
                                  if (hour > 12) return `${hour - 12}:00 PM`
                                  return `${hour}:00 AM`
                                })()}
                              </span>
                              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 transition-transform ${showTimePicker ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* iOS Style Time Picker - Rendered via Portal */}
                            {portalContainer && createPortal(
                              <AnimatePresence>
                                {showTimePicker && (
                                  <motion.div
                                    ref={timePickerPortalRef}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="fixed z-[9999] bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                                    style={windowWidth >= 768 ? {
                                      top: timePickerAbove ? 'auto' : timePickerPos.top,
                                      bottom: timePickerAbove ? window.innerHeight - timePickerPos.top + 16 : 'auto',
                                      left: Math.max(16, Math.min(timePickerPos.left, windowWidth - 296)),
                                      width: 280
                                    } : {
                                      top: '50%',
                                      left: 16,
                                      right: 16,
                                      transform: 'translateY(-50%)',
                                      width: 'auto',
                                      maxWidth: 'calc(100vw - 32px)'
                                    }}
                                    onTouchMove={(e) => e.stopPropagation()}
                                    onWheel={(e) => e.stopPropagation()}
                                  >
                                  <div className="relative h-[220px] overflow-hidden">
                                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/90 to-transparent z-10 pointer-events-none" />
                                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none" />
                                    
                                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-11 bg-white/20 border-y border-white/40 rounded-lg z-0 pointer-events-none" />
                                    
                                    <div 
                                      ref={timeScrollRef}
                                      onScroll={handleTimeScroll}
                                      onTouchStart={(e) => e.stopPropagation()}
                                      onTouchMove={(e) => e.stopPropagation()}
                                      onWheel={(e) => {
                                        e.stopPropagation()
                                        if (timeScrollRef.current) {
                                          timeScrollRef.current.scrollTop += e.deltaY * 0.3
                                        }
                                      }}
                                      onMouseDown={(e) => {
                                        isDraggingTimeRef.current = true
                                        hasDraggedRef.current = false
                                        mouseDownTimeRef.current = Date.now()
                                        dragStartYRef.current = e.clientY
                                        dragStartScrollRef.current = timeScrollRef.current?.scrollTop || 0
                                        e.preventDefault()
                                      }}
                                      className="h-full overflow-y-auto overscroll-none scrollbar-hide py-[88px] cursor-grab"
                                      style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
                                    >
                                      {availableHours.map(hour => {
                                        const actualHour = hour === 25 ? 1 : hour === 24 ? 0 : hour
                                        const timeValue = `${actualHour.toString().padStart(2, '0')}:00`
                                        const isSelected = contactInfo.preferredTime === timeValue
                                        
                                        let displayHour: number
                                        let period: string
                                        if (hour === 24) {
                                          displayHour = 12
                                          period = 'AM'
                                        } else if (hour === 25) {
                                          displayHour = 1
                                          period = 'AM'
                                        } else if (hour === 12) {
                                          displayHour = 12
                                          period = 'PM'
                                        } else if (hour > 12) {
                                          displayHour = hour - 12
                                          period = 'PM'
                                        } else {
                                          displayHour = hour
                                          period = 'AM'
                                        }
                                        const displayTime = `${displayHour}:00 ${period}`
                                        
                                        return (
                                          <div
                                            key={hour}
                                            role="button"
                                            tabIndex={0}
                                            onMouseDown={(e) => {
                                              mouseDownTimeRef.current = Date.now()
                                              isDraggingTimeRef.current = true
                                              hasDraggedRef.current = false
                                              dragStartYRef.current = e.clientY
                                              dragStartScrollRef.current = timeScrollRef.current?.scrollTop || 0
                                            }}
                                            onClick={() => {
                                              if (hasDraggedRef.current || Date.now() < clickBlockedUntilRef.current) return
                                              setContactInfo(prev => ({ ...prev, preferredTime: timeValue }))
                                              if (errors.preferredTime) setErrors(prev => ({ ...prev, preferredTime: '' }))
                                              setShowTimePicker(false)
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                setContactInfo(prev => ({ ...prev, preferredTime: timeValue }))
                                                if (errors.preferredTime) setErrors(prev => ({ ...prev, preferredTime: '' }))
                                                setShowTimePicker(false)
                                              }
                                            }}
                                            className={`w-full h-11 flex items-center justify-center transition-all duration-150 cursor-pointer select-none ${
                                              isSelected 
                                                ? 'text-white font-semibold text-lg' 
                                                : 'text-white/50 hover:text-white/80'
                                            }`}
                                            style={{ scrollSnapAlign: 'center' }}
                                          >
                                            {displayTime}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                  
                                  <div className="p-3 border-t border-white/10 bg-white/5">
                                    <button
                                      type="button"
                                      onClick={() => setShowTimePicker(false)}
                                      className="w-full py-2 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm"
                                    >
                                      Done
                                    </button>
                                  </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>,
                              portalContainer
                            )}
                          </div>
                          {errors.preferredTime && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.preferredTime}</p>}
                        </div>
                      </div>

                      {/* After Hours Notice */}
                      {isAfterHours && contactInfo.preferredDate && !showTimePicker && (
                        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-amber-200 text-xs">
                            {afterHoursCount} hour{afterHoursCount !== 1 ? 's' : ''} of your session {afterHoursCount !== 1 ? 'are' : 'is'} outside regular hours (11am-10pm). After-hours premium will be added below.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Contact Information - Moved up for better flow */}
                    <div className="bg-white/[0.08] rounded-xl p-4 border border-white/15">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/30 rounded-lg">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-white font-medium">Your Information</h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-white/60 text-xs mb-1.5">Full Name *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                              type="text"
                              value={contactInfo.name}
                              onChange={(e) => {
                                const value = e.target.value.slice(0, 100)
                                setContactInfo(prev => ({ ...prev, name: value }))
                                if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                              }}
                              placeholder="Your name"
                              maxLength={100}
                              className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors duration-200 ${
                                errors.name ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-white/50 focus:bg-white/[0.07]'
                              }`}
                            />
                          </div>
                          {errors.name && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-white/60 text-xs mb-1.5">Email *</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <input
                                type="email"
                                value={contactInfo.email}
                                onChange={(e) => {
                                  const value = e.target.value.toLowerCase()
                                  setContactInfo(prev => ({ ...prev, email: value }))
                                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                                }}
                                onBlur={(e) => validateField('email', e.target.value)}
                                placeholder="you@example.com"
                                className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors duration-200 ${
                                  errors.email ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-white/50 focus:bg-white/[0.07]'
                                }`}
                              />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                          </div>

                          <div>
                            <label className="block text-white/60 text-xs mb-1.5">Phone *</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <input
                                type="tel"
                                value={contactInfo.phone}
                                onChange={(e) => {
                                  const formatted = formatPhoneNumber(e.target.value)
                                  setContactInfo(prev => ({ ...prev, phone: formatted }))
                                  validateField('phone', formatted)
                                }}
                                placeholder="(514) 123-4567"
                                maxLength={14}
                                className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors duration-200 ${
                                  errors.phone ? 'border-red-500 bg-red-500/5' : 'border-white/10 focus:border-white/50 focus:bg-white/[0.07]'
                                }`}
                              />
                            </div>
                            {errors.phone && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-white/60 text-xs mb-1.5">Instagram (optional)</label>
                          <div className="relative">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                              type="text"
                              value={contactInfo.instagram}
                              onChange={(e) => setContactInfo(prev => ({ ...prev, instagram: e.target.value }))}
                              placeholder="@yourusername"
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-white/[0.07] transition-colors duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compact Order Summary with Price */}
                    <div className="bg-white/[0.08] rounded-xl p-4 border border-white/15">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/30 rounded-lg">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-white font-medium">Order Summary</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold text-xl">CA${totals.grand}</span>
                          {totalSavings > 0 && (
                            <span className="text-green-400 text-xs block">Save CA${totalSavings}</span>
                          )}
                        </div>
                      </div>

                      {/* Compact line items */}
                      <div className="space-y-1.5 text-sm border-t border-white/10 pt-3">
                        <div className="flex justify-between">
                          <span className="text-white/60">
                            {sessionMode === 'rental' ? 'Studio Rental' : 'Recording Session'} ({sessionHours}hr)
                          </span>
                          <span className="text-white">CA${PRICES.studioWorkspace * sessionHours}</span>
                        </div>
                        {includeEngineer && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Engineer ({sessionHours}hr)</span>
                            <span className="text-white">CA${PRICES.recordingEngineer * sessionHours}</span>
                          </div>
                        )}
                        {includeProducer && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Producer ({producerHours}hr)</span>
                            <span className="text-white">CA${PRICES.producer * producerHours}</span>
                          </div>
                        )}
                        {afterHoursCount > 0 && contactInfo.preferredDate && (
                          <div className="flex justify-between text-amber-400">
                            <span>After-Hours ({afterHoursCount}hr)</span>
                            <span>+CA${PRICES.afterHoursPremium * afterHoursCount}</span>
                          </div>
                        )}
                        {totals.post > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Post-Production</span>
                            <span className="text-white">CA${totals.post}</span>
                          </div>
                        )}
                        {totals.deliverables > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Deliverables</span>
                            <span className="text-white">CA${totals.deliverables}</span>
                          </div>
                        )}
                        {totals.rush > 0 && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Rush Fee</span>
                            <span className="text-white">CA${totals.rush}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Condensed Policies - Key points only */}
                    <div className="bg-white/[0.06] rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <h3 className="text-white/80 font-medium text-sm">Before You Book</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-white/40 shrink-0 mt-0.5" />
                          <span className="text-white/50">Deposit required for first-time clients</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-white/40 shrink-0 mt-0.5" />
                          <span className="text-white/50">After-hours: +CA$5/hr (before 11am / after 10pm)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-white/40 shrink-0 mt-0.5" />
                          <span className="text-white/50">Overtime: CA$35 per 30min past booked time</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-white/40 shrink-0 mt-0.5" />
                          <span className="text-white/50">Late arrivals (30+ min) may incur CA$60 fee</span>
                        </div>
                      </div>
                      <p className="text-white/40 text-xs mt-3 pt-3 border-t border-white/10">
                        By submitting, you agree to our booking policies. Payment due upon confirmation.
                      </p>
                    </div>

                    {submitError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {submitError}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 4 && submitSuccess && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-6 px-4"
                  >
                    {/* Success Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-5"
                    >
                      <Check className="w-10 h-10 text-green-500" />
                    </motion.div>
                    
                    {/* Title & Message */}
                    <h3 className="text-2xl font-display text-white mb-2">You're All Set!</h3>
                    <p className="text-white/60 text-sm max-w-md text-center mb-6">
                      We've received your {bookingPath === 'full-project' ? 'project inquiry' : 'session request'} and sent a confirmation to your email.
                    </p>

                    {/* What Happens Next */}
                    <div className="w-full max-w-sm bg-white/[0.06] rounded-xl p-4 mb-5 border border-white/10">
                      <h4 className="text-white font-medium text-sm mb-3 text-center">What Happens Next</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-white">1</span>
                          </div>
                          <div>
                            <p className="text-white/80 text-sm font-medium">Check your inbox</p>
                            <p className="text-white/40 text-xs">Confirmation email sent with details</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-white">2</span>
                          </div>
                          <div>
                            <p className="text-white/80 text-sm font-medium">We'll reach out</p>
                            <p className="text-white/40 text-xs">Expect a response within 24 hours</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-white">3</span>
                          </div>
                          <div>
                            <p className="text-white/80 text-sm font-medium">{bookingPath === 'full-project' ? 'Get your quote' : 'Confirm & book'}</p>
                            <p className="text-white/40 text-xs">{bookingPath === 'full-project' ? 'Custom proposal for your project' : 'Finalize your session date & time'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connect With Us */}
                    <div className="w-full max-w-sm mb-6">
                      <p className="text-white/40 text-xs text-center mb-3">Connect with us</p>
                      <div className="flex items-center justify-center gap-3">
                        <a 
                          href="https://www.instagram.com/alliance.wav/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Instagram className="w-5 h-5 text-white/70" />
                        </a>
                        <a 
                          href="https://discord.com/invite/N257QBkSeg" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                        >
                          <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                        </a>
                        <a 
                          href="mailto:contact@allianceproductions.ca" 
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Mail className="w-5 h-5 text-white/70" />
                        </a>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button onClick={onClose} className="btn-primary text-sm px-8 py-3">
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer - Hide on step 0 (path selection) and step 4 (success) */}
            {step > 0 && step < 4 && (
              <div className="border-t border-white/10 bg-black/50 backdrop-blur-sm p-4 shrink-0 relative z-10">
                {/* Full Project Path Footer - Simple with just back and submit */}
                {bookingPath === 'full-project' ? (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setStep(0)
                        contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="btn-secondary text-sm px-5 py-2.5 whitespace-nowrap"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        // Run validation to show errors even if button is disabled
                        validateProjectInquiry()
                        if (isProjectInquiryValid) {
                          handleProjectInquirySubmit()
                        }
                      }}
                      disabled={!isProjectInquiryValid || isSubmitting}
                      className="btn-primary text-sm px-6 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Inquiry</span>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Record-Only Path Footer - With price breakdown */
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Price breakdown */}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-white/50">Session <span className="text-white">CA${totals.session}</span></span>
                      {totals.post > 0 && (
                        <span className="text-white/50">Post <span className="text-white">CA${totals.post}</span></span>
                      )}
                      {totals.deliverables > 0 && (
                        <span className="text-white/50">Extras <span className="text-white">CA${totals.deliverables}</span></span>
                      )}
                      {totalSavings > 0 && (
                        <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full whitespace-nowrap shrink-0">
                          -CA${totalSavings}
                        </span>
                      )}
                      <div className="ml-auto sm:ml-0">
                        <span className="text-white/50">Total </span>
                        <span className="text-white font-bold text-lg">CA${totals.grand}</span>
                      </div>
                    </div>

                    {/* Navigation buttons - right aligned */}
                    <div className="flex items-center gap-2 justify-end">
                      {step >= 1 && (
                        <button
                          onClick={() => {
                            setStep(step - 1)
                            contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="btn-secondary text-sm px-5 py-2.5 whitespace-nowrap"
                        >
                          Back
                        </button>
                      )}
                      {step < 2 ? (
                        <button
                          onClick={() => {
                            setStep(step + 1)
                            contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="btn-primary text-sm px-6 py-2.5 whitespace-nowrap"
                        >
                          Continue
                        </button>
                      ) : (
                      <button
                        onClick={() => {
                          // Always run validation first to show errors
                          const isValid = validateContact()
                          if (isValid && contactInfo.preferredDate && contactInfo.preferredTime) {
                            handleSubmit()
                          }
                        }}
                        disabled={!isContactValid || isSubmitting}
                        className="btn-primary text-sm px-4 py-2.5 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Request Session</span>
                        )}
                      </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Rental Confirmation Modal */}
          <AnimatePresence>
            {showRentalConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
                onClick={handleCancelRental}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 max-w-md w-full shadow-2xl"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-2.5 bg-amber-500/15 rounded-lg border border-amber-500/30 shrink-0">
                      <Building2 className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Switch to Studio Rental?</h3>
                      <p className="text-amber-500 text-sm mt-0.5">1-hour bookings are rental only</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                    <p className="text-white/90 text-sm leading-relaxed">
                      <strong className="text-white">Recording sessions require a minimum of 2 hours</strong> to ensure quality results with our engineer.
                    </p>
                    <p className="text-white/60 text-sm mt-3">
                      1-hour bookings are <strong className="text-amber-400">Studio Rentals</strong> — you'll have access to the space but no engineer will be provided.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelRental()
                      }}
                      className="btn-primary text-sm px-5 py-2.5 whitespace-nowrap"
                    >
                      Keep Recording
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConfirmRental()
                      }}
                      className="btn-secondary text-sm px-5 py-2.5 whitespace-nowrap"
                    >
                      Switch to Rental
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

                  </>
      )}
    </AnimatePresence>,
    portalContainer
  )
}
