'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface SessionConfig {
  sessionHours: number
  mixSongs: number
  masterSongs: number
  producerHours: number
}

interface PostProduction {
  mixRevisions: number
  masterRevisions: number
  rushDelivery: '' | '48h' | '24h'
}

interface ContactInfo {
  name: string
  email: string
  phone: string
  preferredDate: string
  preferredTime: string
  notes: string
}

interface BookingState {
  step: number
  sessionConfig: SessionConfig
  postProduction: PostProduction
  contactInfo: ContactInfo
}

interface BookingContextType {
  isOpen: boolean
  openBooking: () => void
  closeBooking: () => void
  bookingState: BookingState
  setBookingState: (state: BookingState) => void
  resetBooking: () => void
}

const defaultSessionConfig: SessionConfig = {
  sessionHours: 2,
  mixSongs: 0,
  masterSongs: 0,
  producerHours: 0,
}

const defaultPostProduction: PostProduction = {
  mixRevisions: 0,
  masterRevisions: 0,
  rushDelivery: '',
}

const defaultContactInfo: ContactInfo = {
  name: '',
  email: '',
  phone: '',
  preferredDate: '',
  preferredTime: '',
  notes: '',
}

const defaultBookingState: BookingState = {
  step: 1,
  sessionConfig: defaultSessionConfig,
  postProduction: defaultPostProduction,
  contactInfo: defaultContactInfo,
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [bookingState, setBookingState] = useState<BookingState>(defaultBookingState)

  const openBooking = useCallback(() => {
    // Hide OpenWidget bubble when booking opens
    if (typeof window !== 'undefined') {
      const openWidget = document.querySelector('.openwidget-widget') as HTMLElement
      if (openWidget) {
        openWidget.style.display = 'none'
      }
    }
    setIsOpen(true)
  }, [])

  const closeBooking = useCallback(() => {
    // Show OpenWidget bubble when booking closes
    if (typeof window !== 'undefined') {
      const openWidget = document.querySelector('.openwidget-widget') as HTMLElement
      if (openWidget) {
        openWidget.style.display = ''
      }
    }
    setIsOpen(false)
  }, [])

  const resetBooking = useCallback(() => {
    setBookingState(defaultBookingState)
  }, [])

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        openBooking,
        closeBooking,
        bookingState,
        setBookingState,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
