"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { HomeIcon, PlusCircleIcon, ListIcon, BarChart3Icon, LogOutIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/add", label: "Add Transaction", icon: PlusCircleIcon },
  { href: "/transactions", label: "Transactions", icon: ListIcon },
  { href: "/analytics/daily", label: "Analytics", icon: BarChart3Icon },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:static md:h-screen md:w-64 md:border-r md:border-t-0">
      <div className="flex h-16 items-center justify-around md:h-auto md:flex-col md:gap-2 md:p-4">
        <div className="hidden md:block md:mb-8 md:mt-4">
          <h1 className="text-2xl font-bold text-indigo-600">ExpenseTracker</h1>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:w-full md:flex-row md:gap-3 md:px-4",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs md:text-sm">{item.label}</span>
            </Link>
          )
        })}
        <button
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:mt-auto md:w-full md:flex-row md:gap-3 md:px-4"
          onClick={() => {
            // Logout logic would go here
            console.log("Logout clicked")
          }}
        >
          <LogOutIcon className="h-5 w-5" />
          <span className="text-xs md:text-sm">Logout</span>
        </button>
      </div>
    </nav>
  )
}
