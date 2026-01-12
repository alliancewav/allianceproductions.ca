'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Phone, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useBooking } from './BookingContext'

const navItems = [
  { label: 'Why Choose Us', href: '#why-choose-us' },
  { label: 'The Process', href: '#process' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Producers', href: '#producers' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const { openBooking } = useBooking()

  // Show navbar after scrolling past hero (roughly 100vh)
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsVisible(latest > 400)
  })

  // Check scroll position for fade masks
  const updateScrollIndicators = () => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    updateScrollIndicators()
    container.addEventListener('scroll', updateScrollIndicators)
    window.addEventListener('resize', updateScrollIndicators)
    
    return () => {
      container.removeEventListener('scroll', updateScrollIndicators)
      window.removeEventListener('resize', updateScrollIndicators)
    }
  }, [])

  // Handle drag for mouse only - let native touch scrolling handle mobile
  const handleMouseDrag = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current
    if (!container) return

    e.preventDefault()
    const startX = e.pageX
    const scrollLeft = container.scrollLeft

    const handleMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX
      const walk = startX - x
      container.scrollLeft = scrollLeft + walk
    }

    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : -100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
          {/* Logo */}
          <a href="#" className="flex-shrink-0" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <Image
              src="/AP-white-logo.svg"
              alt="Alliance Productions"
              width={32}
              height={32}
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
          </a>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 flex-shrink-0" />

          {/* Navigation items with drag scroll */}
          <div className="relative flex-1 overflow-hidden min-w-0">
            {/* Scrollable nav container with CSS mask for fade effect */}
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDrag}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none touch-pan-x"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                maskImage: `linear-gradient(to right, ${canScrollLeft ? 'transparent' : 'black'}, black 24px, black calc(100% - 24px), ${canScrollRight ? 'transparent' : 'black'})`,
                WebkitMaskImage: `linear-gradient(to right, ${canScrollLeft ? 'transparent' : 'black'}, black 24px, black calc(100% - 24px), ${canScrollRight ? 'transparent' : 'black'})`,
              }}
            >
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    const target = document.querySelector(item.href)
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="flex-shrink-0 px-3 py-1.5 text-white/60 font-body text-sm whitespace-nowrap rounded-full border border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  {item.label}
                </a>
              ))}
              
              {/* Mobile action buttons - inside scrollable area */}
              <div className="flex items-center gap-2 md:hidden flex-shrink-0 pl-2">
                <a
                  href="tel:+15143979912"
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                  aria-label="Call us"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://maps.app.goo.gl/AHYJLJrbhkpzuS6j9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                  aria-label="Get directions"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={openBooking}
                  className="px-3 py-1.5 bg-white text-ap-black font-display text-sm uppercase tracking-wider rounded-full hover:bg-white/90 transition-all duration-200 whitespace-nowrap"
                >
                  Book
                </button>
              </div>
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {/* Phone */}
            <a
              href="tel:+15143979912"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200"
              aria-label="Call us"
            >
              <Phone className="w-4 h-4" />
            </a>
            
            {/* Directions */}
            <a
              href="https://maps.app.goo.gl/AHYJLJrbhkpzuS6j9"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200"
              aria-label="Get directions"
            >
              <MapPin className="w-4 h-4" />
            </a>

            {/* Book Session button */}
            <button
              onClick={openBooking}
              className="px-4 py-1.5 bg-white text-ap-black font-display text-sm uppercase tracking-wider rounded-full hover:bg-white/90 transition-all duration-200"
            >
              Book Session
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
