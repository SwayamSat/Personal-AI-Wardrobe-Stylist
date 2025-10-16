// Professional Gemini Service for Personal Wardrobe Stylist
// SECURITY NOTE: Never log API keys or sensitive environment variables
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { analyzeImageColorsAdvanced, analyzeMaterialFromImage } from './colorAnalysis';

// Initialize Gemini at runtime to avoid webpack issues
function getGeminiClient(): GoogleGenerativeAI | null {
  try {
    console.log('🔧 Initializing Gemini client...');
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ GEMINI_API_KEY not found in environment variables');
      return null;
    }
    
    if (process.env.GEMINI_API_KEY.length < 10) {
      console.log('❌ GEMINI_API_KEY appears to be invalid (too short)');
      return null;
    }
    
    console.log('✅ GEMINI_API_KEY found and configured');
    
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini client initialized successfully');
    
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
  }
  return null;
}

export interface ClothingAnalysis {
  category: 'top' | 'bottom' | 'shoe' | 'accessory';
  color: string;
  material: string;
  style: string;
  confidence: number;
}

export interface OutfitRecommendation {
  outfitId: string;
  top: string;
  bottom: string;
  shoe?: string;
  accessory?: string;
  score: number;
  reasoning: string;
  occasion: string;
  colorScheme?: string;
  styleNotes?: string[];
  confidence?: number;
}

