import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingStats } from "@/components/landing/landing-stats"
import { LandingCTA } from "@/components/landing/landing-cta"

export const metadata = {
  title: "Hisaab - Manage Your Finances",
  description: "Take control of your finances with beautiful expense tracking, advanced analytics, and smart insights.",
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <LandingHero />
      <LandingStats />
      <LandingFeatures />
      <LandingCTA />
    </div>
  )
}