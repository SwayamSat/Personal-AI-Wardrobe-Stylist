'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { Loader2, RefreshCw, Heart, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'

interface ClothingItem {
  id: string
  user_id: string
  image_url: string
  category: 'top' | 'bottom' | 'shoe' | 'accessory'
  color: string
  material: string
  style: string
  created_at: string
}

interface OutfitRecommendation {
  outfitId: string
  top: string
  bottom: string
  shoe?: string
  accessory?: string
  score: number
  reasoning: string
  occasion: string
  colorScheme?: string
  styleNotes?: string[]
  confidence?: number
}

export default function OutfitsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [outfits, setOutfits] = useState<OutfitRecommendation[]>([])
  const [generating, setGenerating] = useState(false)
  const [selectedOccasion, setSelectedOccasion] = useState<'casual' | 'office' | 'party' | 'formal'>('casual')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

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
      fetchClothingItems()
    }
  }, [user])

  const fetchClothingItems = async () => {
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

    setClothingItems(data || [])
  }

  const generateOutfits = async () => {
    if (!user || clothingItems.length === 0) return

    setGenerating(true)
    setError(null)

    try {
      console.log('👔 Generating AI-powered outfit recommendations...')

      // Call the server-side API route that has access to environment variables
      const response = await fetch('/api/generate-outfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          occasion: selectedOccasion
        })
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to generate recommendations')
        } else {
          const errorText = await response.text()
          console.error('❌ Non-JSON error response:', errorText)
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.json()

      if (data.success && data.recommendations) {
        setOutfits(data.recommendations)
        setError(null)
        console.log(`✅ Generated ${data.recommendations.length} outfit recommendations`)
      } else {
        throw new Error('No recommendations received')
      }
    } catch (error) {
      console.error('❌ Error generating outfits:', error)
      setError(`Failed to generate outfits: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setGenerating(false)
    }
  }

  const getItemById = (itemId: string) => {
    return clothingItems.find(item => item.id === itemId)
  }

  const likeOutfit = async (outfitId: string) => {
    console.log('Liked outfit:', outfitId)
    // In a real app, you'd save this to the database
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
          <h1 className="text-2xl font-bold text-foreground mb-4">Please sign in to view outfits</h1>
          <Link href="/" className="text-purple-600 hover:text-purple-700">Go back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Your Outfit Recommendations</h1>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-foreground">Occasion:</label>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value as any)}
                className="border border-border rounded-md px-3 py-1 text-sm bg-background text-foreground"
              >
                <option value="casual">Casual</option>
                <option value="office">Office</option>
                <option value="party">Party</option>
                <option value="formal">Formal</option>
              </select>
            </div>
            
            <button
              onClick={generateOutfits}
              disabled={generating || clothingItems.length === 0}
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

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {clothingItems.length === 0 && (
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
            {outfits.map((outfit) => {
              const topItem = getItemById(outfit.top)
              const bottomItem = getItemById(outfit.bottom)
              const shoeItem = outfit.shoe ? getItemById(outfit.shoe) : null
              const accessoryItem = outfit.accessory ? getItemById(outfit.accessory) : null

              return (
                <div key={outfit.outfitId} className="bg-card rounded-lg shadow-sm overflow-hidden">
                  {/* Outfit Images */}
                  <div className="relative h-48 bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full p-2">
                        {/* Top */}
                        {topItem && (
                          <div className="relative">
                            <img
                              src={topItem.image_url}
                              alt={`${topItem.color} ${topItem.category}`}
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              Top
                            </div>
                          </div>
                        )}
                        
                        {/* Bottom */}
                        {bottomItem && (
                          <div className="relative">
                            <img
                              src={bottomItem.image_url}
                              alt={`${bottomItem.color} ${bottomItem.category}`}
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              Bottom
                            </div>
                          </div>
                        )}
                        
                        {/* Shoe (if available) */}
                        {shoeItem && (
                          <div className="relative">
                            <img
                              src={shoeItem.image_url}
                              alt={`${shoeItem.color} ${shoeItem.category}`}
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              Shoes
                            </div>
                          </div>
                        )}
                        
                        {/* Accessory (if available) */}
                        {accessoryItem && (
                          <div className="relative">
                            <img
                              src={accessoryItem.image_url}
                              alt={`${accessoryItem.color} ${accessoryItem.category}`}
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              Accessory
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Match Score Badge */}
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {outfit.score}% Match
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-card-foreground">Outfit</h3>
                      <button
                        onClick={() => likeOutfit(outfit.outfitId)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {topItem && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: topItem.color }}
                          ></div>
                          <span className="text-sm text-muted-foreground">
                            {topItem.color} {topItem.category}
                          </span>
                        </div>
                      )}
                      {bottomItem && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: bottomItem.color }}
                          ></div>
                          <span className="text-sm text-muted-foreground">
                            {bottomItem.color} {bottomItem.category}
                          </span>
                        </div>
                      )}
                      {shoeItem && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: shoeItem.color }}
                          ></div>
                          <span className="text-sm text-muted-foreground">
                            {shoeItem.color} {shoeItem.category}
                          </span>
                        </div>
                      )}
                      {accessoryItem && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: accessoryItem.color }}
                          ></div>
                          <span className="text-sm text-muted-foreground">
                            {accessoryItem.color} {accessoryItem.category}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      {/* Color Scheme */}
                      {outfit.colorScheme && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Color Scheme:</strong> {outfit.colorScheme}
                        </div>
                      )}
                      
                      {/* Style Notes */}
                      {outfit.styleNotes && outfit.styleNotes.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Style Notes:</strong>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            {outfit.styleNotes.map((note, index) => (
                              <li key={index}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Reasoning */}
                      <div className="text-xs text-muted-foreground">
                        <strong>Analysis:</strong> {outfit.reasoning}
                      </div>
                      
                      {/* Confidence and Occasion */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-purple-600 font-medium">
                            {outfit.occasion}
                          </span>
                          {outfit.confidence && (
                            <span className="text-xs text-green-600 font-medium">
                              {(outfit.confidence * 100).toFixed(0)}% confidence
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          AI Generated
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {outfits.length === 0 && clothingItems.length > 0 && !generating && (
          <div className="text-center py-12">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No outfits generated yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Click "Generate Outfits" to see recommendations</p>
          </div>
        )}
      </main>
    </div>
  )
}