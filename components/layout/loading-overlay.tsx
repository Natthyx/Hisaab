"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, useContext, createContext } from "react"

// Create a context for the loading state
const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: (loading: boolean) => {}
})

export function useLoading() {
  return useContext(LoadingContext)
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function PageLoadingIndicator() {
  const { theme } = useTheme()
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-[100] overflow-hidden">
      <div className="flex flex-col items-center gap-4 px-4 w-full max-w-xs sm:max-w-sm">
        <div className="relative">
          <img 
            src={theme === "dark" ? "/hisaab-logo-white.png" : "/hisaab-logo-main.png"} 
            alt="Hisaab Logo" 
            className="h-12 w-12 animate-pulse sm:h-16 sm:w-16"
          />
        </div>
        <div className="h-1.5 w-full max-w-[96px] overflow-hidden rounded-full bg-muted sm:max-w-[128px] sm:h-2">
          <div className="h-full w-full animate-progress rounded-full bg-indigo-600"></div>
        </div>
      </div>
    </div>
  )
}