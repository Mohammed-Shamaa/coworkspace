'use client'
import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import type { MutableRefObject } from 'react'

const contentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export default function Hero({ dir }: { dir: MutableRefObject<'down' | 'up'> }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()
  const prefersReduced = useReducedMotion()
  const imageY = useTransform(scrollY, [0, 600], [0, prefersReduced ? 0 : 40])
  const overlayOpacity = useTransform(scrollY, [0, 400], [1, prefersReduced ? 1 : 0.85])
  const contentY = useTransform(scrollY, [0, 400], [0, prefersReduced ? 0 : -15])
  const contentOpacity = useTransform(scrollY, [0, 300], [1, prefersReduced ? 1 : 0.95])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ y: imageY }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
        />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
            About Me
          </span>
        </motion.div>

        <motion.h1
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          About Me
        </motion.h1>

        <motion.p
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-200 md:text-xl"
        >
          Building a global coworking platform from Gaza, connecting people, ideas, and opportunities worldwide.
        </motion.p>

        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/auth/register"
            className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-gray-900 shadow-lg transition-all hover:bg-gray-100"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            Sign In
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-white to-transparent dark:from-gray-950" />
    </section>
  )
}
