'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Plus, Minus, MessageCircle, Phone } from 'lucide-react'

// Colors extracted from background image (studio-booth-table-with-green-and-pink-neon-sign)
// Dominant: neon pink #EC4899, magenta #D946EF, neon green accent #22C55E, deep purple #7C3AED

const faqs = [
  {
    question: 'What does a session include?',
    answer: 'Studio workspace ($35/hr) plus engineer assistance ($23/hr). Producer direction available as add-on ($27/hr). Mixing and mastering are separate per-song services. All pricing visible before you book.',
  },
  {
    question: 'Do I need to bring my own producer or engineer?',
    answer: 'No. Our in-house team handles recording, mixing, and production. Bring your own if you prefer, but you don\'t need to source anyone externally.',
  },
  {
    question: 'What\'s your cancellation policy?',
    answer: 'Reschedule free with 24-hour notice. Arriving 30+ minutes late may be treated as a no-show ($60 fee). Time beyond your booked slot is billed as overtime ($35 per 30 min). No contracts.',
  },
  {
    question: 'How do revisions and rush delivery work?',
    answer: 'Each service includes 1 revision. Additional revisions are $5-$10 each. Standard turnaround is 4-7 days. Rush delivery: 48h ($50) or 24h ($100) where feasible.',
  },
  {
    question: 'How do I get beats or custom instrumentals?',
    answer: 'Browse our catalog at open.beatpass.ca for ready-to-license beats. For custom production, book a consultation and we\'ll scope the project with clear pricing upfront.',
  },
  {
    question: 'What should I bring to my session?',
    answer: 'Bring your lyrics, reference tracks, and any specific ideas for your sound. We provide all equipment including microphones, headphones, and instruments. Water and snacks available on-site.',
  },
  {
    question: 'Can I record a full album or EP here?',
    answer: 'Absolutely. We handle projects of any size from singles to full albums. For larger projects, we can discuss package pricing and dedicated time blocks to keep your sessions efficient and cost-effective.',
  },
  {
    question: 'Do you offer remote mixing and mastering?',
    answer: 'Yes. Upload your stems through our secure portal and we\'ll handle the rest. Same quality, same turnaround. Perfect for artists who recorded elsewhere or want post-production without traveling.',
  },
  {
    question: 'What genres do you specialize in?',
    answer: 'Our team works across hip-hop, R&B, pop, electronic, and alternative. We\'ve mixed everything from trap beats to acoustic ballads. If you\'re unsure, send us a reference track and we\'ll confirm we\'re the right fit.',
  },
  {
    question: 'Where are you located?',
    answer: '111 Rue Chabanel O, Montréal, QC H2N 1C8. Accessible by metro, street parking available. Call (514) 397-9912 for directions.',
  },
]

interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
  index: number
}

function AccordionItem({ question, answer, isOpen, onClick, index }: AccordionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <div className={`relative mb-3 backdrop-blur-xl transition-all duration-500 ${
        isOpen 
          ? 'bg-gradient-to-br from-fuchsia-950/50 to-pink-900/25 border-2 border-fuchsia-500/30' 
          : 'bg-gradient-to-br from-fuchsia-950/30 to-pink-900/10 border border-fuchsia-500/15 hover:border-fuchsia-400/30'
      }`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
      >
        <button
          onClick={onClick}
          className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4"
          aria-expanded={isOpen}
        >
          <div className="flex items-start gap-4">
            {/* Question number */}
            <span className={`font-display text-sm shrink-0 mt-1 transition-colors duration-300 ${
              isOpen ? 'text-fuchsia-400' : 'text-fuchsia-500/40'
            }`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={`font-display text-lg sm:text-xl transition-colors duration-300 ${
              isOpen ? 'text-fuchsia-100' : 'text-fuchsia-50/80 group-hover:text-white'
            }`}>
              {question}
            </span>
          </div>
          <div className="shrink-0 w-8 h-8 flex items-center justify-center text-fuchsia-400/60">
            {isOpen ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </div>
        </button>
        
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pl-14 sm:pl-16">
                <p className="text-fuchsia-100/60 font-body text-sm sm:text-base leading-relaxed">
                  {answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </motion.div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const sectionRef = useRef<HTMLElement>(null)
  
  // Parallax effect - FAQ: medium-strong depth
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['-22%', '22%'])

  return (
    <section ref={sectionRef} id="faq" className="relative py-20 sm:py-28 md:py-36 bg-ap-black overflow-hidden">
      {/* Studio background image - prominent - PARALLAX */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
        style={{ 
          backgroundImage: 'url(/studio-booth-table-with-green-and-pink-neon-sign-and-studio-teddy-bear-with-money-bills-texture-purple-ambient-light.jpg)',
          y: backgroundY
        }}
      />
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-ap-black/70 via-ap-black/50 to-ap-charcoal/70" />
      {/* Lens effect overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url(/lense-effect-transparent-graphic-background.png)' }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header - Centered like other sections */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <span className="text-fuchsia-400/60 font-body text-xs sm:text-sm uppercase tracking-[0.2em] mb-4 sm:mb-6 block">
            FAQ
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display tracking-tight mb-6">
            <span className="block text-white">FREQUENTLY ASKED</span>
            <span className="block bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">QUESTIONS</span>
          </h2>
          
          <p className="text-white/60 font-body text-lg sm:text-xl max-w-2xl mx-auto">
            Quick answers to common questions. Still unsure? We&apos;re here to help.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              index={index}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="inline-flex flex-wrap justify-center gap-4 sm:gap-6 px-6 py-5 bg-gradient-to-br from-fuchsia-950/50 to-pink-900/20 backdrop-blur-sm rounded-2xl border border-fuchsia-500/20">
            <a 
              href="tel:+15143979912" 
              className="flex items-center gap-2 text-fuchsia-200/70 hover:text-fuchsia-100 transition-colors font-body text-sm"
            >
              <Phone className="w-4 h-4 text-fuchsia-400" />
              <span>(514) 397-9912</span>
            </a>
            <span className="text-fuchsia-500/30 hidden sm:inline">|</span>
            <a 
              href="https://instagram.com/alliance.wav" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-fuchsia-200/70 hover:text-fuchsia-100 transition-colors font-body text-sm"
            >
              <MessageCircle className="w-4 h-4 text-fuchsia-400" />
              <span>DM on Instagram</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
