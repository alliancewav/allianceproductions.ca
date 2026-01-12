'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useTransform, useScroll } from 'framer-motion'
import { MapPin, Mic2, Users, Music2 } from 'lucide-react'

// Colors extracted from background image (studio-control-desk-view-from-the-back-with-engineer-working-orange-red-ambient-backlit-wall.jpg)
// Dominant: deep orange #D4622E, warm amber #C9854A, burnt sienna #A34A2A, charcoal shadows
const PALETTE = {
  accent: 'orange-400',       // warm orange for highlights
  accentMuted: 'orange-300',  // softer orange
  glow: 'orange-500',         // for glows/shadows
  warmWhite: 'orange-50',     // warm tinted white
}

const features = [
  {
    icon: MapPin,
    title: 'Heart of Montreal',
    subtitle: '111 Rue Chabanel O',
    description: 'Located in the Chabanel district. Easy access by metro, parking available. Walk in, record, walk out.',
  },
  {
    icon: Mic2,
    title: 'Pro-Grade Setup',
    subtitle: 'Acoustics Built for Clarity',
    description: 'Treated rooms, isolated booths, and calibrated monitoring. Your recordings sound right the first time.',
  },
  {
    icon: Users,
    title: 'One Team',
    subtitle: 'Recording to Final Master',
    description: 'Engineers and producers who work together daily. No handoff confusion. Consistent sound from session one to release.',
  },
  {
    icon: Users,
    title: 'Women-Owned',
    subtitle: 'Operating Since 2020',
    description: 'Independent studio built by artists, for artists. We understand deadlines, budgets, and creative pressure.',
  },
  {
    icon: Music2,
    title: 'Beats On Demand',
    subtitle: 'Licensed or Custom',
    description: 'Browse ready-to-license instrumentals or commission custom production. Clear pricing, instant delivery.',
  },
  {
    title: 'Book in 2 Minutes',
    subtitle: 'No Contracts Required',
    description: 'Pick your time, confirm online, show up. Reschedule or cancel with 24-hour notice. No penalties.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
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

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const IconComponent = feature.icon
  return (
    <motion.div
      variants={itemVariants}
      className="group relative p-6 sm:p-8 bg-gradient-to-br from-orange-950/40 to-orange-900/20 backdrop-blur-xl border border-orange-500/15 hover:border-orange-400/30 transition-all duration-500"
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
    >
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-4">
          {IconComponent && (
            <IconComponent className="w-5 h-5 text-orange-400/70 mt-1 shrink-0" />
          )}
          <div>
            <h3 className="font-display text-xl sm:text-2xl text-orange-50 group-hover:text-white transition-colors">
              {feature.title}
            </h3>
            <p className="text-orange-300/50 font-body text-xs uppercase tracking-wider mt-1">
              {feature.subtitle}
            </p>
          </div>
        </div>
        <p className="text-orange-100/50 font-body text-sm sm:text-base leading-relaxed group-hover:text-orange-100/70 transition-colors duration-300">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}

function MobileCarousel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  
  const cardWidth = 300
  const gap = 16
  const totalWidth = features.length * (cardWidth + gap) - gap
  
  const leftFadeOpacity = useTransform(x, [-100, 0], [1, 0])
  const rightFadeOpacity = useTransform(x, [-(totalWidth - 350), -(totalWidth - 250)], [0, 1])

  return (
    <div className="relative -mx-4 sm:hidden">
      <motion.div
        ref={containerRef}
        className="flex gap-4 px-4 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -(totalWidth - 300), right: 0 }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        style={{ x }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="shrink-0 w-[300px] group relative p-5 bg-gradient-to-br from-orange-950/40 to-orange-900/20 backdrop-blur-xl border border-orange-500/15"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Content */}
            <div>
              <div className="flex items-start gap-2 mb-3">
                {feature.icon && (
                  <feature.icon className="w-4 h-4 text-orange-400/70 mt-1 shrink-0" />
                )}
                <div>
                  <h3 className="font-display text-lg text-orange-50">
                    {feature.title}
                  </h3>
                  <p className="text-orange-300/50 font-body text-xs uppercase tracking-wider mt-0.5">
                    {feature.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-orange-100/50 font-body text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
    </div>
  )
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)
  
  // Parallax effect - Features: medium-strong depth
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['-25%', '25%'])

  return (
    <section ref={sectionRef} id="why-choose-us" className="relative py-20 sm:py-28 md:py-36 bg-ap-charcoal overflow-hidden">
      {/* Studio background image - very prominent - PARALLAX */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
        style={{ 
          backgroundImage: 'url(/studio-control-desk-view-from-the-back-with-engineer-working-orange-red-ambient-backlit-wall.jpg)',
          y: backgroundY
        }}
      />
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-ap-charcoal/70 via-ap-charcoal/40 to-ap-charcoal/70" />
      {/* Lens effect overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url(/lense-effect-transparent-graphic-background.png)' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-20 md:mb-24"
        >
          <span className="text-orange-400/60 font-body text-xs sm:text-sm uppercase tracking-[0.2em] mb-4 sm:mb-6 block">
            Why Choose Us
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display tracking-tight mb-6">
            <span className="block text-white">STOP PIECING</span>
            <span className="block gradient-text-red">IT TOGETHER</span>
          </h2>
          
          <p className="text-white/60 font-body text-lg sm:text-xl max-w-2xl mx-auto">
            One studio. One team. Everything you need from session to release.
          </p>
        </motion.div>

        {/* Mobile Carousel */}
        <MobileCarousel />

        {/* Desktop Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>

    </section>
  )
}
