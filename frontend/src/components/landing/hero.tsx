'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { MutableRefObject } from 'react'
import { byDirection } from '@/lib/animation-variants'

export default function Hero({ dir }: { dir: MutableRefObject<'down' | 'up'> }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="relative z-10">
            <motion.div
              variants={byDirection(dir.current)}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#1565C0] dark:bg-blue-950">
                All-in-one workspace management
              </span>
            </motion.div>

            <motion.h1
              variants={byDirection(dir.current)}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-gray-100"
            >
              Manage Your Coworking Space{' '}
              <span className="text-[#1565C0]">Efficiently</span>
            </motion.h1>

            <motion.p
              variants={byDirection(dir.current)}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-gray-500 md:text-xl dark:text-gray-400"
            >
              Streamline member management, track attendance, handle reservations, and grow your coworking business — all from one powerful platform.
            </motion.p>

            <motion.div
              variants={byDirection(dir.current)}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/auth/register"
                className="rounded-xl bg-[#1565C0] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#0d47a1] hover:shadow-blue-300 dark:shadow-blue-950"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
              >
                Sign In
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden md:block"
          >
            <div className="relative">
              <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-gray-950/50">
                <div className="rounded-xl bg-gradient-to-br from-[#1565C0]/5 to-blue-50 p-6 dark:from-blue-950/30 dark:to-gray-900">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-2 h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900" />
                        <div className="h-3 w-full rounded bg-gray-200" />
                        <div className="mt-1 h-5 w-10 rounded bg-gray-300" />
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-2 h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900" />
                        <div className="h-3 w-full rounded bg-gray-200" />
                        <div className="mt-1 h-5 w-10 rounded bg-gray-300" />
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-2 h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900" />
                        <div className="h-3 w-full rounded bg-gray-200" />
                        <div className="mt-1 h-5 w-10 rounded bg-gray-300" />
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-24 rounded bg-gray-200" />
                        <div className="h-3 w-16 rounded bg-gray-200" />
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="h-2.5 w-full rounded bg-gray-100" />
                        <div className="h-2.5 w-5/6 rounded bg-gray-100" />
                        <div className="h-2.5 w-4/6 rounded bg-gray-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 -z-10 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-950/30" />
              <div className="absolute -top-4 -left-4 -z-10 h-48 w-48 rounded-full bg-purple-100/40 blur-3xl dark:bg-purple-950/20" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-blue-50/30 blur-3xl dark:bg-blue-950/20" />
        <div className="absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-purple-50/20 blur-3xl dark:bg-purple-950/10" />
      </div>
    </section>
  )
}
