'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Check, Settings } from 'lucide-react'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'alliance-cookie-consent'

type ConsentState = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: true,
    marketing: false,
  })

  useEffect(() => {
    // Check if consent has already been given
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!savedConsent) {
      // Delay showing the banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const fullConsent: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    saveConsent(fullConsent)
  }

  const handleAcceptNecessary = () => {
    const minimalConsent: ConsentState = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    saveConsent(minimalConsent)
  }

  const handleSavePreferences = () => {
    saveConsent(consent)
  }

  const saveConsent = (consentState: ConsentState) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentState))
    
    // Update Google Analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consentState.analytics ? 'granted' : 'denied',
        ad_storage: consentState.marketing ? 'granted' : 'denied',
      })
    }
    
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[9990] p-4 sm:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-ap-charcoal/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              
              {/* Main Banner */}
              {!showSettings ? (
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                    {/* Icon & Text */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2.5 bg-white/10 rounded-xl shrink-0">
                        <Cookie className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-white mb-1">WE VALUE YOUR PRIVACY</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                          We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. 
                          By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
                          <Link href="/privacy" className="text-white/80 hover:text-white underline underline-offset-2 ml-1">
                            Privacy Policy
                          </Link>
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:shrink-0">
                      <button
                        onClick={() => setShowSettings(true)}
                        className="px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Customize</span>
                      </button>
                      <button
                        onClick={handleAcceptNecessary}
                        className="px-4 py-2.5 text-sm border border-white/20 text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        Necessary Only
                      </button>
                      <button
                        onClick={handleAcceptAll}
                        className="px-5 py-2.5 text-sm bg-white text-black font-medium hover:bg-white/90 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept All</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Settings Panel */
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg text-white">COOKIE PREFERENCES</h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    {/* Necessary Cookies */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="font-medium text-white">Necessary Cookies</p>
                        <p className="text-white/50 text-sm">Required for the website to function properly.</p>
                      </div>
                      <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60">
                        Always On
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="font-medium text-white">Analytics Cookies</p>
                        <p className="text-white/50 text-sm">Help us understand how visitors interact with our website.</p>
                      </div>
                      <button
                        onClick={() => setConsent(prev => ({ ...prev, analytics: !prev.analytics }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          consent.analytics ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <div 
                          className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                            consent.analytics ? 'left-7 bg-black' : 'left-1 bg-white/60'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="font-medium text-white">Marketing Cookies</p>
                        <p className="text-white/50 text-sm">Used to deliver personalized advertisements.</p>
                      </div>
                      <button
                        onClick={() => setConsent(prev => ({ ...prev, marketing: !prev.marketing }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          consent.marketing ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <div 
                          className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                            consent.marketing ? 'left-7 bg-black' : 'left-1 bg-white/60'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="flex-1 px-4 py-2.5 text-sm border border-white/20 text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      className="flex-1 px-4 py-2.5 text-sm bg-white text-black font-medium hover:bg-white/90 rounded-lg transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Add gtag type declaration
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, string>) => void
  }
}
