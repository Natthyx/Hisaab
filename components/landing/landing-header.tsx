"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">$</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">Hisaab</span>
          </Link>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground rounded-full">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full hidden sm:inline-flex">
                Get Started
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden mt-4 space-y-2 pb-4">
            <Link
              href="#features"
              className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Features
            </Link>
            <a
              href="#"
              className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              About
            </a>
            <div className="px-4 pt-2">
              <ThemeToggle />
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}