'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion'
import { Mic2, Sliders, Sparkles, Music, Headphones, Zap, ArrowRight, Check } from 'lucide-react'
import BookingModal from './BookingModal'

// Service categories for the new layout
const serviceCategories = [
  {
    id: 'recording',
    icon: Mic2,
    title: 'Recording Session',
    subtitle: 'In-Studio',
    description: 'Professional recording in our acoustic-treated space with top-tier equipment.',
    features: ['Vocal booth & live room', 'Pro microphones & preamps', 'Real-time monitoring'],
    highlight: 'Book by the hour',
  },
  {
    id: 'engineering',
    icon: Sliders,
    title: 'Recording Engineer',
    subtitle: 'Optional Add-on',
    description: 'Work with our in-house engineer to capture the perfect take.',
    features: ['Session setup & teardown', 'Professional tracking', 'Technical guidance'],
    highlight: 'Recommended for artists',
  },
  {
    id: 'production',
    icon: Sparkles,
    title: 'Session Producer',
    subtitle: 'Creative Partner',
    description: 'Elevate your session with real-time production and creative direction.',
    features: ['Arrangement & editing', 'Instrumental production', 'Artistic collaboration'],
    highlight: 'Take your music further',
  },
]

const postProductionServices = [
  {
    id: 'mixing',
    icon: Headphones,
    title: 'Mixing',
    description: 'Full stereo mix with vocal tuning and revisions included.',
  },
  {
    id: 'mastering',
    icon: Music,
    title: 'Mastering',
    description: 'Release-ready master optimized for all streaming platforms.',
  },
  {
    id: 'bundle',
    icon: Zap,
    title: 'Mix + Master Bundle',
    description: 'Complete package with extra revisions, vocal editing, and stems export.',
    featured: true,
  },
]

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

