"use client"

import { ArrowRight, TrendingUp, Zap, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function LandingHero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background to-muted px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-md animate-in fade-in duration-500">
          <span className="text-primary-foreground text-sm font-medium">New: Advanced Analytics Dashboard</span>
          <ArrowRight className="w-4 h-4 text-primary-foreground" />
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Take Control of Your{" "}
          <span className="bg-gradient-to-r from-primary to-purple-500 dark:from-primary-foreground dark:to-purple-300 bg-clip-text text-transparent">
            Financial Future
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          Track expenses, visualize spending patterns, and make smarter financial decisions with our beautiful,
          intuitive expense tracker.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link href="/login">
            <Button size="lg" className="group bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8">
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Learn More
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Real-time Tracking</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors">
            <BarChart3 className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Advanced Analytics</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors">
            <Zap className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Lightning Fast</p>
          </div>
        </div>
      </div>
    </section>
  )
}