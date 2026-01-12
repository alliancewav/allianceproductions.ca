'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const missionStatements = [
  {
    text: "At AP, we believe that every artist deserves access to professional-grade recording and production services.",
    highlight: "every artist",
  },
  {
    text: "With industry-standard equipment, expert engineers, and a passion for music, we're committed to helping you create something extraordinary.",
    highlight: "something extraordinary",
  },
  {
    text: "Whether you're an emerging artist or an established name, we're here to elevate your sound and help you stand out in the industry.",
    highlight: "elevate your sound",
  },
]

export default function Mission() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.35], [0, 1, 1])
  const opacity2 = useTransform(scrollYProgress, [0.25, 0.45, 0.6], [0, 1, 1])
  const opacity3 = useTransform(scrollYProgress, [0.5, 0.7, 0.85], [0, 1, 1])
  
  const y1 = useTransform(scrollYProgress, [0, 0.2], [50, 0])
  const y2 = useTransform(scrollYProgress, [0.25, 0.45], [50, 0])
  const y3 = useTransform(scrollYProgress, [0.5, 0.7], [50, 0])

  const opacities = [opacity1, opacity2, opacity3]
  const yTransforms = [y1, y2, y3]

  return (
    <section 
      ref={containerRef}
      className="relative py-32 md:py-48 bg-ap-black overflow-hidden"
    >
      {/* Background video overlay simulation */}
      <div className="absolute inset-0 bg-gradient-to-b from-ap-charcoal via-ap-black to-ap-black" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], [0, -200]),
          }}
          className="absolute top-1/3 -left-32 w-64 h-64 bg-ap-red/5 rounded-full blur-3xl"
        />
        <motion.div
          style={{ 
            y: useTransform(scrollYProgress, [0, 1], [0, -100]),
          }}
          className="absolute bottom-1/3 -right-32 w-96 h-96 bg-ap-red/3 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-16"
        >
          <div className="w-12 h-px bg-ap-red" />
          <span className="text-ap-red font-body text-sm uppercase tracking-[0.3em]">
            Our Mission
          </span>
        </motion.div>

        {/* Mission statements with parallax */}
        <div className="max-w-5xl space-y-16 md:space-y-24">
          {missionStatements.map((statement, index) => (
            <motion.div
              key={index}
              style={{ 
                opacity: opacities[index],
                y: yTransforms[index],
              }}
            >
              <p className="text-2xl md:text-3xl lg:text-4xl font-body leading-relaxed text-white/50">
                {statement.text.split(statement.highlight).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="text-white font-semibold">
                        {statement.highlight}
                      </span>
                    )}
                  </span>
                ))}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Decorative element */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-24 h-px bg-gradient-to-r from-ap-red via-ap-red/50 to-transparent origin-left max-w-md"
        />
      </div>
    </section>
  )
}
