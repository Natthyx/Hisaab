import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const listTransactionsSchema = z.object({
  filter: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  dateRange: z.object({
    start: z.string().optional(), // ISO string
    end: z.string().optional(),   // ISO string
  }).optional(),
})

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filter = searchParams.get('filter') as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Build the query
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
    
    // Apply search filter
    if (search) {
      query = query.ilike('reason', `%${search}%`)
    }
    
    // Apply category filter
    if (category) {
      query = query.eq('category', category)
    }
    
    // Apply date range filter
    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString())
    }
    
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString())
    }
    
    // Apply period filter
    const now = new Date()
    if (filter) {
      let startOfDay, endOfDay
      
      switch (filter) {
        case 'daily':
          startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
          break
        case 'weekly':
          const firstDayOfWeek = new Date(now)
          firstDayOfWeek.setDate(now.getDate() - now.getDay())
          startOfDay = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate())
          endOfDay = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate() + 6, 23, 59, 59, 999)
          break
        case 'monthly':
          startOfDay = new Date(now.getFullYear(), now.getMonth(), 1)
          endOfDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
          break
        case 'yearly':
          startOfDay = new Date(now.getFullYear(), 0, 1)
          endOfDay = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
          break
      }
      
      if (startOfDay && endOfDay) {
        query = query.gte('date', startOfDay.toISOString())
        query = query.lte('date', endOfDay.toISOString())
      }
    }
    
    // Order by date descending
    const { data, error } = await query
      .order('date', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}