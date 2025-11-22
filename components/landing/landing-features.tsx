"use client"

import { BarChart3, PieChart, TrendingUp, Download, Lock, Zap } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Smart Analytics",
    description: "Get deep insights into your spending patterns with daily, monthly, and yearly analytics views.",
  },
  {
    icon: BarChart3,
    title: "Visual Dashboard",
    description: "Beautiful charts and graphs that make it easy to understand your financial data at a glance.",
  },
  {
    icon: PieChart,
    title: "Category Breakdown",
    description: "Track expenses across multiple categories and see exactly where your money goes.",
  },
  {
    icon: Download,
    title: "Easy Import",
    description: "Quickly add transactions with our intuitive form and categorize them instantly.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your financial data stays private and secure with modern encryption standards.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed with instant updates and smooth animations throughout.",
  },
]

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted"
    >
      {/* Gradient divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Powerful Features,{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 dark:from-primary-foreground dark:to-purple-300 bg-clip-text text-transparent">
              Simplified Design
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Everything you need to manage your finances effortlessly
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border backdrop-blur-md hover:border-primary/50 transition-all duration-300"
              >
                <div className="mb-4 inline-block p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}