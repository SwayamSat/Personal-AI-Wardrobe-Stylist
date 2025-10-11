// Professional API endpoint for clothing analysis
import { NextRequest, NextResponse } from 'next/server';
import { analyzeClothingItem } from '@/lib/geminiService';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log('🎨 Professional clothing analysis starting...');
    
    // Extract base64 data
    let imageBase64 = image;
    if (image.startsWith('data:')) {
      imageBase64 = image.split(',')[1];
    }

    // Perform professional analysis
    const analysis = await analyzeClothingItem(imageBase64);
    
    console.log('✅ Professional analysis completed:', analysis);
    
    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Professional analysis failed:', error);
    
    // Return fallback analysis
    return NextResponse.json({
      success: true,
      analysis: {
        category: 'top',
        color: 'black',
        material: 'cotton',
        style: 'casual',
        confidence: 0.3
      },
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
