import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { calculateSimilarity } from '@/lib/embeddings'

export async function POST(request: NextRequest) {
  try {
    const { userId, occasion = 'casual' } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Fetch user's clothes
    const { data: clothes, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching clothes:', error)
      return NextResponse.json({ error: 'Failed to fetch clothes' }, { status: 500 })
    }

    if (!clothes || clothes.length === 0) {
      return NextResponse.json({ outfits: [] })
    }

    // Filter clothes by category
    const tops = clothes.filter(item => item.category === 'top')
    const bottoms = clothes.filter(item => item.category === 'bottom')
    const shoes = clothes.filter(item => item.category === 'shoe')
    const accessories = clothes.filter(item => item.category === 'accessory')

    if (tops.length === 0 || bottoms.length === 0) {
      return NextResponse.json({ outfits: [] })
    }

    const outfits = []

    // Generate outfit combinations
    for (const top of tops) {
      for (const bottom of bottoms) {
        // Find best matching shoe
        let bestShoe = null
        let bestShoeScore = 0

        for (const shoe of shoes) {
          const score = calculateOutfitScore(top, bottom, shoe, occasion)
          if (score > bestShoeScore) {
            bestShoeScore = score
            bestShoe = shoe
          }
        }

        // Find best matching accessory
        let bestAccessory = null
        let bestAccessoryScore = 0

        for (const accessory of accessories) {
          const score = calculateOutfitScore(top, bottom, accessory, occasion)
          if (score > bestAccessoryScore) {
            bestAccessoryScore = score
            bestAccessory = accessory
          }
        }

        const outfit = {
          id: `${top.id}-${bottom.id}-${bestShoe?.id || 'no-shoe'}-${bestAccessory?.id || 'no-accessory'}`,
          top,
          bottom,
          shoe: bestShoe,
          accessory: bestAccessory,
          score: calculateOutfitScore(top, bottom, bestShoe, occasion),
          occasion
        }

        outfits.push(outfit)
      }
    }

    // Sort by score and return top 20
    outfits.sort((a, b) => b.score - a.score)
    const topOutfits = outfits.slice(0, 20)

    return NextResponse.json({ outfits: topOutfits })
  } catch (error) {
    console.error('Error in recommend API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateOutfitScore(top: any, bottom: any, shoe?: any, occasion?: string): number {
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
  } else if (occasion === 'formal') {
    if (top.color === 'white' || top.color === 'black') score += 0.3
    if (bottom.color === 'black' || bottom.color === 'gray') score += 0.3
  }

  // Shoe matching
  if (shoe) {
    if (shoe.color === top.color || shoe.color === bottom.color) score += 0.2
    if (occasion === 'formal' && shoe.color === 'black') score += 0.3
    if (occasion === 'casual' && (shoe.color === 'white' || shoe.color === 'brown')) score += 0.2
  }

  // Embedding similarity (if available)
  if (top.embedding && bottom.embedding) {
    const similarity = calculateSimilarity(top.embedding, bottom.embedding)
    score += similarity * 0.3
  }

  return Math.min(score, 1) // Cap at 1
}

function areColorsComplementary(color1: string, color2: string): boolean {
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

function areColorsAnalogous(color1: string, color2: string): boolean {
  const analogousGroups = [
    ['red', 'pink', 'orange'],
    ['blue', 'purple', 'pink'],
    ['green', 'blue', 'teal'],
    ['yellow', 'orange', 'red'],
    ['black', 'gray', 'white']
  ]
  return analogousGroups.some(group => 
    group.includes(color1) && group.includes(color2)
  )
}
