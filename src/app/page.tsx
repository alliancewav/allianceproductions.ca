import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Pricing from '@/components/Pricing'
import BeatPass from '@/components/BeatPass'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'
import BackToTop from '@/components/BackToTop'

export default function Home() {
  return (
    <main className="relative">
      {/* Grain overlay for cinematic texture */}
      <div className="grain-overlay" />
      
      {/* Page sections - wrapped for footer reveal effect (desktop only) */}
      <div className="footer-reveal-wrapper bg-ap-black">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <BeatPass />
        <FAQ />
      </div>
      
      {/* Footer reveals from underneath on desktop, normal on mobile */}
      <div className="footer-reveal">
        <Footer />
      </div>
      
      {/* Back to top button */}
      <BackToTop />
    </main>
  )
}
