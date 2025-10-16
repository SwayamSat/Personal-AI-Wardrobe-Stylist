import { NextRequest, NextResponse } from 'next/server';
import { testGeminiAPI } from '@/lib/geminiService';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Gemini API endpoint called');
    
    const testResult = await testGeminiAPI();
    
    if (testResult.success) {
      console.log('✅ Gemini API test successful');
      return NextResponse.json({
        success: true,
        message: testResult.message,
        response: testResult.response,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ Gemini API test failed:', testResult.message);
      return NextResponse.json({
        success: false,
        message: testResult.message,
        response: testResult.response,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Gemini API test endpoint error:', error);
    return NextResponse.json({
      success: false,
      message: `Test endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
