'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { ClothingItem } from '@/lib/supabaseClient'
import { Shirt, Loader2, RefreshCw, Heart, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Outfit {
  id: string
  top: ClothingItem
  bottom: ClothingItem
  shoe?: ClothingItem
  score: number
}

export default function OutfitsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [clothes, setClothes] = useState<ClothingItem[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [generating, setGenerating] = useState(false)
  const [occasion, setOccasion] = useState<'casual' | 'office' | 'party' | 'formal'>('casual')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      fetchClothes()
    }
  }, [user])

  const fetchClothes = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clothes:', error)
      return
    }

    setClothes(data || [])
  }

  const generateOutfits = async () => {
    if (!user || clothes.length === 0) return

    setGenerating(true)
    
    try {
      // Filter clothes by category
      const tops = clothes.filter(item => item.category === 'top')
      const bottoms = clothes.filter(item => item.category === 'bottom')
      const shoes = clothes.filter(item => item.category === 'shoe')

      if (tops.length === 0 || bottoms.length === 0) {
        alert('You need at least one top and one bottom to generate outfits!')
        setGenerating(false)
        return
      }

      const generatedOutfits: Outfit[] = []

      // Generate outfit combinations
      for (const top of tops) {
        for (const bottom of bottoms) {
          // Find best matching shoe
          let bestShoe: ClothingItem | undefined
          let bestScore = 0

          for (const shoe of shoes) {
            const score = calculateOutfitScore(top, bottom, shoe, occasion)
            if (score > bestScore) {
              bestScore = score
              bestShoe = shoe
            }
          }

          generatedOutfits.push({
            id: `${top.id}-${bottom.id}-${bestShoe?.id || 'no-shoe'}`,
            top,
            bottom,
            shoe: bestShoe,
            score: bestScore
          })
        }
      }

      // Sort by score and take top 12
      generatedOutfits.sort((a, b) => b.score - a.score)
      setOutfits(generatedOutfits.slice(0, 12))
    } catch (error) {
      console.error('Error generating outfits:', error)
      alert('Error generating outfits. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const calculateOutfitScore = (top: ClothingItem, bottom: ClothingItem, shoe?: ClothingItem, occasion?: string): number => {
    let score = 0

    // Color harmony
    if (top.color === bottom.color) score += 0.3 // Monochrome
    if (areColorsComplementary(top.color, bottom.color)) score += 0.5 // Complementary
    if (areColorsAnalogous(top.color, bottom.color)) score += 0.4 // Analogous

    // Occasion appropriateness
    if (occasion === 'casual') {
      if (top.material === 'cotton' && bottom.material === 'denim') score += 0.3
    } else if (occasion === 'office') {
      if (top.color === 'white' || top.color === 'blue') score += 0.2
      if (bottom.color === 'black' || bottom.color === 'gray') score += 0.2
    } else if (occasion === 'party') {
      if (top.color === 'black' || top.color === 'red') score += 0.3
    }

    // Shoe matching
    if (shoe) {
      if (shoe.color === top.color || shoe.color === bottom.color) score += 0.2
      if (occasion === 'formal' && shoe.color === 'black') score += 0.3
    }

    return Math.min(score, 1) // Cap at 1
  }

  const areColorsComplementary = (color1: string, color2: string): boolean => {
    const complementaryPairs = [
      ['red', 'green'],
      ['blue', 'orange'],
      ['yellow', 'purple'],
      ['pink', 'green'],
      ['black', 'white']
    ]
    return complementaryPairs.some(pair => 
      (pair.includes(color1) && pair.includes(color2))
    )
  }

  const areColorsAnalogous = (color1: string, color2: string): boolean => {
    const analogousGroups = [
      ['red', 'pink', 'orange'],
      ['blue', 'purple', 'pink'],
      ['green', 'blue', 'teal'],
      ['yellow', 'orange', 'red']
    ]
    return analogousGroups.some(group => 
      group.includes(color1) && group.includes(color2)
    )
  }

  const likeOutfit = async (outfitId: string) => {
    // In a real app, you'd save this to the database
    console.log('Liked outfit:', outfitId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view outfits</h1>
          <Link href="/" className="text-purple-600 hover:text-purple-700">
            Go back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              AI Wardrobe Stylist
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/upload"
                className="text-gray-700 hover:text-gray-900"
              >
                Upload Clothes
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Outfit Recommendations</h1>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Occasion:</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="casual">Casual</option>
                <option value="office">Office</option>
                <option value="party">Party</option>
                <option value="formal">Formal</option>
              </select>
            </div>
            
            <button
              onClick={generateOutfits}
              disabled={generating || clothes.length === 0}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Outfits
                </>
              )}
            </button>
          </div>

          {clothes.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                You haven't uploaded any clothes yet. <Link href="/upload" className="text-purple-600 hover:text-purple-700 underline">Upload some clothes</Link> to get started!
              </p>
            </div>
          )}
        </div>

        {/* Outfits Grid */}
        {outfits.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {outfits.map((outfit) => (
              <div key={outfit.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Outfit</h3>
                    <button
                      onClick={() => likeOutfit(outfit.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Shirt className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {outfit.top.color} {outfit.top.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shirt className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {outfit.bottom.color} {outfit.bottom.category}
                      </span>
                    </div>
                    {outfit.shoe && (
                      <div className="flex items-center space-x-2">
                        <Shirt className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {outfit.shoe.color} {outfit.shoe.category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Match: {Math.round(outfit.score * 100)}%
                    </span>
                    <span className="text-xs text-purple-600 font-medium">
                      {occasion}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {outfits.length === 0 && clothes.length > 0 && !generating && (
          <div className="text-center py-12">
            <Shirt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No outfits generated yet</h3>
            <p className="mt-1 text-sm text-gray-500">Click "Generate Outfits" to see recommendations</p>
          </div>
        )}
      </main>
    </div>
  )
}
