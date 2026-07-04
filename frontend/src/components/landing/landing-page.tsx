'use client'
import Navbar from './navbar'
import Hero from './hero'
import Features from './features'
import HowItWorks from './how-it-works'
import DashboardPreview from './dashboard-preview'
import Benefits from './benefits'
import CTASection from './cta-section'
import Footer from './footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <Benefits />
      <CTASection />
      <Footer />
    </div>
  )
}
