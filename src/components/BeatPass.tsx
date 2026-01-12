'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, Check } from 'lucide-react'
import Image from 'next/image'

export default function BeatPass() {
  const sectionRef = useRef<HTMLElement>(null)
  
  // Parallax effect - BeatPass: light-medium depth
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])

  return (
    <section ref={sectionRef} id="producers" className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background image with blue hue - PARALLAX */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ 
          backgroundImage: 'url(/beatpass-background-image.jpg)',
          filter: 'hue-rotate(200deg) saturate(1.2)',
          y: backgroundY
        }}
      />
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-ap-charcoal/60 via-ap-charcoal/30 to-ap-black/60" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header - centered like other sections */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="text-blue-400/60 font-body text-xs sm:text-sm uppercase tracking-[0.2em] mb-4 block">
            Producers Network
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display tracking-tight mb-4">
            <span className="text-white">NEED </span>
            <span className="text-blue-400">BEATS?</span>
          </h2>
          <p className="text-blue-100/50 font-body text-base sm:text-lg max-w-2xl mx-auto">
            Stream and download non-exclusive instrumentals from vetted producers. One monthly fee, unlimited access.
          </p>
          <p className="text-blue-200/40 font-body text-xs sm:text-sm mt-3">
            A platform by Alliance Productions
          </p>
        </motion.div>

        {/* Two-column grid for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* BeatPass Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative"
          >
            <div 
              className="relative h-full p-6 sm:p-8 bg-gradient-to-br from-blue-950/50 to-sky-900/25 backdrop-blur-xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-500"
              style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
            >
              {/* Letter Logo */}
              <div className="mb-6">
                <Image
                  src="/BeatPass logo.png"
                  alt="BeatPass"
                  width={180}
                  height={45}
                  className="h-8 sm:h-10 w-auto"
                />
              </div>
              
              {/* Features list */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-blue-100/70">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-body text-sm">Curated catalog from vetted producers</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100/70">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-body text-sm">Unlimited downloads & streaming</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100/70">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-body text-sm">High quality WAV files included</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100/70">
                  <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-body text-sm">One monthly fee, cancel anytime</span>
                </div>
              </div>

              {/* Pricing Info */}
              <p className="text-blue-300/80 font-body text-sm mb-4">
                Membership starts from <span className="text-blue-400 font-semibold">$29/month</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://open.beatpass.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-display uppercase tracking-wider text-sm transition-all"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                >
                  <span>Browse Beats</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </a>
                <a
                  href="https://open.beatpass.ca/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 text-blue-300 hover:text-blue-200 font-display uppercase tracking-wider text-sm transition-all"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                >
                  <span>View Pricing</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </a>
              </div>
              
              {/* Decorative round logo */}
              <div className="absolute top-6 right-6 hidden sm:block opacity-20 group-hover:opacity-30 transition-opacity">
                <Image
                  src="/Logo-BP-Blue-round.png"
                  alt=""
                  width={80}
                  height={80}
                  className="w-16 h-16"
                />
              </div>
            </div>
          </motion.div>

          {/* Discord Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative"
          >
            <div 
              className="relative h-full p-6 sm:p-8 bg-gradient-to-br from-[#5865F2]/30 to-indigo-900/20 backdrop-blur-xl border border-[#5865F2]/25 hover:border-[#5865F2]/50 transition-all duration-500"
              style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
            >
              {/* Discord Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-[#5865F2]/40 flex items-center justify-center shrink-0">
                  <Image
                    src="/Discord-Symbol-White.svg"
                    alt="Discord"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <p className="font-display text-xl sm:text-2xl text-white">
                    PRODUCER NETWORK
                  </p>
                  <p className="text-white/50 font-body text-sm">
                    Join the BeatPass community
                  </p>
                </div>
              </div>
              
              {/* Discord features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-white/60">
                  <Check className="w-4 h-4 text-[#5865F2] shrink-0" />
                  <span className="font-body text-sm">Connect with producers & artists</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Check className="w-4 h-4 text-[#5865F2] shrink-0" />
                  <span className="font-body text-sm">Get feedback on your tracks</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Check className="w-4 h-4 text-[#5865F2] shrink-0" />
                  <span className="font-body text-sm">Early access to new beats</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Check className="w-4 h-4 text-[#5865F2] shrink-0" />
                  <span className="font-body text-sm">100% free access to our network</span>
                </div>
              </div>

              {/* Community Info */}
              <p className="text-[#5865F2]/80 font-body text-sm mb-4">
                Join an <span className="text-[#5865F2] font-semibold">Exclusive Producer Community</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://discord.com/invite/N257QBkSeg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-display uppercase tracking-wider text-sm transition-all"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                >
                  <span>Join Discord</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </a>
                <a
                  href="https://open.beatpass.ca/producer-program"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-[#5865F2]/50 hover:border-[#5865F2] hover:bg-[#5865F2]/10 text-[#5865F2] hover:text-white font-display uppercase tracking-wider text-sm transition-all"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                >
                  <span>Join as a Producer</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
