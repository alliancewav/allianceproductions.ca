'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed z-40 w-[48px] h-[48px] flex items-center justify-center rounded-full bg-[#4a4a4a] hover:bg-[#5a5a5a] shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{ 
        bottom: '90px',
        left: '16px'
      }}
      aria-label="Back to top"
    >
      <ChevronUp className="w-6 h-6 text-white/80" />
    </button>
  )
}
