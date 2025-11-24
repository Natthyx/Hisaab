"use client"

import { useEffect, useState } from "react"

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "$2.5B", label: "Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
]

export function LandingStats() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(true)
  }, [])

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-muted via-primary/10 to-muted border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{animated ? stat.value : "0"}</div>
              <p className="text-muted-foreground text-sm sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}