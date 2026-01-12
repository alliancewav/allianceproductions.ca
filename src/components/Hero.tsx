'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import BookingModal from './BookingModal'

const rotatingWords = [
  'music production',
  'custom beats',
  'pro vocal tracking',
  'mix & mastering',
  'live instrument sessions'
]

export default function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  
  // Parallax effect - Hero background only (no content movement)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Main background image - monochrome with grayscale filter - PARALLAX */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 grayscale"
        style={{ 
          backgroundImage: 'url(/api-access1.jpg)',
          y: backgroundY
        }}
      />
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-ap-black/70 via-ap-black/30 to-ap-black/60" />
      
      {/* Lens effect overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-overlay pointer-events-none grayscale"
        style={{ backgroundImage: 'url(/lense-effect-transparent-graphic-background.png)' }}
      />
      

      {/* Animated accent elements - monochrome */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.1, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto text-center pt-16 sm:pt-20 pb-24 sm:pb-32">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-white/10 blur-3xl scale-150" />
            <Image
              src="/logo.png"
              alt="Alliance Productions"
              width={280}
              height={192}
              className="relative w-[180px] sm:w-[220px] md:w-[280px] h-auto"
              priority
            />
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="font-display tracking-tight leading-tight">
            <span className="text-white block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-2">
              YOUR STUDIO
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white/90 mb-4">
              COPILOT
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center">
              <span className="text-white/60">FOR </span>
              <span className="relative inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWordIndex}
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-white inline-block"
                  >
                    {rotatingWords[currentWordIndex].toUpperCase()}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </h1>
        </motion.div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-lg md:text-xl text-white/50 max-w-xl sm:max-w-2xl mx-auto mb-4 sm:mb-6 font-body leading-relaxed px-2"
        >
          Stop juggling between studios, engineers, and producers. 
          Get recording, mixing, mastering, and beats under one roof in Montreal.
        </motion.p>
        
        {/* Permission microcopy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-8 sm:mb-12"
        >
          <div className="inline-flex flex-wrap justify-center gap-4 sm:gap-6 px-5 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <span className="text-sm text-white/50 font-body">No contracts</span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-sm text-white/50 font-body">Book by the hour</span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-sm text-white/50 font-body">Cancel anytime</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <button
            onClick={() => setIsBookingOpen(true)}
            className="group relative inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-4 bg-white text-ap-black font-display uppercase tracking-wider transition-all duration-300 hover:bg-white/90 hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <span>BOOK A SESSION</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="https://open.beatpass.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-4 bg-transparent border-2 border-white/30 font-display text-white uppercase tracking-wider transition-all duration-300 hover:border-white hover:bg-white/10 text-sm sm:text-base w-full sm:w-auto"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <span>EXPLORE BEATS</span>
          </a>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-[10px] sm:text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-6 sm:h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </motion.div>

      {/* Booking Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </section>
  )
}
