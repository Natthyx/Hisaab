"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { HomeIcon, PlusCircleIcon, ListIcon, BarChart3Icon, WalletIcon, LogOutIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ProfileIcon } from "./profile-icon"
import { useRouter } from 'next/navigation'
import { useTheme } from "next-themes"
import { useState, useEffect } from 'react'
import { useLoading } from './loading-overlay'
import { Suspense } from 'react'

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/add", label: "Add Transaction", icon: PlusCircleIcon },
  { href: "/transactions", label: "Transactions", icon: ListIcon },
  { href: "/analytics", label: "Analytics", icon: BarChart3Icon },
  { href: "/accounts", label: "Accounts", icon: WalletIcon },
]

function NavigationContent() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme } = useTheme()
  const { setIsLoading } = useLoading()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  // Reset all loading states when navigation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingStates({})
      // Reset global loading state when navigation completes
      setIsLoading(false)
    }, 100) // Small delay to ensure smooth transition
    
    return () => clearTimeout(timer)
  }, [pathname, setIsLoading])

  const handleNavigation = (href: string) => {
    // Set global loading state
    setIsLoading(true)
    
    // Set loading state for this link
    setLoadingStates(prev => ({ ...prev, [href]: true }))
    
    // Navigate to the page
    router.push(href)
  }

  const handleSignOut = async () => {
    // Set global loading state
    setIsLoading(true)
    
    // Set loading state for signout
    setLoadingStates(prev => ({ ...prev, '/logout': true }))
    
    // Use fetch to call the signout API route instead of importing server-side function
    await fetch('/api/auth/signout', {
      method: 'POST',
    })
    // Redirect to login page
    router.push('/login')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:border-r md:border-t-0">
      <div className="flex h-16 items-center justify-around md:h-full md:flex-col md:gap-1 md:p-2">
        <Link href="/dashboard" className="hidden md:flex items-center gap-2 mb-4 mt-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img 
              src={theme === "dark" ? "/hisaab-logo-white.png" : "/hisaab-logo-main.png"} 
              alt="Hisaab Logo" 
              className="h-5 w-5" 
              suppressHydrationWarning
            />
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:inline">Hisaab</span>
        </Link>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          const isLoading = loadingStates[item.href]
          
          return (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              disabled={isLoading}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium transition-colors md:w-full md:flex-row md:gap-3 md:px-4 md:py-2",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              {isLoading ? (
                <div className="h-5 w-5 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                </div>
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <span className="text-xs md:text-sm hidden md:inline">{item.label}</span>
            </button>
          )
        })}
       
        {/* Profile and Logout Section */}
        <div className="md:mt-auto md:mb-4 md:w-full md:px-1">
          {/* Profile Icon - Using existing component with dropdown functionality */}
          <div className="flex items-center justify-center md:mb-2">
            <ProfileIcon />
          </div>
          
          {/* Logout Button - Hidden on mobile */}
          <button
            onClick={handleSignOut}
            className="hidden w-full items-center justify-center gap-2 rounded-lg border border-red-500 px-2 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white md:flex md:mt-2"
          >
            <LogOutIcon className="h-5 w-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export function Navigation() {
  return (
    <Suspense fallback={null}>
      <NavigationContent />
    </Suspense>
  )
}