// Analyze a single clothing item with professional prompts
export async function analyzeClothingItem(imageBase64: string): Promise<ClothingAnalysis> {
  console.log('🔍 Professional clothing analysis starting...');
  
  const genAI = getGeminiClient();
  
  if (!genAI || !process.env.GEMINI_API_KEY) {
    console.log('⚠️ Gemini API not available, using advanced computer vision fallback');
    try {
      const [colorAnalysis, materialAnalysis] = await Promise.all([
        analyzeImageColorsAdvanced(imageBase64),
        analyzeMaterialFromImage(imageBase64)
      ]);
      
      return {
        category: 'top',
        color: colorAnalysis.dominantColor,
        material: materialAnalysis.material,
        style: 'casual',
        confidence: Math.max(colorAnalysis.confidence, materialAnalysis.confidence)
      };
    } catch (cvError) {
      console.error('❌ Computer vision fallback failed:', cvError);
      return {
        category: 'top',
        color: 'black',
        material: 'cotton',
        style: 'casual',
        confidence: 0.3
      };
    }
  }

  try {
    // Enhanced prompt optimized for Gemini 2.5 Pro's superior vision capabilities
    const prompt = `You are a world-class fashion stylist and color expert with access to advanced AI vision. Analyze this clothing item image with professional precision.

TASK: Identify the clothing item's characteristics and return ONLY a valid JSON object.

REQUIRED OUTPUT FORMAT (return ONLY this JSON, no other text):
{
  "category": "top|bottom|shoe|accessory",
  "color": "specific_color_name",
  "material": "specific_material_type",
  "style": "style_description",
  "confidence": 0.95
}

ADVANCED ANALYSIS GUIDELINES:

COLOR ANALYSIS (Use Gemini 2.5 Pro's enhanced vision):
- Identify PRIMARY color with fashion industry precision
- Use specific color names: navy blue, burgundy, charcoal gray, cream white, forest green, coral pink, royal blue, emerald green, chocolate brown, midnight blue, steel blue, etc.
- Consider color temperature (warm/cool undertones)
- Note any secondary colors or accents
- Avoid generic terms like "blue" or "red" - be specific

MATERIAL & TEXTURE ANALYSIS:
- Identify fabric type: cotton, denim, leather, silk, wool, polyester, linen, cashmere, suede, velvet, chiffon, etc.
- Assess texture: smooth, textured, matte, glossy, rough, soft, etc.
- Consider material quality indicators and weave patterns
- Look for material-specific characteristics (denim fading, leather grain, silk sheen)

STYLE CLASSIFICATION:
- Describe the style: casual, formal, sporty, vintage, modern, bohemian, minimalist, preppy, streetwear, business casual, etc.
- Consider the overall aesthetic and design elements
- Look at cut, fit, and design details

CONFIDENCE SCORING:
- Rate your confidence in this analysis (0.0 to 1.0)
- Higher confidence for clear, well-lit images
- Lower confidence for unclear or ambiguous images
- Consider image quality and lighting conditions

PROFESSIONAL EXAMPLES:
- Navy blue cotton t-shirt → {"category": "top", "color": "navy blue", "material": "cotton", "style": "casual", "confidence": 0.9}
- Black leather jacket → {"category": "top", "color": "black", "material": "leather", "style": "modern", "confidence": 0.95}
- Dark wash denim jeans → {"category": "bottom", "color": "dark blue", "material": "denim", "style": "casual", "confidence": 0.9}
- Burgundy silk blouse → {"category": "top", "color": "burgundy", "material": "silk", "style": "formal", "confidence": 0.92}

Return ONLY the JSON object, no explanations or additional text.`;

    // Use Gemini 2.5 Pro for superior vision analysis with enhanced configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 500,
        candidateCount: 1,
        stopSequences: [],
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
      ]
    });
    
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg"
      }
    };

    console.log('📡 Calling Gemini API with enhanced prompt...');
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    
    if (!response) {
      console.log('⚠️ No response from Gemini API - using fallback');
      throw new Error('No response received from Gemini API');
    }
    
    const text = response.text();
    
    if (!text) {
      console.log('⚠️ Empty text response from Gemini API - using fallback');
      throw new Error('Empty text response from Gemini API');
    }
    
    console.log('📝 Raw Gemini response:', text);
    
    // Enhanced JSON parsing with multiple extraction strategies
    let analysis = parseGeminiResponse(text, 'object');
    
    if (!analysis) {
      throw new Error('Failed to extract valid JSON from Gemini response');
    }
    console.log('📊 Parsed analysis:', analysis);
    
    // Validate and enhance the analysis with better defaults
    const validatedAnalysis = {
      category: (analysis.category && ['top', 'bottom', 'shoe', 'accessory'].includes(analysis.category)) 
        ? analysis.category 
        : 'top',
      color: analysis.color && analysis.color.trim() 
        ? analysis.color.trim().toLowerCase() 
        : 'black',
      material: analysis.material && analysis.material.trim() 
        ? analysis.material.trim().toLowerCase() 
        : 'cotton',
      style: analysis.style && analysis.style.trim() 
        ? analysis.style.trim().toLowerCase() 
        : 'casual',
      confidence: Math.min(Math.max(analysis.confidence || 0.7, 0), 1)
    };
    
    console.log('✅ Professional analysis completed:', validatedAnalysis);
    return validatedAnalysis;
    
  } catch (error) {
    console.error('❌ Gemini analysis failed, using advanced computer vision fallback:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Enhanced error logging for better debugging
    if (error instanceof Error) {
      if (error.message.includes('Empty text response') || error.message.includes('Empty response')) {
        console.log('🔍 Empty response from Gemini API - using computer vision fallback');
      } else if (error.message.includes('Failed to extract valid JSON')) {
        console.log('🔍 JSON extraction failed - using computer vision fallback');
      } else if (error.message.includes('API key')) {
        console.log('🔑 API key issue - using computer vision fallback');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        console.log('🌐 Network issue - using computer vision fallback');
      } else {
        console.log('⚠️ Unknown Gemini error - using computer vision fallback');
        console.log('📝 Error stack:', error.stack?.substring(0, 300) + (error.stack && error.stack.length > 300 ? '...' : ''));
      }
    }
    
    // Fallback to advanced computer vision
    try {
      console.log('🔄 Attempting computer vision fallback...');
      const [colorAnalysis, materialAnalysis] = await Promise.all([
        analyzeImageColorsAdvanced(imageBase64),
        analyzeMaterialFromImage(imageBase64)
      ]);
      
      console.log('🎨 CV Color analysis:', colorAnalysis);
      console.log('🧵 CV Material analysis:', materialAnalysis);
      
      return {
        category: 'top',
        color: colorAnalysis.dominantColor,
        material: materialAnalysis.material,
        style: 'casual',
        confidence: Math.max(colorAnalysis.confidence, materialAnalysis.confidence)
      };
    } catch (cvError) {
      console.error('❌ Computer vision fallback failed:', cvError);
      return {
        category: 'top',
        color: 'black',
        material: 'cotton',
        style: 'casual',
        confidence: 0.3
      };
    }
  }
}

