import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  preferences?: any
  created_at: string
}

export interface ClothingItem {
  id: string
  user_id: string
  image_url: string
  category: 'top' | 'bottom' | 'shoe' | 'accessory'
  color: string
  material?: string
  embedding?: number[]
  created_at: string
}

export interface Outfit {
  id: string
  user_id: string
  top_id: string
  bottom_id: string
  shoe_id?: string
  accessory_id?: string
  occasion?: 'casual' | 'office' | 'party' | 'formal'
  created_at: string
}
