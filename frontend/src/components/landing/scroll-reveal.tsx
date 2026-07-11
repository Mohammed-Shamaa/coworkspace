'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

type ScrollRevealProps = {
  children: React.ReactNode
  delay?: number
  yOffset?: number
  duration?: number
  className?: string
}

export default function ScrollReveal({
  children,
  delay = 0,
  yOffset = 30,
  duration = 0.5,
  className,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
