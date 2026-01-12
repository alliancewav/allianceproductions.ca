'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Home, Headphones } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ap-black text-white flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 grayscale"
          style={{ backgroundImage: 'url(/studio-control-desk-view-from-the-back-with-engineer-working-purple-red-ambient-backlit-wall.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ap-black via-ap-black/80 to-ap-black" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Alliance Productions"
              width={48}
              height={48}
              className="w-10 h-10 object-contain"
            />
            <span className="font-display text-xl tracking-wide">ALLIANCE PRODUCTIONS</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg"
        >
          {/* 404 Number */}
          <div className="relative mb-8">
            <span className="text-[120px] sm:text-[180px] font-display leading-none text-white/5">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-6 bg-white/10 rounded-full backdrop-blur-sm">
                <Headphones className="w-12 h-12 sm:w-16 sm:h-16 text-white/80" />
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl sm:text-4xl font-display tracking-tight mb-4">
            TRACK NOT FOUND
          </h1>
          <p className="text-white/60 text-lg mb-8">
            Looks like this page got lost in the mix. Let&apos;s get you back to the studio.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center gap-2 px-6 py-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/10 py-6">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Alliance Productions Records Inc. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  )
}
