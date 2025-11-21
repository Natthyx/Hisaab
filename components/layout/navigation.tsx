"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { HomeIcon, PlusCircleIcon, ListIcon, BarChart3Icon, WalletIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ProfileIcon } from "./profile-icon"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/add", label: "Add Transaction", icon: PlusCircleIcon },
  { href: "/transactions", label: "Transactions", icon: ListIcon },
  { href: "/analytics", label: "Analytics", icon: BarChart3Icon },
  { href: "/accounts", label: "Accounts", icon: WalletIcon },
]

export function Navigation() {
  const pathname = usePathname()

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
        {/* Profile Icon at the bottom on desktop */}
        <div className="md:mt-auto md:mb-4">
          <ProfileIcon />
        </div>
      </div>
    </nav>
  )
}