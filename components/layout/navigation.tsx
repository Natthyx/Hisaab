"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { HomeIcon, PlusCircleIcon, ListIcon, BarChart3Icon, WalletIcon, LogOutIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ProfileIcon } from "./profile-icon"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/add", label: "Add Transaction", icon: PlusCircleIcon },
  { href: "/transactions", label: "Transactions", icon: ListIcon },
  { href: "/analytics", label: "Analytics", icon: BarChart3Icon },
  { href: "/accounts", label: "Accounts", icon: WalletIcon },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
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
        <div className="hidden md:block md:mb-4 md:mt-2">
          <h1 className="text-2xl font-bold text-indigo-600">Hisaab</h1>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium transition-colors md:w-full md:flex-row md:gap-3 md:px-4 md:py-2",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs md:text-sm hidden md:inline">{item.label}</span>
            </Link>
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