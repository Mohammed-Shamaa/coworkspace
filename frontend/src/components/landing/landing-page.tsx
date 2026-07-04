'use client'
import dynamic from 'next/dynamic'
import { useScrollDirection } from '@/lib/use-scroll-direction'
import Navbar from './navbar'
import Hero from './hero'
const Footer = dynamic(() => import('./footer'))

const Features = dynamic(() => import('./features'), { ssr: false })
const HowItWorks = dynamic(() => import('./how-it-works'), { ssr: false })
const DashboardPreview = dynamic(() => import('./dashboard-preview'), { ssr: false })
const Benefits = dynamic(() => import('./benefits'), { ssr: false })
const CTASection = dynamic(() => import('./cta-section'), { ssr: false })

export default function LandingPage() {
  const dir = useScrollDirection()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <Hero dir={dir} />
      <Features dir={dir} />
      <HowItWorks dir={dir} />
      <DashboardPreview dir={dir} />
      <Benefits dir={dir} />
      <CTASection dir={dir} />
      <Footer />
    </div>
  )
}
