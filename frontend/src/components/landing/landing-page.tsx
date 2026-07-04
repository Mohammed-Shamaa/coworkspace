'use client'
import { useScrollDirection } from '@/lib/use-scroll-direction'
import Navbar from './navbar'
import Hero from './hero'
import Features from './features'
import HowItWorks from './how-it-works'
import DashboardPreview from './dashboard-preview'
import Benefits from './benefits'
import CTASection from './cta-section'
import Footer from './footer'

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
