import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types - Updated to match optimized schema
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  preferences?: any
  created_at: string
  updated_at: string
}

export interface ClothingItem {
  id: string
  user_id: string
  image_url: string
  category: 'top' | 'bottom' | 'shoe' | 'accessory'
  color: string
  material: string
  style: string
  brand?: string
  size?: string
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season'
  occasion?: 'casual' | 'office' | 'party' | 'formal' | 'sport' | 'beach'
  price?: number
  purchase_date?: string
  last_worn?: string
  wear_count?: number
  is_favorite?: boolean
  tags?: string[]
  embedding?: number[]
  analysis_data?: any
  created_at: string
  updated_at: string
}

export interface Outfit {
  id: string
  user_id: string
  name?: string
  top_id: string
  bottom_id: string
  shoe_id?: string
  accessory_id?: string
  occasion: 'casual' | 'office' | 'party' | 'formal' | 'sport' | 'beach'
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season'
  score?: number
  reasoning?: string
  color_scheme?: string
  style_notes?: string[]
  confidence?: number
  is_favorite?: boolean
  wear_count?: number
  last_worn?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface OutfitRecommendation {
  id: string
  user_id: string
  occasion: 'casual' | 'office' | 'party' | 'formal' | 'sport' | 'beach'
  top_id: string
  bottom_id: string
  shoe_id?: string
  accessory_id?: string
  score: number
  reasoning?: string
  color_scheme?: string
  style_notes?: string[]
  confidence?: number
  is_generated?: boolean
  is_saved?: boolean
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  color_preferences?: string[]
  style_preferences?: string[]
  brand_preferences?: string[]
  size_preferences?: any
  occasion_preferences?: any
  budget_range?: any
  seasonal_preferences?: any
  created_at: string
  updated_at: string
}

export interface WardrobeStats {
  total_items: number
  tops_count: number
  bottoms_count: number
  shoes_count: number
  accessories_count: number
  favorite_items: number
  recent_additions: number
}
