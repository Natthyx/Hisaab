"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  // Add other user properties as needed
}

interface UserContextType {
  user: User | null
  loading: boolean
  fetchUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
  children,
  initialUser
}: {
  children: ReactNode
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState<boolean>(!initialUser)
  const supabase = createClient()

  const fetchUser = async () => {
    if (user) return // Already have user data

    setLoading(true)
    try {
      const { data: { user: userData }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error("Error fetching user:", error)
        setUser(null)
      } else if (userData) {
        setUser({
          id: userData.id,
          email: userData.email || ''
          // Map other properties as needed
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Unexpected error fetching user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user on mount if not already provided
  useEffect(() => {
    if (!user && !loading) {
      fetchUser()
    }
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        fetchUser
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}