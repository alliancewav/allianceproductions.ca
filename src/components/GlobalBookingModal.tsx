'use client'

import { useBooking } from './BookingContext'
import BookingModal from './BookingModal'

export default function GlobalBookingModal() {
  const { isOpen, closeBooking } = useBooking()
  
  return <BookingModal isOpen={isOpen} onClose={closeBooking} />
}
