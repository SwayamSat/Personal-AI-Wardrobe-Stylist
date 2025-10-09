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

    // Enhanced color harmony scoring
    const colorScore = calculateColorHarmony(top.color, bottom.color, shoe?.color)
    score += colorScore * 0.4 // 40% weight for color harmony

    // Pattern compatibility
    const patternScore = calculatePatternCompatibility(top.pattern || 'solid', bottom.pattern || 'solid', shoe?.pattern || 'solid')
    score += patternScore * 0.2 // 20% weight for pattern compatibility

    // Style consistency
    const styleScore = calculateStyleConsistency(top.style || 'casual', bottom.style || 'casual', shoe?.style || 'casual')
    score += styleScore * 0.2 // 20% weight for style consistency

    // Occasion appropriateness
    const occasionScore = calculateOccasionScore(top, bottom, shoe, occasion)
    score += occasionScore * 0.2 // 20% weight for occasion appropriateness

    return Math.min(score, 1) // Cap at 1
  }

  const calculateColorHarmony = (topColor: string, bottomColor: string, shoeColor?: string): number => {
    let score = 0

    // Monochrome (same color family)
    if (topColor === bottomColor) {
      score += 0.8
    }

    // Complementary colors
    const complementaryPairs = [
      ['red', 'green'], ['blue', 'orange'], ['yellow', 'purple'],
      ['pink', 'green'], ['black', 'white'], ['navy', 'orange'],
      ['burgundy', 'forest'], ['coral', 'teal']
    ]
    
    for (const [color1, color2] of complementaryPairs) {
      if ((topColor === color1 && bottomColor === color2) || 
          (topColor === color2 && bottomColor === color1)) {
        score += 0.9
        break
      }
    }

    // Analogous colors (adjacent on color wheel)
    const analogousGroups = [
      ['red', 'pink', 'orange'], ['blue', 'purple', 'pink'],
      ['green', 'blue', 'teal'], ['yellow', 'orange', 'red'],
      ['purple', 'blue', 'indigo'], ['green', 'yellow', 'lime']
    ]
    
    for (const group of analogousGroups) {
      if (group.includes(topColor) && group.includes(bottomColor)) {
        score += 0.7
        break
      }
    }

    // Neutral combinations
    const neutrals = ['black', 'white', 'gray', 'brown', 'beige', 'navy']
    if (neutrals.includes(topColor) || neutrals.includes(bottomColor)) {
      score += 0.6
    }

    // Shoe color matching
    if (shoeColor) {
      if (shoeColor === topColor || shoeColor === bottomColor) {
        score += 0.3
      } else if (neutrals.includes(shoeColor)) {
        score += 0.2
      }
    }

    return Math.min(score, 1)
  }

  const calculatePatternCompatibility = (topPattern?: string, bottomPattern?: string, shoePattern?: string): number => {
    let score = 0.5 // Base score

    // If both have patterns, check compatibility
    if (topPattern && bottomPattern && topPattern !== 'solid' && bottomPattern !== 'solid') {
      // Same pattern
      if (topPattern === bottomPattern) {
        score = 0.3 // Can be overwhelming
      }
      // Complementary patterns
      else if ((topPattern === 'striped' && bottomPattern === 'solid') ||
               (topPattern === 'solid' && bottomPattern === 'striped') ||
               (topPattern === 'floral' && bottomPattern === 'solid') ||
               (topPattern === 'solid' && bottomPattern === 'floral')) {
        score = 0.8
      }
      // Conflicting patterns
      else if ((topPattern === 'striped' && bottomPattern === 'plaid') ||
               (topPattern === 'plaid' && bottomPattern === 'striped')) {
        score = 0.2
      }
    }
    // One patterned, one solid
    else if ((topPattern && topPattern !== 'solid' && bottomPattern === 'solid') ||
             (bottomPattern && bottomPattern !== 'solid' && topPattern === 'solid')) {
      score = 0.9
    }
    // Both solid
    else if (topPattern === 'solid' && bottomPattern === 'solid') {
      score = 0.7
    }

    return Math.min(score, 1)
  }

  const calculateStyleConsistency = (topStyle?: string, bottomStyle?: string, shoeStyle?: string): number => {
    let score = 0.5 // Base score

    const styles = [topStyle, bottomStyle, shoeStyle].filter(Boolean)
    
    if (styles.length === 0) return score

    // Count style matches
    const styleCounts: { [key: string]: number } = {}
    styles.forEach(style => {
      styleCounts[style!] = (styleCounts[style!] || 0) + 1
    })

    // Find most common style
    const maxCount = Math.max(...Object.values(styleCounts))
    const consistencyRatio = maxCount / styles.length

    score = consistencyRatio * 0.8 + 0.2 // Scale to 0.2-1.0

    return Math.min(score, 1)
  }

  const calculateOccasionScore = (top: ClothingItem, bottom: ClothingItem, shoe?: ClothingItem, occasion?: string): number => {
    let score = 0.5 // Base score

    if (!occasion) return score

    const allItems = [top, bottom, shoe].filter(Boolean)
    const allColors = allItems.map(item => item!.color)
    const allStyles = allItems.map(item => item!.style || 'casual').filter(Boolean)
    const allMaterials = allItems.map(item => item!.material).filter(Boolean)

    switch (occasion) {
      case 'casual':
        if (allMaterials.includes('cotton') || allMaterials.includes('denim')) score += 0.3
        if (allStyles.includes('casual') || allStyles.includes('sporty')) score += 0.3
        if (allColors.includes('blue') || allColors.includes('white')) score += 0.2
        break

      case 'office':
        if (allColors.includes('white') || allColors.includes('blue') || allColors.includes('black')) score += 0.3
        if (allStyles.includes('formal') || allStyles.includes('modern')) score += 0.3
        if (allMaterials.includes('cotton') || allMaterials.includes('wool')) score += 0.2
        if (shoe && shoe.color === 'black') score += 0.2
        break

      case 'party':
        if (allColors.includes('black') || allColors.includes('red') || allColors.includes('purple')) score += 0.3
        if (allStyles.includes('formal') || allStyles.includes('modern')) score += 0.3
        if (allMaterials.includes('silk') || allMaterials.includes('cashmere')) score += 0.2
        break

      case 'formal':
        if (allColors.includes('black') || allColors.includes('white') || allColors.includes('navy')) score += 0.3
        if (allStyles.includes('formal')) score += 0.4
        if (allMaterials.includes('wool') || allMaterials.includes('silk')) score += 0.2
        if (shoe && shoe.color === 'black') score += 0.1
        break
    }

    return Math.min(score, 1)
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
                {/* Outfit Images */}
                <div className="relative h-48 bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-1 w-full h-full p-2">
                      {/* Top */}
                      <div className="relative">
                        <img
                          src={outfit.top.image_url}
                          alt={`${outfit.top.color} ${outfit.top.category}`}
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          Top
                        </div>
                      </div>
                      
                      {/* Bottom */}
                      <div className="relative">
                        <img
                          src={outfit.bottom.image_url}
                          alt={`${outfit.bottom.color} ${outfit.bottom.category}`}
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          Bottom
                        </div>
                      </div>
                      
                      {/* Shoe (if available) */}
                      {outfit.shoe && (
                        <div className="relative col-span-2">
                          <img
                            src={outfit.shoe.image_url}
                            alt={`${outfit.shoe.color} ${outfit.shoe.category}`}
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            Shoes
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Match Score Badge */}
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {Math.round(outfit.score * 100)}% Match
                  </div>
                </div>

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
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: outfit.top.color }}
                      ></div>
                      <span className="text-sm text-gray-600">
                        {outfit.top.color} {outfit.top.category}
                        {(outfit.top as any).pattern && (outfit.top as any).pattern !== 'solid' && ` (${(outfit.top as any).pattern})`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: outfit.bottom.color }}
                      ></div>
                      <span className="text-sm text-gray-600">
                        {outfit.bottom.color} {outfit.bottom.category}
                        {(outfit.bottom as any).pattern && (outfit.bottom as any).pattern !== 'solid' && ` (${(outfit.bottom as any).pattern})`}
                      </span>
                    </div>
                    {outfit.shoe && (
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: outfit.shoe.color }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {outfit.shoe.color} {outfit.shoe.category}
                          {(outfit.shoe as any).pattern && (outfit.shoe as any).pattern !== 'solid' && ` (${(outfit.shoe as any).pattern})`}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Style: {(outfit.top as any).style || 'casual'}
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
