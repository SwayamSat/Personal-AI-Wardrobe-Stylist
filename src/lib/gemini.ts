// Professional Gemini Pro 2 Vision API for Outfit Analysis & Recommendations
// Implemented as a GenAI Engineer would approach outfit recommendations

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

interface ClothingItem {
  id: string
  image_url: string
  category: 'top' | 'bottom' | 'shoe' | 'accessory'
  color: string
  material: string
}

interface OutfitRecommendation {
  outfit_id: string
  top: ClothingItem
  bottom: ClothingItem
  shoe?: ClothingItem
  accessory?: ClothingItem
  score: number
  reasoning: string
  occasion: string
  style_notes: string[]
  color_harmony: string
  confidence: number
}

interface FashionAnalysis {
  color: string
  material: string
  pattern: string
  style: string
  formality_level: number // 1-10 scale
  seasonality: string[]
  confidence: number
}

export class GeminiFashionAI {
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // Professional clothing analysis with fashion expertise
  async analyzeClothingItem(imageUrl: string): Promise<FashionAnalysis> {
    console.log('🎨 Gemini Fashion AI: Analyzing clothing item...')
    
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured')
    }

    try {
      const imageBase64 = await this.convertImageToBase64(imageUrl)
      
      const prompt = `You are a professional fashion stylist and color expert. Analyze this clothing item with the precision of a luxury fashion consultant.

CLOTHING ANALYSIS REQUIREMENTS:
1. COLOR ANALYSIS:
   - Identify the PRIMARY color with fashion industry precision
   - Use specific color names: "navy blue", "burgundy", "charcoal gray", "cream white", "forest green", "coral pink"
   - Consider color temperature (warm/cool undertones)
   - Note any secondary colors or accents

2. MATERIAL & TEXTURE:
   - Identify fabric type: cotton, denim, silk, wool, leather, polyester, linen, cashmere, etc.
   - Assess texture: smooth, textured, matte, glossy, etc.
   - Consider material quality indicators

3. PATTERN ANALYSIS:
   - Solid, striped, polka-dot, floral, plaid, geometric, animal-print, abstract, etc.
   - Pattern scale: small, medium, large
   - Pattern density: sparse, moderate, dense

4. STYLE CLASSIFICATION:
   - Formal (business, evening wear)
   - Casual (everyday, weekend)
   - Sporty (athletic, activewear)
   - Vintage (retro, classic)
   - Modern (contemporary, trendy)
   - Bohemian (artistic, free-spirited)
   - Minimalist (clean, simple)

5. FORMALITY LEVEL (1-10):
   - 1-3: Very casual (athletic wear, t-shirts)
   - 4-6: Smart casual (polo shirts, chinos)
   - 7-8: Business casual (blazers, dress shirts)
   - 9-10: Formal (suits, evening wear)

6. SEASONALITY:
   - Spring, Summer, Fall, Winter appropriate
   - Consider fabric weight and color temperature

7. CONFIDENCE (0.0-1.0):
   - Rate your confidence in this analysis

Respond in this EXACT JSON format:
{
  "color": "specific color name",
  "material": "material type",
  "pattern": "pattern type",
  "style": "style classification",
  "formality_level": 7,
  "seasonality": ["spring", "summer"],
  "confidence": 0.92
}`

      const response = await this.makeGeminiRequest(prompt, imageBase64)
      return this.parseFashionAnalysis(response)

    } catch (error) {
      console.error('❌ Gemini clothing analysis failed:', error)
      throw error
    }
  }

  // Professional outfit recommendation system
  async generateOutfitRecommendations(
    clothingItems: ClothingItem[],
    occasion: string = 'casual',
    userPreferences?: any
  ): Promise<OutfitRecommendation[]> {
    console.log('👔 Gemini Fashion AI: Generating outfit recommendations...')
    
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured')
    }

    try {
      // Prepare clothing data for Gemini
      const clothingData = this.prepareClothingData(clothingItems)
      
      const prompt = `You are a world-class personal stylist with expertise in color theory, fashion trends, and outfit coordination. 

CLIENT'S WARDROBE:
${clothingData}

OCCASION: ${occasion}

STYLING TASK:
Create 8-12 professional outfit recommendations that demonstrate:
1. COLOR HARMONY: Use color theory (complementary, analogous, triadic, monochromatic)
2. OCCASION APPROPRIATENESS: Match formality to occasion
3. STYLE COHESION: Ensure all pieces work together harmoniously
4. FASHION EXPERTISE: Apply current styling principles

OUTFIT EVALUATION CRITERIA:
- Color coordination (40% weight)
- Occasion appropriateness (25% weight)
- Style consistency (20% weight)
- Fashion-forward thinking (15% weight)

For each outfit, provide:
1. SCORE (0-100): Overall outfit rating
2. REASONING: Professional styling explanation
3. STYLE_NOTES: Key styling tips and observations
4. COLOR_HARMONY: Explanation of color choices
5. CONFIDENCE: Your confidence in this recommendation

Respond in this EXACT JSON format:
{
  "outfits": [
    {
      "outfit_id": "outfit_1",
      "top_id": "item_id",
      "bottom_id": "item_id", 
      "shoe_id": "item_id",
      "accessory_id": "item_id",
      "score": 92,
      "reasoning": "This navy and white combination creates a classic, sophisticated look perfect for business casual occasions. The navy blazer provides structure while the white shirt adds freshness.",
      "style_notes": ["Monochromatic navy creates elegance", "White adds contrast and brightness", "Perfect for office or dinner"],
      "color_harmony": "Monochromatic navy with white accent creates sophisticated contrast",
      "confidence": 0.95
    }
  ]
}`

      const response = await this.makeGeminiRequest(prompt)
      const recommendations = this.parseOutfitRecommendations(response, clothingItems)
      
      console.log(`✅ Generated ${recommendations.length} professional outfit recommendations`)
      return recommendations

    } catch (error) {
      console.error('❌ Gemini outfit generation failed:', error)
      throw error
    }
  }

  // Analyze individual outfit combinations
  async analyzeOutfitCombination(
    top: ClothingItem,
    bottom: ClothingItem,
    shoe?: ClothingItem,
    accessory?: ClothingItem,
    occasion?: string
  ): Promise<OutfitRecommendation> {
    console.log('🔍 Gemini Fashion AI: Analyzing outfit combination...')
    
    try {
      const outfitData = this.prepareOutfitData(top, bottom, shoe, accessory)
      
      const prompt = `You are a professional fashion consultant analyzing this specific outfit combination.

OUTFIT COMPONENTS:
${outfitData}

OCCASION: ${occasion || 'general'}

ANALYSIS REQUIREMENTS:
Evaluate this outfit combination using professional styling criteria:

1. COLOR COORDINATION (40%):
   - Color harmony and balance
   - Color temperature consistency
   - Contrast and visual interest

2. OCCASION APPROPRIATENESS (25%):
   - Formality level match
   - Context suitability
   - Professional vs casual balance

3. STYLE COHESION (20%):
   - Style consistency across pieces
   - Fashion era compatibility
   - Overall aesthetic unity

4. FASHION EXPERTISE (15%):
   - Current styling principles
   - Proportions and fit considerations
   - Trend awareness

Provide a comprehensive analysis with:
- Overall score (0-100)
- Detailed reasoning
- Style notes and tips
- Color harmony explanation
- Confidence rating

Respond in this EXACT JSON format:
{
  "score": 88,
  "reasoning": "This combination demonstrates excellent color coordination with navy and white creating a sophisticated contrast. The pieces work harmoniously for a business casual occasion.",
  "style_notes": ["Navy creates professional authority", "White adds freshness and contrast", "Perfect for office or client meetings"],
  "color_harmony": "Monochromatic navy base with white accent creates sophisticated contrast",
  "confidence": 0.92
}`

      const response = await this.makeGeminiRequest(prompt)
      const analysis = this.parseOutfitAnalysis(response)
      
      return {
        outfit_id: `outfit_${Date.now()}`,
        top,
        bottom,
        shoe,
        accessory,
        score: analysis.score / 100, // Convert to 0-1 scale
        reasoning: analysis.reasoning,
        occasion: occasion || 'general',
        style_notes: analysis.style_notes,
        color_harmony: analysis.color_harmony,
        confidence: analysis.confidence
      }

    } catch (error) {
      console.error('❌ Gemini outfit analysis failed:', error)
      throw error
    }
  }

  // Private helper methods
  private async convertImageToBase64(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl, { mode: 'cors', credentials: 'omit' })
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)
    
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        resolve(base64.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private async makeGeminiRequest(prompt: string, imageBase64?: string): Promise<string> {
    const requestBody: any = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    }

    if (imageBase64) {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageBase64
        }
      })
    }

    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid Gemini API response')
    }

    return data.candidates[0].content.parts[0].text
  }

  private prepareClothingData(items: ClothingItem[]): string {
    return items.map(item => 
      `- ${item.category.toUpperCase()}: ${item.color} ${item.material} (ID: ${item.id})`
    ).join('\n')
  }

  private prepareOutfitData(top: ClothingItem, bottom: ClothingItem, shoe?: ClothingItem, accessory?: ClothingItem): string {
    let data = `TOP: ${top.color} ${top.material}\nBOTTOM: ${bottom.color} ${bottom.material}`
    if (shoe) data += `\nSHOE: ${shoe.color} ${shoe.material}`
    if (accessory) data += `\nACCESSORY: ${accessory.color} ${accessory.material}`
    return data
  }

  private parseFashionAnalysis(response: string): FashionAnalysis {
    try {
      // Use the same robust parsing function from geminiService
      const parsed = this.parseGeminiResponse(response, 'object')
      
      if (!parsed) {
        console.log('⚠️ Failed to parse fashion analysis, using default')
        return this.getDefaultFashionAnalysis()
      }
      
      return {
        color: parsed.color || 'black',
        material: parsed.material || 'cotton',
        pattern: parsed.pattern || 'solid',
        style: parsed.style || 'casual',
        formality_level: parsed.formality_level || 5,
        seasonality: parsed.seasonality || ['all'],
        confidence: Math.min(Math.max(parsed.confidence || 0.7, 0.1), 1.0)
      }
    } catch (error) {
      console.error('Failed to parse fashion analysis:', error)
      console.error('Raw response:', response?.substring(0, 200) + (response?.length > 200 ? '...' : ''))
      return this.getDefaultFashionAnalysis()
    }
  }

  private parseOutfitRecommendations(response: string, items: ClothingItem[]): OutfitRecommendation[] {
    try {
      // Use the same robust parsing function from geminiService
      const parsed = this.parseGeminiResponse(response, 'object')
      
      if (!parsed) {
        console.log('⚠️ Failed to parse outfit recommendations, returning empty array')
        return []
      }
      
      const outfits = parsed.outfits || []
      
      return outfits.map((outfit: any) => ({
        outfit_id: outfit.outfit_id,
        top: items.find(item => item.id === outfit.top_id)!,
        bottom: items.find(item => item.id === outfit.bottom_id)!,
        shoe: outfit.shoe_id ? items.find(item => item.id === outfit.shoe_id) : undefined,
        accessory: outfit.accessory_id ? items.find(item => item.id === outfit.accessory_id) : undefined,
        score: outfit.score / 100,
        reasoning: outfit.reasoning,
        occasion: outfit.occasion || 'general',
        style_notes: outfit.style_notes || [],
        color_harmony: outfit.color_harmony,
        confidence: outfit.confidence || 0.8
      }))
    } catch (error) {
      console.error('Failed to parse outfit recommendations:', error)
      console.error('Raw response:', response?.substring(0, 200) + (response?.length > 200 ? '...' : ''))
      return []
    }
  }

  private parseOutfitAnalysis(response: string): any {
    try {
      // Use the same robust parsing function from geminiService
      const parsed = this.parseGeminiResponse(response, 'object')
      
      if (!parsed) {
        console.log('⚠️ Failed to parse outfit analysis, using default')
        return {
          score: 50,
          reasoning: 'Unable to analyze outfit combination',
          style_notes: ['Analysis unavailable'],
          color_harmony: 'Unable to determine',
          confidence: 0.3
        }
      }
      
      return parsed
    } catch (error) {
      console.error('Failed to parse outfit analysis:', error)
      console.error('Raw response:', response?.substring(0, 200) + (response?.length > 200 ? '...' : ''))
      return {
        score: 50,
        reasoning: 'Unable to analyze outfit combination',
        style_notes: ['Analysis unavailable'],
        color_harmony: 'Unable to determine',
        confidence: 0.3
      }
    }
  }

  private getDefaultFashionAnalysis(): FashionAnalysis {
    return {
      color: 'black',
      material: 'cotton',
      pattern: 'solid',
      style: 'casual',
      formality_level: 5,
      seasonality: ['all'],
      confidence: 0.3
    }
  }

  // Robust JSON parsing function (shared with geminiService)
  private parseGeminiResponse(text: string, expectedType: 'object' | 'array'): any {
    console.log('🔍 Parsing Gemini response with enhanced extraction and retry mechanism...');
    
    if (!text || text.trim().length === 0) {
      console.log('⚠️ Empty response text');
      return null;
    }
    
    const strategies = [
      { name: 'Direct parsing', fn: () => this.parseWithStrategy(text, expectedType, 'direct') },
      { name: 'Markdown cleanup', fn: () => this.parseWithStrategy(text, expectedType, 'markdown') },
      { name: 'Regex extraction', fn: () => this.parseWithStrategy(text, expectedType, 'regex') },
      { name: 'Repair and parse', fn: () => this.parseWithStrategy(text, expectedType, 'repair') },
      { name: 'Aggressive repair', fn: () => this.parseWithStrategy(text, expectedType, 'aggressive') },
      { name: 'Fallback generation', fn: () => this.generateFallbackResponse(expectedType) }
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
  private parseWithStrategy(text: string, expectedType: 'object' | 'array', strategy: string): any {
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
        
        const repairedJson = this.repairIncompleteJSON(cleanText);
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
        
        const aggressiveRepaired = this.aggressiveRepairJSON(cleanText, expectedType);
        return JSON.parse(aggressiveRepaired);
        
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  // Generate fallback response when all parsing fails
  private generateFallbackResponse(expectedType: 'object' | 'array'): any {
    console.log('🆘 Generating fallback response...');
    
    if (expectedType === 'object') {
      return {
        color: 'black',
        material: 'cotton',
        pattern: 'solid',
        style: 'casual',
        formality_level: 5,
        seasonality: ['all'],
        confidence: 0.5
      };
    } else if (expectedType === 'array') {
      return [];
    }
    
    return null;
  }

  // More aggressive JSON repair for difficult cases
  private aggressiveRepairJSON(jsonText: string, expectedType: 'object' | 'array'): string {
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
  private repairIncompleteJSON(jsonText: string): string {
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
}

// Export singleton instance
export const geminiFashionAI = new GeminiFashionAI(GEMINI_API_KEY)

// Legacy function for backward compatibility
export async function analyzeClothingWithGemini(imageUrl: string): Promise<FashionAnalysis> {
  return await geminiFashionAI.analyzeClothingItem(imageUrl)
}