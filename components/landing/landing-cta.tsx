"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function LandingCTA() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
          Start Managing Your Money{" "}
          <span className="bg-gradient-to-r from-primary to-purple-500 dark:from-primary-foreground dark:to-purple-300 bg-clip-text text-transparent">Today</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-10 text-balance">
          Join thousands of users who are taking control of their finances. It's free, fast, and completely secure.
        </p>

        <Link href="/login">
          <Button size="lg" className="group bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8">
            Get Started Now
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>

        <p className="text-muted-foreground text-sm mt-6">No credit card required. Set up in 30 seconds.</p>
      </div>
    </section>
  )
}