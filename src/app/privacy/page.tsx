'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Cookie, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-ap-black text-white">
      {/* Header */}
      <div className="bg-ap-charcoal/50 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
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
            <Link 
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white/10 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-display tracking-tight">PRIVACY POLICY</h1>
              <p className="text-white/50 text-sm mt-1">Last updated: January 9, 2026</p>
            </div>
          </div>

          {/* Policy Content */}
          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-xl font-display text-white mb-4">1. INTRODUCTION</h2>
              <p className="text-white/70 leading-relaxed">
                Alliance Productions Records Inc. (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website allianceproductions.ca and use our recording studio services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display text-white mb-4">2. INFORMATION WE COLLECT</h2>
              <p className="text-white/70 leading-relaxed mb-4">We may collect the following types of information:</p>
              
              <h3 className="text-lg font-medium text-white/90 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                <li>Name and contact information (email, phone number)</li>
                <li>Booking preferences and session details</li>
                <li>Social media handles (Instagram, if provided)</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h3 className="text-lg font-medium text-white/90 mb-2">Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Device and browser information</li>
                <li>IP address and approximate location</li>
                <li>Pages visited and time spent on our website</li>
                <li>Referral sources and search terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display text-white mb-4">3. HOW WE USE YOUR INFORMATION</h2>
              <p className="text-white/70 leading-relaxed mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Process and manage your studio session bookings</li>
                <li>Communicate with you about your sessions and our services</li>
                <li>Send promotional materials (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Analyze website traffic and user behavior via Google Analytics</li>
                <li>Provide customer support through our chat widget</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display text-white mb-4 flex items-center gap-2">
                <Cookie className="w-5 h-5" />
                4. COOKIES AND TRACKING
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Our website uses cookies and similar tracking technologies to enhance your experience. These include:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 mb-4">
                <li><strong className="text-white/90">Essential Cookies:</strong> Required for website functionality</li>
                <li><strong className="text-white/90">Analytics Cookies:</strong> Google Analytics to understand how visitors use our site</li>
                <li><strong className="text-white/90">Chat Widget Cookies:</strong> OpenWidget for customer support functionality</li>
              </ul>
              <p className="text-white/70 leading-relaxed">
                You can control cookies through your browser settings. Disabling certain cookies may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display text-white mb-4">5. THIRD-PARTY SERVICES</h2>
              <p className="text-white/70 leading-relaxed mb-4">We use the following third-party services:</p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li><strong className="text-white/90">Google Analytics:</strong> Website analytics and traffic analysis</li>
                <li><strong className="text-white/90">OpenWidget:</strong> Live chat support functionality</li>
                <li><strong className="text-white/90">Fibery:</strong> Booking form processing</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                These services have their own privacy policies governing their use of your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display text-white mb-4">6. DATA RETENTION</h2>
              <p className="text-white/70 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Booking records are retained for business and tax purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display text-white mb-4">7. YOUR RIGHTS</h2>
              <p className="text-white/70 leading-relaxed mb-4">Under Canadian privacy law (PIPEDA) and Quebec&apos;s Law 25, you have the right to:</p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Access your personal information we hold</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Lodge a complaint with the Privacy Commissioner of Canada</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display text-white mb-4">8. DATA SECURITY</h2>
              <p className="text-white/70 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our website uses HTTPS encryption for all data transmission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display text-white mb-4">9. CONTACT US</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
                <p className="font-display text-white text-lg">ALLIANCE PRODUCTIONS RECORDS INC.</p>
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin className="w-4 h-4 text-white/50" />
                  <span>111 Rue Chabanel O, Montréal, QC H2N 1C8</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Phone className="w-4 h-4 text-white/50" />
                  <a href="tel:+15143979912" className="hover:text-white transition-colors">(514) 397-9912</a>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Mail className="w-4 h-4 text-white/50" />
                  <a href="mailto:contact@allianceproductions.ca" className="hover:text-white transition-colors">contact@allianceproductions.ca</a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display text-white mb-4">10. CHANGES TO THIS POLICY</h2>
              <p className="text-white/70 leading-relaxed">
                We may update this Privacy Policy from time to time. The updated version will be indicated by an updated &quot;Last updated&quot; date at the top of this page. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

          </div>

          {/* Back to Home */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