// Mobile Carousel for IN-STUDIO services
function InStudioMobileCarousel() {
  const x = useMotionValue(0)
  const cardWidth = 280
  const gap = 16
  const totalWidth = serviceCategories.length * (cardWidth + gap) - gap

  return (
    <div className="relative -mx-4 sm:hidden">
      <motion.div
        className="flex gap-4 px-4 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -(totalWidth - 280), right: 0 }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        style={{ x }}
      >
        {serviceCategories.map((service) => {
          const Icon = service.icon
          return (
            <motion.div
              key={service.id}
              className="shrink-0 w-[280px] group relative"
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="h-full p-5 bg-gradient-to-br from-amber-950/40 to-yellow-900/15 backdrop-blur-xl border border-amber-500/15"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2.5 bg-amber-400/10 rounded-xl">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-white mb-0.5">{service.title}</h4>
                    <span className="text-amber-400/60 text-xs uppercase tracking-wider">{service.subtitle}</span>
                  </div>
                </div>
                <p className="text-amber-200/50 font-body text-sm mb-4">{service.description}</p>
                <div className="space-y-1.5 mb-4">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-amber-100/60 text-sm">
                      <Check className="w-3 h-3 text-amber-400/70 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-amber-500/20">
                  <span className="text-amber-400 font-display text-sm">{service.highlight}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

// Mobile Carousel for POST-PRODUCTION services
function PostProductionMobileCarousel() {
  const x = useMotionValue(0)
  const cardWidth = 280
  const gap = 16
  const totalWidth = postProductionServices.length * (cardWidth + gap) - gap

  return (
    <div className="relative -mx-4 sm:hidden">
      <motion.div
        className="flex gap-4 px-4 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -(totalWidth - 280), right: 0 }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        style={{ x }}
      >
        {postProductionServices.map((service) => {
          const Icon = service.icon
          const isFeatured = service.featured
          return (
            <motion.div
              key={service.id}
              className="shrink-0 w-[280px] group relative"
              whileTap={{ scale: 0.98 }}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-amber-400 text-black font-display text-xs uppercase tracking-wider px-3 py-0.5">
                    Best Value
                  </span>
                </div>
              )}
              <div 
                className={`h-full p-5 backdrop-blur-xl ${isFeatured 
                  ? 'bg-gradient-to-br from-amber-600/25 via-yellow-600/15 to-amber-900/25 border-2 border-amber-500/40 mt-1' 
                  : 'bg-gradient-to-br from-sky-950/30 to-blue-900/15 border border-sky-500/15'
                }`}
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
              >
                <div className="flex items-start gap-3 mb-3 mt-1">
                  <div className={`p-2.5 rounded-xl ${isFeatured ? 'bg-amber-400/15' : 'bg-sky-400/10'}`}>
                    <Icon className={`w-5 h-5 ${isFeatured ? 'text-amber-400' : 'text-sky-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-white">{service.title}</h4>
                  </div>
                </div>
                <p className={`font-body text-sm ${isFeatured ? 'text-amber-200/60' : 'text-sky-200/50'}`}>
                  {service.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default function Pricing() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])

  return (
    <section ref={sectionRef} id="pricing" className="relative py-20 sm:py-28 md:py-36 bg-ap-black overflow-hidden">
      {/* Studio background image - PARALLAX */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ 
          backgroundImage: 'url(/studio-view-from-the-window.jpg)',
          y: backgroundY
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ap-black/70 via-ap-black/50 to-ap-charcoal/70" />
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url(/lense-effect-transparent-graphic-background.png)' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <span className="text-amber-400/60 font-body text-xs sm:text-sm uppercase tracking-[0.2em] mb-4 sm:mb-6 block">
            Our Services
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display tracking-tight mb-6">
            <span className="block text-white">EVERYTHING YOU NEED</span>
            <span className="block bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">TO CREATE YOUR SOUND</span>
          </h2>
          
          <p className="text-white/60 font-body text-lg sm:text-xl max-w-2xl mx-auto">
            From recording to release-ready masters. Build your session exactly how you want it.
          </p>
        </motion.div>

        {/* Session Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 sm:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10">
            <h3 className="font-display text-xl sm:text-2xl text-white">IN-STUDIO</h3>
            <span className="text-amber-400/50 font-body text-sm">Hourly Sessions</span>
          </div>
          
          {/* Mobile Carousel */}
          <InStudioMobileCarousel />
          
          {/* Desktop Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {serviceCategories.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div 
                    className="h-full p-6 sm:p-8 bg-gradient-to-br from-amber-950/40 to-yellow-900/15 backdrop-blur-xl border border-amber-500/15 hover:border-amber-400/40 transition-all duration-500"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
                  >
                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-amber-400/10 rounded-xl group-hover:bg-amber-400/20 transition-colors">
                        <Icon className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-display text-lg sm:text-xl text-white mb-0.5">{service.title}</h4>
                        <span className="text-amber-400/60 text-xs uppercase tracking-wider">{service.subtitle}</span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-amber-200/50 font-body text-sm mb-5">
                      {service.description}
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-2 mb-5">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-amber-100/60 text-sm">
                          <Check className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Highlight */}
                    <div className="pt-4 border-t border-amber-500/20">
                      <span className="text-amber-400 font-display text-sm">{service.highlight}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Post-Production Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16 sm:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10">
            <h3 className="font-display text-xl sm:text-2xl text-white">POST-PRODUCTION</h3>
            <span className="text-sky-400/50 font-body text-sm">Per Song</span>
          </div>
          
          {/* Mobile Carousel */}
          <PostProductionMobileCarousel />
          
          {/* Desktop Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {postProductionServices.map((service, index) => {
              const Icon = service.icon
              const isFeatured = service.featured
              return (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-amber-400 text-black font-display text-xs uppercase tracking-wider px-4 py-1">
                        Best Value
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className={`h-full p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 ${
                      isFeatured 
                        ? 'bg-gradient-to-br from-amber-600/25 via-yellow-600/15 to-amber-900/25 border-2 border-amber-500/40 hover:border-amber-400/60' 
                        : 'bg-gradient-to-br from-sky-950/30 to-blue-900/15 border border-sky-500/15 hover:border-sky-400/40'
                    }`}
                    style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
                  >
                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 mb-4 mt-1">
                      <div className={`p-3 rounded-xl transition-colors ${isFeatured ? 'bg-amber-400/15 group-hover:bg-amber-400/25' : 'bg-sky-400/10 group-hover:bg-sky-400/20'}`}>
                        <Icon className={`w-6 h-6 ${isFeatured ? 'text-amber-400' : 'text-sky-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-display text-lg sm:text-xl text-white">{service.title}</h4>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className={`font-body text-sm ${isFeatured ? 'text-amber-200/60' : 'text-sky-200/50'}`}>
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-16 sm:mb-20"
        >
          <h3 className="font-display text-lg sm:text-xl text-white/50 mb-6 text-center">ALSO AVAILABLE</h3>
          
          <div className="flex flex-wrap justify-center gap-3">
            {['Vocal Tuning', 'Vocal Editing', 'Stems Export', 'Alt Versions', 'Rush Delivery'].map((item, index) => (
              <div 
                key={index}
                className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-white/60 font-body text-sm hover:border-amber-500/30 hover:text-white/80 transition-colors"
              >
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-white/50 font-body text-sm mb-4">
            See exact pricing when you build your session
          </p>
          <button
            onClick={() => setIsBookingOpen(true)}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-amber-400 font-display text-black uppercase tracking-wider transition-all duration-300 hover:bg-white hover:scale-105"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <span>BUILD YOUR SESSION</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-white/40 font-body text-sm mt-4">
            À la carte pricing • No hidden fees • Pay only for what you need
          </p>
        </motion.div>
      </div>

      {/* Booking Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </section>
  )
}
