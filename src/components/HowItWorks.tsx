'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useTransform, useScroll } from 'framer-motion'

// Colors extracted from background image (studio-producer-playing-midi-keyboard-puple-ambient-light.jpg)
// Dominant: deep purple #6B21A8, magenta #9333EA, violet #7C3AED, soft lavender accents

const steps = [
  {
    number: '01',
    title: 'Book Online',
    description: 'Pick your date, time, and services. Confirm in under 2 minutes.',
    detail: 'Reschedule free with 24h notice.',
  },
  {
    number: '02',
    title: 'Record',
    description: 'Show up, plug in, create. Engineer assistance included. Producer add-on available.',
    detail: 'Overtime: $35 per 30-min block.',
  },
  {
    number: '03',
    title: 'Mix & Master',
    description: 'Post-production handled. 1 revision included per service. Standard turnaround: 4-7 days.',
    detail: 'Rush delivery available.',
  },
  {
    number: '04',
    title: 'Receive Files',
    description: 'Download masters, stems, alt versions. Release-ready formats.',
    detail: 'Archive retrieval: $20.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

function StepCard({ step, index, isLast }: { step: typeof steps[0]; index: number; isLast: boolean }) {
  return (
    <motion.div
      variants={itemVariants}
      className="group relative"
    >
      <div 
        className="relative h-full p-6 sm:p-8 bg-gradient-to-br from-purple-950/50 to-violet-900/20 backdrop-blur-xl border border-purple-500/15 hover:border-purple-400/30 transition-all duration-500 flex flex-col"
        style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
      >
        {/* Step number */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-display text-3xl sm:text-4xl text-purple-400/80">{step.number}</span>
          <h3 className="font-display text-xl sm:text-2xl text-purple-50 group-hover:text-white transition-colors">
            {step.title}
          </h3>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          <p className="text-purple-100/60 font-body text-sm sm:text-base leading-relaxed mb-3 group-hover:text-purple-100/80 transition-colors duration-300 flex-1">
            {step.description}
          </p>
          <p className="text-purple-300/40 font-body text-xs">
            {step.detail}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function MobileCarousel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  
  const cardWidth = 280
  const gap = 16
  const totalWidth = steps.length * (cardWidth + gap) - gap
  
  const leftFadeOpacity = useTransform(x, [-100, 0], [1, 0])
  const rightFadeOpacity = useTransform(x, [-(totalWidth - 320), -(totalWidth - 220)], [0, 1])

  return (
    <div className="relative -mx-4 sm:hidden">
      <motion.div
        ref={containerRef}
        className="flex gap-4 px-4 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -(totalWidth - 280), right: 0 }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        style={{ x }}
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="shrink-0 w-[280px] group relative"
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="h-full p-5 bg-gradient-to-br from-purple-950/50 to-violet-900/20 backdrop-blur-xl border border-purple-500/15 flex flex-col"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
            >
              {/* Step number + title */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-display text-2xl text-purple-400/80">{step.number}</span>
                <h3 className="font-display text-lg text-purple-50">
                  {step.title}
                </h3>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <p className="text-purple-100/60 font-body text-sm leading-relaxed mb-2 flex-1">
                  {step.description}
                </p>
                <p className="text-purple-300/40 font-body text-xs">
                  {step.detail}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
    </div>
  )
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  
  // Parallax effect - HowItWorks: strong depth
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['-30%', '30%'])

  return (
    <section ref={sectionRef} id="process" className="relative py-20 sm:py-28 md:py-36 bg-ap-charcoal overflow-hidden">
      {/* Studio background image - prominent - PARALLAX */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
        style={{ 
          backgroundImage: 'url(/studio-producer-playing-midi-keyboard-puple-ambient-light.jpg)',
          y: backgroundY
        }}
      />
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-ap-charcoal/70 via-ap-charcoal/40 to-ap-black/70" />
      {/* Lens effect overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url(/lense-effect-transparent-graphic-background.png)' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header - Centered like Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <span className="text-purple-400/60 font-body text-xs sm:text-sm uppercase tracking-[0.2em] mb-4 sm:mb-6 block">
            The Process
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display tracking-tight mb-6">
            <span className="block text-white">FROM IDEA</span>
            <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">TO RELEASE</span>
          </h2>
          
          <p className="text-white/60 font-body text-lg sm:text-xl max-w-2xl mx-auto mb-10 sm:mb-12">
            Four steps. Clear handoffs. You always know what&apos;s happening and what comes next.
          </p>

          {/* Quick stats - Horizontal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-16 px-6 py-4 sm:px-8 sm:py-5 bg-purple-950/40 backdrop-blur-sm rounded-2xl border border-purple-500/20"
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-display bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent">2min</div>
              <div className="text-purple-300/50 font-body text-xs sm:text-sm mt-1">to book</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-display bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent">4-7d</div>
              <div className="text-purple-300/50 font-body text-xs sm:text-sm mt-1">mix turnaround</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-display bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent">24h</div>
              <div className="text-purple-300/50 font-body text-xs sm:text-sm mt-1">rush available</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile Carousel */}
        <MobileCarousel />

        {/* Desktop Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} isLast={index === steps.length - 1} />
          ))}
        </motion.div>
      </div>

    </section>
  )
}
