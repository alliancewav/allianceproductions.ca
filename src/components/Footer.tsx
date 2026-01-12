'use client'

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Instagram, Mail, MapPin, Phone, Facebook, Youtube, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import BookingModal from './BookingModal'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const footerRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end start"]
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  const navItems = [
    { label: 'Why Choose Us', href: '#why-choose-us' },
    { label: 'The Process', href: '#process' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Producers', href: '#producers' },
    { label: 'FAQ', href: '#faq' },
  ]
  
  const socials = [
    { href: 'https://www.instagram.com/alliance.wav/', label: 'Instagram', icon: Instagram },
    { href: 'https://www.facebook.com/Alliancewav', label: 'Facebook', icon: Facebook },
    { href: 'https://www.tiktok.com/@alliance.wav', label: 'TikTok', icon: 'tiktok' },
    { href: 'https://youtube.com/@alliancewav', label: 'YouTube', icon: Youtube },
    { href: 'https://x.com/Alliancewav', label: 'X', icon: 'x' },
    { href: 'https://github.com/alliancewav', label: 'GitHub', icon: 'github' },
    { href: 'mailto:contact@allianceproductions.ca', label: 'Email', icon: Mail },
  ]

  return (
    <footer ref={footerRef} className="relative bg-ap-charcoal pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-6 overflow-hidden">
      {/* Background */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-bottom bg-no-repeat opacity-15"
        style={{ 
          backgroundImage: 'url(/studio-control-desk-view-from-the-back-with-engineer-working-purple-red-ambient-backlit-wall.jpg)',
          y: backgroundY
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ap-charcoal via-ap-charcoal/95 to-transparent" />
      
      {/* CTA Banner - Angular design */}
      <div className="container mx-auto px-4 sm:px-6 mb-10 sm:mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden"
          style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
            style={{ backgroundImage: 'url(/studio-dj-working-with-dj-table-purple-ambient-light.jpg)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-950/95 via-indigo-950/80 to-violet-950/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),_transparent_50%)]" />
          {/* Angular accent lines */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
          
          <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display tracking-tight">
                <span className="text-white">READY TO </span>
                <span className="bg-gradient-to-r from-violet-400 to-orange-400 bg-clip-text text-transparent">CREATE?</span>
              </h2>
              <p className="text-violet-200/50 font-body text-sm sm:text-base mt-2 max-w-md">
                Book your session and bring your music to life.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 text-white font-display uppercase tracking-wider text-sm transition-all duration-300 hover:bg-violet-400 hover:scale-[1.02]"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
              >
                <span>BOOK NOW</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="https://open.beatpass.ca/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 font-display text-white uppercase tracking-wider text-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
              >
                <span>EXPLORE BEATS</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Footer - with left margin on mobile for floating buttons */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 mb-8 pl-14 sm:pl-0">
          
          {/* Brand + Socials - Left */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/30 blur-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }} />
                <Image
                  src="/AP-white-logo.svg"
                  alt="Alliance Productions"
                  width={40}
                  height={40}
                  className="relative w-9 h-9 sm:w-10 sm:h-10"
                />
              </div>
              <div>
                <h3 className="font-display text-sm sm:text-base text-white leading-tight">ALLIANCE PRODUCTIONS</h3>
                <p className="text-violet-400/50 text-xs font-body">Records Inc.</p>
              </div>
            </div>
            <p className="text-white/40 font-body text-sm leading-relaxed mb-4 max-w-xs">
              Your studio copilot for music production. From recording to post-production, we bring your vision to life.
            </p>
            {/* Social Icons - Angular design */}
            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={social.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="w-9 h-9 border border-violet-500/20 flex items-center justify-center text-white/50 hover:text-violet-400 hover:border-violet-400 hover:bg-violet-500/10 transition-all duration-200"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
                  aria-label={social.label}
                >
                  {social.icon === 'tiktok' ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  ) : social.icon === 'x' ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ) : social.icon === 'github' ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  ) : (
                    <social.icon className="w-4 h-4" />
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation - Center */}
          <div className="lg:col-span-4">
            <h4 className="font-display text-xs text-white/60 uppercase tracking-widest mb-3">Navigate</h4>
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-3 py-1.5 text-white/60 font-body text-sm border border-violet-500/20 hover:border-violet-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-200"
                  style={{ borderRadius: '9999px' }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact - Right */}
          <div className="lg:col-span-4 lg:text-right">
            <h4 className="font-display text-xs text-white/60 uppercase tracking-widest mb-3">Contact</h4>
            <div className="space-y-2">
              <a 
                href="https://maps.app.goo.gl/ux3EKTkCz7zNvs7M6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/50 font-body text-sm hover:text-violet-400 transition-colors lg:flex-row-reverse"
              >
                <MapPin className="w-4 h-4 text-violet-400/70 flex-shrink-0" />
                <span>111 Rue Chabanel O, Montréal, QC</span>
              </a>
              <a 
                href="tel:+15143979912"
                className="flex items-center gap-2 text-white/50 font-body text-sm hover:text-violet-400 transition-colors lg:justify-end"
              >
                <Phone className="w-4 h-4 text-violet-400/70 flex-shrink-0 lg:order-2" />
                <span>(514) 397-9912</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar - Angular accent */}
        <div className="pt-4 border-t border-violet-500/20 pl-14 sm:pl-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-white/30 font-body">
              <span>© {currentYear} Alliance Productions Records Inc.</span>
              <Link href="/privacy" className="hover:text-violet-400 transition-colors">
                Privacy
              </Link>
            </div>
            <p className="text-xs text-violet-400/40 font-body">
              Women-owned · Montreal · Since 2020
            </p>
          </div>
        </div>
      </div>
      
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </footer>
  )
}