// Comprehensive JSON parsing function for Gemini responses with retry mechanism
function parseGeminiResponse(text: string, expectedType: 'object' | 'array'): any {
  console.log('🔍 Parsing Gemini response with enhanced extraction and retry mechanism...');
  
  if (!text || text.trim().length === 0) {
    console.log('⚠️ Empty response text');
    return null;
  }
  
  const strategies = [
    { name: 'Direct parsing', fn: () => parseWithStrategy(text, expectedType, 'direct') },
    { name: 'Markdown cleanup', fn: () => parseWithStrategy(text, expectedType, 'markdown') },
    { name: 'Regex extraction', fn: () => parseWithStrategy(text, expectedType, 'regex') },
    { name: 'Repair and parse', fn: () => parseWithStrategy(text, expectedType, 'repair') },
    { name: 'Aggressive repair', fn: () => parseWithStrategy(text, expectedType, 'aggressive') },
    { name: 'Fallback generation', fn: () => generateFallbackResponse(expectedType) }
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    console.log(`🔄 Trying strategy ${i + 1}/${strategies.length}: ${strategy.name}`);
    
    try {
      const result = strategy.fn();
      if (result !== null) {
        console.log(`✅ Strategy "${strategy.name}" succeeded`);
        return result;
      }
    } catch (error) {
      console.log(`⚠️ Strategy "${strategy.name}" failed:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  console.log('❌ All parsing strategies exhausted');
  return null;
}

// Individual parsing strategy implementation
function parseWithStrategy(text: string, expectedType: 'object' | 'array', strategy: string): any {
  let cleanText = text.trim();
  
  switch (strategy) {
    case 'direct':
      return JSON.parse(cleanText);
      
    case 'markdown':
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      return JSON.parse(cleanText);
      
    case 'regex':
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      
      let jsonMatch: RegExpMatchArray | null = null;
      if (expectedType === 'object') {
        jsonMatch = cleanText.match(/\{[\s\S]*?\}/) || 
                   cleanText.match(/\{[\s\S]*\}/) ||
                   cleanText.match(/\{[^}]*\}/);
      } else if (expectedType === 'array') {
        jsonMatch = cleanText.match(/\[[\s\S]*?\]/) || 
                   cleanText.match(/\[[\s\S]*\]/) ||
                   cleanText.match(/\[[^\]]*\]/);
      }
      
      if (jsonMatch) {
        cleanText = jsonMatch[0];
        console.log('🎯 Extracted JSON:', cleanText.substring(0, 100) + (cleanText.length > 100 ? '...' : ''));
      }
      
      return JSON.parse(cleanText);
      
    case 'repair':
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      
      let jsonMatch2: RegExpMatchArray | null = null;
      if (expectedType === 'object') {
        jsonMatch2 = cleanText.match(/\{[\s\S]*?\}/) || 
                    cleanText.match(/\{[\s\S]*\}/) ||
                    cleanText.match(/\{[^}]*\}/);
      } else if (expectedType === 'array') {
        jsonMatch2 = cleanText.match(/\[[\s\S]*?\]/) || 
                    cleanText.match(/\[[\s\S]*\]/) ||
                    cleanText.match(/\[[^\]]*\]/);
      }
      
      if (jsonMatch2) {
        cleanText = jsonMatch2[0];
      }
      
      const repairedJson = repairIncompleteJSON(cleanText);
      return JSON.parse(repairedJson);
      
    case 'aggressive':
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      
      // More aggressive extraction
      let jsonMatch3: RegExpMatchArray | null = null;
      if (expectedType === 'object') {
        jsonMatch3 = cleanText.match(/\{[\s\S]*?\}/) || 
                    cleanText.match(/\{[\s\S]*\}/) ||
                    cleanText.match(/\{[^}]*\}/) ||
                    cleanText.match(/\{[^}]*$/);
      } else if (expectedType === 'array') {
        jsonMatch3 = cleanText.match(/\[[\s\S]*?\]/) || 
                    cleanText.match(/\[[\s\S]*\]/) ||
                    cleanText.match(/\[[^\]]*\]/) ||
                    cleanText.match(/\[[^\]]*$/);
      }
      
      if (jsonMatch3) {
        cleanText = jsonMatch3[0];
      }
      
      const aggressiveRepaired = aggressiveRepairJSON(cleanText, expectedType);
      return JSON.parse(aggressiveRepaired);
      
    default:
      throw new Error(`Unknown strategy: ${strategy}`);
  }
}

// Generate fallback response when all parsing fails
function generateFallbackResponse(expectedType: 'object' | 'array'): any {
  console.log('🆘 Generating fallback response...');
  
  if (expectedType === 'object') {
    return {
      category: 'top',
      color: 'black',
      material: 'cotton',
      style: 'casual',
      confidence: 0.5
    };
  } else if (expectedType === 'array') {
    return [{
      outfitId: 'fallback_outfit_1',
      items: [],
      score: 50,
      reasoning: 'Fallback outfit due to parsing failure',
      occasion: 'casual',
      colorScheme: 'Neutral',
      styleNotes: ['Fallback generated'],
      confidence: 0.3
    }];
  }
  
  return null;
}

// More aggressive JSON repair for difficult cases
function aggressiveRepairJSON(jsonText: string, expectedType: 'object' | 'array'): string {
  console.log('🔧 Attempting aggressive JSON repair...');
  
  if (!jsonText || jsonText.trim().length === 0) {
    return expectedType === 'object' ? '{}' : '[]';
  }
  
  let repaired = jsonText.trim();
  
  // Remove all non-JSON characters at the beginning and end
  repaired = repaired.replace(/^[^{[]*/, '');
  repaired = repaired.replace(/[^}\]]*$/, '');
  
  // If we have nothing left, return default structure
  if (!repaired || repaired.length === 0) {
    return expectedType === 'object' ? '{}' : '[]';
  }
  
  // Count braces and brackets
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;
  
  // Add missing closing braces
  for (let i = 0; i < openBraces - closeBraces; i++) {
    repaired += '}';
  }
  
  // Add missing closing brackets
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    repaired += ']';
  }
  
  // Fix trailing commas
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  // Fix missing quotes around keys
  repaired = repaired.replace(/(\w+):/g, '"$1":');
  
  // More careful string value fixing
  repaired = repaired.replace(/:\s*([^",{\[\s][^",}\]\]]*?)(\s*[,}\]])/g, (match, value, ending) => {
    // Don't quote numbers, booleans, null, or already quoted values
    if (/^["\d\-]/.test(value) || value === 'true' || value === 'false' || value === 'null') {
      return match;
    }
    return `: "${value}"${ending}`;
  });
  
  // Ensure proper structure
  if (expectedType === 'object' && !repaired.startsWith('{')) {
    repaired = '{' + repaired + '}';
  } else if (expectedType === 'array' && !repaired.startsWith('[')) {
    repaired = '[' + repaired + ']';
  }
  
  console.log('🔧 Aggressively repaired JSON:', repaired.substring(0, 200) + (repaired.length > 200 ? '...' : ''));
  
  return repaired;
}

// Enhanced JSON repair function with more comprehensive patterns
function repairIncompleteJSON(jsonText: string): string {
  console.log('🔧 Attempting comprehensive JSON repair...');
  
  if (!jsonText || jsonText.trim().length === 0) {
    return '{}';
  }
  
  let repaired = jsonText.trim();
  
  try {
    // First, try to parse as-is
    JSON.parse(repaired);
    console.log('✅ JSON is already valid');
    return repaired;
  } catch (error) {
    console.log('⚠️ JSON needs repair:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Repair pattern 1: Fix common Gemini response issues
  // Remove any text before the first { or [
  repaired = repaired.replace(/^[^{[]*/, '');
  
  // Remove any text after the last } or ]
  repaired = repaired.replace(/[^}\]]*$/, '');
  
  // Repair pattern 2: Fix unterminated strings
  repaired = repaired.replace(/"\s*$/, '"');
  repaired = repaired.replace(/^[^"]*"/, '"');
  
  // Repair pattern 3: Fix incomplete objects and arrays
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;
  
  // Add missing closing braces
  for (let i = 0; i < openBraces - closeBraces; i++) {
    repaired += '}';
  }
  
  // Add missing closing brackets
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    repaired += ']';
  }
  
  // Repair pattern 4: Fix trailing commas
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  // Repair pattern 5: Fix missing quotes around keys
  repaired = repaired.replace(/(\w+):/g, '"$1":');
  
  // Repair pattern 6: Fix missing quotes around string values (more careful)
  repaired = repaired.replace(/:\s*([^",{\[\s][^",}\]\]]*?)(\s*[,}\]])/g, (match, value, ending) => {
    // Only add quotes if the value doesn't already have quotes and isn't a number/boolean/null
    if (!/^["\d\-]/.test(value) && value !== 'true' && value !== 'false' && value !== 'null') {
      return `: "${value}"${ending}`;
    }
    return match;
  });
  
  // Repair pattern 7: Fix incomplete clothing analysis objects
  if (repaired.includes('"category"') && !repaired.includes('"confidence"')) {
    repaired = repaired.replace(/(\}$)/, ', "confidence": 0.8$1');
  }
  
  // Repair pattern 8: Fix incomplete outfit objects
  if (repaired.includes('"items"') && !repaired.includes('"score"')) {
    repaired = repaired.replace(/(\}$)/, ', "score": 85, "reasoning": "Professional outfit combination", "occasion": "casual", "colorScheme": "Classic combination", "styleNotes": ["Well-coordinated"], "confidence": 0.8$1');
  }
  
  // Repair pattern 9: Ensure proper JSON structure
  if (!repaired.startsWith('{') && !repaired.startsWith('[')) {
    repaired = '{' + repaired + '}';
  }
  
  console.log('🔧 Repaired JSON:', repaired.substring(0, 200) + (repaired.length > 200 ? '...' : ''));
  
  return repaired;
}


// Validate and complete outfit objects
function validateAndCompleteOutfit(outfit: any, index: number, occasion: string): any {
  return {
    outfitId: outfit.outfitId || `outfit_${index + 1}`,
    top: outfit.top || '',
    bottom: outfit.bottom || '',
    shoe: outfit.shoe || '',
    accessory: outfit.accessory || '',
    score: Math.min(Math.max(outfit.score || 70, 0), 100),
    reasoning: outfit.reasoning || 'Professional outfit combination',
    occasion: outfit.occasion || occasion,
    colorScheme: outfit.colorScheme || 'Classic combination',
    styleNotes: Array.isArray(outfit.styleNotes) ? outfit.styleNotes : ['Well-coordinated'],
    confidence: Math.min(Math.max(outfit.confidence || 0.8, 0), 1)
  };
}

// Advanced outfit generation with Gemini 2.5 Pro's superior analysis
export async function generateOutfitRecommendations(
  clothingItems: Array<{id: string, category: string, color: string, material: string, image_url: string, style?: string}>,
  occasion: string = 'casual'
): Promise<OutfitRecommendation[]> {
  console.log('👔 Generating advanced outfit recommendations with Gemini 2.5 Pro...');
  
  const genAI = getGeminiClient();
  
  if (!genAI || !process.env.GEMINI_API_KEY) {
    console.log('⚠️ Gemini API not available, using advanced fallback recommendations');
    return generateAdvancedFallbackRecommendations(clothingItems, occasion);
  }

  try {
    // Prepare detailed wardrobe data with enhanced information
    const wardrobeData = clothingItems.map(item => 
      `${item.category.toUpperCase()}: ${item.color} ${item.material}${item.style ? ` (${item.style} style)` : ''} (ID: ${item.id})`
    ).join('\n');

    // Enhanced prompt leveraging Gemini 2.5 Pro's advanced capabilities
    const prompt = `Create outfit recommendations for ${occasion} occasions.

WARDROBE:
${wardrobeData}

CRITICAL JSON FORMAT REQUIREMENTS:
- Return ONLY a valid JSON array starting with [ and ending with ]
- Each outfit object must have ALL required fields
- Use ONLY the item IDs provided in the wardrobe list above
- Ensure proper JSON syntax: quotes around strings, no trailing commas
- No explanations, comments, or additional text outside the JSON
- Must be parseable by JSON.parse()

REQUIRED JSON ARRAY FORMAT:
[
  {
    "outfitId": "outfit_1",
    "top": "item_id",
    "bottom": "item_id", 
    "shoe": "item_id",
    "accessory": "item_id",
    "score": 85,
    "reasoning": "Brief explanation",
    "occasion": "${occasion}",
    "colorScheme": "color description",
    "styleNotes": ["note1", "note2"],
    "confidence": 0.9
  }
]

Return ONLY the JSON array above, no other text or explanations.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4000,
        candidateCount: 1,
        stopSequences: [],
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
      ]
    });
    
    console.log('✅ Gemini model initialized:', model);
    
    console.log('📡 Calling Gemini 2.5 Pro for advanced outfit generation...');
    console.log('📝 Prompt length:', prompt.length);
    console.log('📝 Prompt preview:', prompt.substring(0, 200) + '...');
    
    // Enhanced Gemini API call with better error handling
    let result;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`🔄 Gemini API attempt ${attempts + 1}/${maxAttempts}`);
        
        // Check if model is properly initialized
        if (!model) {
          throw new Error('Gemini model not properly initialized');
        }
        
        result = await model.generateContent(prompt);
        
        // Check if result is valid
        if (!result || !result.response) {
          throw new Error('Invalid response from Gemini API');
        }
        
        // Check for empty text response
        const response = await result.response;
        const text = response?.text();
        
        if (!text || text.trim().length === 0) {
          console.log(`⚠️ Empty response on attempt ${attempts + 1}`);
          throw new Error('Empty text response from Gemini API');
        }
        
        console.log('✅ Gemini API call successful with valid content');
        break;
        
      } catch (apiError) {
        attempts++;
        console.log(`⚠️ Gemini API attempt ${attempts} failed:`, apiError);
        console.log(`⚠️ Error type:`, typeof apiError);
        console.log(`⚠️ Error message:`, apiError instanceof Error ? apiError.message : 'Unknown error');
        
        if (attempts >= maxAttempts) {
          console.log('❌ All Gemini API attempts failed, using fallback');
          throw new Error(`Gemini API failed after ${maxAttempts} attempts: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
        }
        
        // Wait before retry with exponential backoff
        const delay = 1000 * Math.pow(2, attempts - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    if (!result) {
      console.log('⚠️ No result after retries, using fallback');
      return generateAdvancedFallbackRecommendations(clothingItems, occasion);
    }
    
    const response = await result.response;
    
    // Enhanced response debugging
    console.log('🔍 Gemini response object:', {
      hasResponse: !!response,
      responseType: typeof response,
      responseKeys: response ? Object.keys(response) : 'no response'
    });
    
    // Check if response is valid
    if (!response) {
      console.log('❌ No response object received from Gemini API');
      throw new Error('No response received from Gemini API');
    }
    
    // Enhanced text extraction with debugging
    let text: string;
    try {
      text = response.text();
      console.log('📝 Extracted text length:', text?.length || 0);
      console.log('📝 Text preview:', text?.substring(0, 100) + (text?.length > 100 ? '...' : ''));
    } catch (textError) {
      console.log('❌ Error extracting text from response:', textError);
      console.log('🔍 Response structure:', JSON.stringify(response, null, 2));
      throw new Error(`Failed to extract text from response: ${textError instanceof Error ? textError.message : 'Unknown error'}`);
    }
    
    // Check if text is valid
    if (!text || text.trim().length === 0) {
      console.log('⚠️ Empty text response from Gemini API');
      console.log('🔍 Full response object:', JSON.stringify(response, null, 2));
      
      // Check for safety filters or blocked content
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        console.log('🔍 Candidate info:', {
          finishReason: candidate.finishReason,
          safetyRatings: candidate.safetyRatings,
          hasContent: !!candidate.content,
          contentParts: candidate.content?.parts?.length || 0
        });
        
        if (candidate.finishReason === 'SAFETY') {
          console.log('🚫 Response blocked by safety filters');
          throw new Error('Response blocked by Gemini safety filters');
        }
        
        if (candidate.safetyRatings) {
          console.log('🚫 Safety ratings:', candidate.safetyRatings);
        }
      }
      
      throw new Error('Empty text response from Gemini API');
    }
    
    console.log('📝 Advanced outfit recommendations:', text);
    
    // Enhanced JSON parsing with multiple extraction strategies
    let recommendations = parseGeminiResponse(text, 'array');
    
    if (!recommendations || !Array.isArray(recommendations)) {
      throw new Error('Failed to extract valid JSON array from Gemini response');
    }
    
    // Check if array is empty
    if (recommendations.length === 0) {
      console.log('⚠️ Empty recommendations array, using fallback');
      throw new Error('Empty recommendations array');
    }
    
    // Validate and complete each recommendation
    recommendations = recommendations.map((outfit: any, index: number) => {
      return validateAndCompleteOutfit(outfit, index, occasion);
    });
    
    console.log(`✅ Generated ${recommendations.length} advanced outfit recommendations`);
    return recommendations;
    
  } catch (error) {
    console.error('❌ Advanced outfit generation failed:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Enhanced error logging for better debugging
    if (error instanceof Error) {
      if (error.message.includes('Failed to extract valid JSON array')) {
        console.log('🔍 JSON array extraction failed - using fallback');
      } else if (error.message.includes('Empty response')) {
        console.log('🔍 Empty response from Gemini - using fallback');
      } else if (error.message.includes('Empty recommendations array')) {
        console.log('🔍 Empty recommendations array - using fallback');
      } else if (error.message.includes('Gemini API failed')) {
        console.log('🔍 Gemini API failure - using fallback');
      } else {
        console.log('⚠️ Unknown outfit generation error - using fallback');
        console.log('📝 Error stack:', error.stack?.substring(0, 300) + (error.stack && error.stack.length > 300 ? '...' : ''));
      }
    }
    
    return generateAdvancedFallbackRecommendations(clothingItems, occasion);
  }
}

// Test function to verify Gemini API connectivity and response
export async function testGeminiAPI(): Promise<{success: boolean, message: string, response?: any}> {
  try {
    console.log('🧪 Testing Gemini API connectivity...');
    
    // Check environment variable first
    if (!process.env.GEMINI_API_KEY) {
      console.log('❌ Gemini API key not configured');
      return { 
        success: false, 
        message: 'Gemini API key not configured. Please check your environment variables.' 
      };
    }
    
    console.log('✅ Gemini API key found, initializing client...');
    
    const genAI = getGeminiClient();
    
    if (!genAI) {
      console.log('❌ Failed to initialize Gemini client');
      return { 
        success: false, 
        message: 'Failed to initialize Gemini client' 
      };
    }
    
    console.log('✅ Gemini client initialized, creating model...');
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 500,
        candidateCount: 1,
        stopSequences: [],
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
      ]
    });
    
    console.log('✅ Model created, sending test prompt...');
    
    const testPrompt = 'Return ONLY this JSON: {"test": "success", "message": "API working"}';
    
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    
    if (!response) {
      return { success: false, message: 'No response received from Gemini API' };
    }
    
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      console.log('🔍 Response object:', JSON.stringify(response, null, 2));
      return { success: false, message: 'Empty text response from Gemini API', response };
    }
    
    console.log('✅ Gemini API test successful');
    console.log('📝 Test response:', text);
    
    return { success: true, message: 'Gemini API is working correctly', response: text };
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    return { 
      success: false, 
      message: `Gemini API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      response: error
    };
  }
}
function generateAdvancedFallbackRecommendations(
  clothingItems: Array<{id: string, category: string, color: string, material: string, image_url: string, style?: string}>,
  occasion: string
): OutfitRecommendation[] {
  console.log('🔄 Using advanced fallback outfit generation...');
  
  const tops = clothingItems.filter(item => item.category === 'top');
  const bottoms = clothingItems.filter(item => item.category === 'bottom');
  const shoes = clothingItems.filter(item => item.category === 'shoe');
  const accessories = clothingItems.filter(item => item.category === 'accessory');

  const outfits: OutfitRecommendation[] = [];
  let outfitId = 1;

  // Advanced color harmony logic
  const colorHarmonyRules = {
    // Monochromatic combinations
    'black': ['black', 'gray', 'charcoal', 'white'],
    'white': ['white', 'cream', 'beige', 'black'],
    'navy': ['navy', 'white', 'gray', 'black'],
    'gray': ['gray', 'black', 'white', 'charcoal'],
    'brown': ['brown', 'tan', 'beige', 'cream'],
    'burgundy': ['burgundy', 'white', 'black', 'gray'],
    'denim': ['denim', 'white', 'black', 'gray']
  };

  // Material compatibility rules
  const materialCompatibility = {
    'formal': ['silk', 'wool', 'cotton', 'linen'],
    'casual': ['cotton', 'denim', 'polyester', 'wool'],
    'sporty': ['polyester', 'cotton', 'synthetic'],
    'business': ['wool', 'cotton', 'silk', 'linen']
  };

  // Generate sophisticated combinations
  for (const top of tops.slice(0, 4)) {
    for (const bottom of bottoms.slice(0, 4)) {
      // Check color harmony
      const topColor = top.color.toLowerCase();
      const bottomColor = bottom.color.toLowerCase();
      
      let colorScore = 0;
      let colorScheme = 'Classic combination';
      
      // Apply color harmony rules
      for (const [baseColor, compatibleColors] of Object.entries(colorHarmonyRules)) {
        if (topColor.includes(baseColor) && compatibleColors.some(c => bottomColor.includes(c))) {
          colorScore = 85;
          colorScheme = `Monochromatic ${baseColor} scheme`;
          break;
        }
      }
      
      // If no specific harmony found, use basic compatibility
      if (colorScore === 0) {
        if ((topColor.includes('black') && bottomColor.includes('white')) ||
            (topColor.includes('white') && bottomColor.includes('black')) ||
            (topColor.includes('navy') && bottomColor.includes('white')) ||
            (topColor.includes('white') && bottomColor.includes('navy'))) {
          colorScore = 80;
          colorScheme = 'High contrast combination';
        } else {
          colorScore = 70;
          colorScheme = 'Complementary pairing';
        }
      }

      // Select appropriate shoes and accessories
      const appropriateShoes = shoes.filter(shoe => {
        const shoeColor = shoe.color.toLowerCase();
        return (colorHarmonyRules as Record<string, string[]>)[topColor]?.includes(shoeColor) || 
               shoeColor.includes('black') || 
               shoeColor.includes('brown');
      });
      
      const appropriateAccessories = accessories.filter(acc => {
        const accColor = acc.color.toLowerCase();
        return (colorHarmonyRules as Record<string, string[]>)[topColor]?.includes(accColor) || 
               accColor.includes('black') || 
               accColor.includes('brown') ||
               accColor.includes('gold') ||
               accColor.includes('silver');
      });

      const shoe = appropriateShoes.length > 0 ? appropriateShoes[0] : shoes[0];
      const accessory = appropriateAccessories.length > 0 ? appropriateAccessories[0] : accessories[0];

      // Calculate overall score
      let materialScore = 70;
      if (top.material === bottom.material) {
        materialScore = 85;
      } else if (['cotton', 'denim'].includes(top.material) && ['cotton', 'denim'].includes(bottom.material)) {
        materialScore = 80;
      }

      const overallScore = Math.round((colorScore + materialScore) / 2);

      // Generate sophisticated reasoning
      const reasoning = `This ${top.color} ${top.material} top paired with ${bottom.color} ${bottom.material} bottom creates a ${colorScheme.toLowerCase()}. The combination demonstrates ${overallScore >= 80 ? 'excellent' : 'good'} color harmony and material compatibility, making it perfect for ${occasion} occasions.`;

      const styleNotes = [
        overallScore >= 85 ? 'High fashion appeal' : 'Classic styling',
        colorScore >= 80 ? 'Excellent color coordination' : 'Good color balance',
        materialScore >= 80 ? 'Material harmony' : 'Complementary textures',
        occasion === 'formal' ? 'Professional appearance' : 'Versatile styling'
      ];

      outfits.push({
        outfitId: `advanced_${outfitId++}`,
        top: top.id,
        bottom: bottom.id,
        shoe: shoe?.id,
        accessory: accessory?.id,
        score: overallScore,
        reasoning,
        occasion,
        colorScheme,
        styleNotes,
        confidence: Math.min(overallScore / 100, 0.9)
      });

      if (outfits.length >= 8) break;
    }
    if (outfits.length >= 8) break;
  }

  // Sort by score and return top recommendations
  return outfits.sort((a, b) => b.score - a.score).slice(0, 8);
}
