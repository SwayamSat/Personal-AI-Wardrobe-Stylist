// Clean API endpoint for outfit recommendations
import { NextRequest, NextResponse } from 'next/server';
import { generateOutfitRecommendations } from '@/lib/geminiService';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with error handling
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing. Please check your environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, occasion = 'casual' } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check environment variables
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        success: false,
        error: 'Gemini API key not configured',
        details: 'Please set GEMINI_API_KEY in your environment variables'
      }, { status: 500 });
    }

    // Initialize Supabase client
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (supabaseError) {
      return NextResponse.json({ 
        success: false,
        error: 'Database configuration error',
        details: supabaseError instanceof Error ? supabaseError.message : 'Unknown Supabase error'
      }, { status: 500 });
    }

    console.log('👔 Generating outfit recommendations for user:', userId);

    // Fetch user's clothing items
    const { data: clothingItems, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch clothing items' }, { status: 500 });
    }

    if (!clothingItems || clothingItems.length === 0) {
      return NextResponse.json({ error: 'No clothing items found' }, { status: 404 });
    }

    console.log(`📦 Found ${clothingItems.length} clothing items`);

    const recommendations = await generateOutfitRecommendations(clothingItems, occasion);
    
    console.log('✅ Generated recommendations:', recommendations.length);
    
    return NextResponse.json({
      success: true,
      recommendations,
      metadata: {
        totalItems: clothingItems.length,
        occasion,
        generatedAt: new Date().toISOString()
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Recommendation generation failed:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
