// Professional Color Analysis Utility
// Advanced color detection and material analysis

export interface ColorAnalysis {
  dominantColor: string;
  secondaryColors: string[];
  colorPalette: string[];
  materialGuess: string;
  confidence: number;
}

export interface MaterialAnalysis {
  material: string;
  texture: string;
  weight: 'light' | 'medium' | 'heavy';
  confidence: number;
}

// Professional color palette for fashion - expanded with more specific colors
const FASHION_COLORS = {
  // Neutrals
  'black': [0, 0, 0], 'charcoal': [54, 69, 79], 'dark_gray': [64, 64, 64],
  'gray': [128, 128, 128], 'light_gray': [192, 192, 192], 'white': [255, 255, 255],
  'cream': [255, 253, 208], 'beige': [245, 245, 220], 'tan': [210, 180, 140],
  'ivory': [255, 255, 240], 'off_white': [250, 250, 250], 'silver': [192, 192, 192],
  
  // Blues
  'navy': [0, 0, 128], 'royal_blue': [65, 105, 225], 'sky_blue': [135, 206, 235],
  'teal': [0, 128, 128], 'turquoise': [64, 224, 208], 'cobalt': [0, 71, 171],
  'midnight_blue': [25, 25, 112], 'steel_blue': [70, 130, 180], 'powder_blue': [176, 224, 230],
  'denim_blue': [21, 96, 189], 'electric_blue': [125, 249, 255],
  
  // Reds
  'burgundy': [128, 0, 32], 'maroon': [128, 0, 0], 'crimson': [220, 20, 60],
  'scarlet': [255, 36, 0], 'rose': [255, 228, 225], 'coral': [255, 127, 80],
  'cherry_red': [222, 49, 99], 'wine': [114, 47, 55], 'ruby': [224, 17, 95],
  'brick_red': [203, 65, 84], 'cardinal': [196, 30, 58],
  
  // Greens
  'forest_green': [34, 139, 34], 'olive': [128, 128, 0], 'sage': [158, 183, 158],
  'mint': [152, 251, 152], 'emerald': [80, 200, 120], 'hunter_green': [53, 94, 59],
  'lime_green': [50, 205, 50], 'jade': [0, 168, 107], 'pine_green': [1, 121, 111],
  'army_green': [75, 83, 32], 'kelly_green': [76, 187, 23],
  
  // Purples
  'plum': [142, 69, 133], 'lavender': [230, 230, 250], 'violet': [238, 130, 238],
  'purple': [128, 0, 128], 'amethyst': [153, 102, 204], 'eggplant': [97, 64, 81],
  'mauve': [224, 176, 255], 'periwinkle': [204, 204, 255], 'orchid': [218, 112, 214],
  
  // Browns
  'chocolate': [123, 63, 0], 'coffee': [111, 78, 55], 'camel': [193, 154, 107],
  'mahogany': [192, 64, 0], 'chestnut': [149, 69, 53], 'mocha': [150, 75, 0],
  'caramel': [255, 213, 154], 'bronze': [205, 127, 50], 'copper': [184, 115, 51],
  
  // Yellows/Oranges
  'gold': [255, 215, 0], 'mustard': [255, 219, 88], 'amber': [255, 191, 0],
  'orange': [255, 165, 0], 'peach': [255, 218, 185], 'apricot': [251, 206, 177],
  'lemon': [255, 247, 0], 'canary': [255, 239, 0], 'honey': [255, 195, 11],
  
  // Pinks
  'blush': [222, 93, 131], 'dusty_rose': [188, 143, 143], 'magenta': [255, 0, 255],
  'fuchsia': [255, 119, 255], 'salmon': [250, 128, 114], 'bubblegum': [255, 193, 204],
  'rose_gold': [231, 172, 207], 'hot_pink': [255, 105, 180], 'baby_pink': [244, 194, 194]
};

// Material detection based on color patterns - enhanced
const MATERIAL_PATTERNS = {
  'denim': {
    colors: ['navy', 'denim_blue', 'royal_blue', 'midnight_blue', 'steel_blue'],
    textures: ['rough', 'textured'],
    confidence: 0.8
  },
  'leather': {
    colors: ['black', 'brown', 'chocolate', 'tan', 'mahogany', 'chestnut'],
    textures: ['smooth', 'shiny'],
    confidence: 0.9
  },
  'cotton': {
    colors: ['white', 'cream', 'beige', 'navy', 'black', 'gray', 'ivory'],
    textures: ['soft', 'matte'],
    confidence: 0.7
  },
  'silk': {
    colors: ['white', 'cream', 'black', 'navy', 'burgundy', 'ivory', 'off_white'],
    textures: ['smooth', 'shiny', 'flowing'],
    confidence: 0.8
  },
  'wool': {
    colors: ['gray', 'charcoal', 'black', 'navy', 'burgundy', 'dark_gray'],
    textures: ['textured', 'thick'],
    confidence: 0.8
  },
  'polyester': {
    colors: ['white', 'black', 'navy', 'gray', 'bright colors'],
    textures: ['smooth', 'synthetic'],
    confidence: 0.6
  },
  'linen': {
    colors: ['cream', 'beige', 'white', 'tan', 'ivory'],
    textures: ['textured', 'natural'],
    confidence: 0.7
  },
  'cashmere': {
    colors: ['gray', 'charcoal', 'cream', 'beige', 'burgundy'],
    textures: ['soft', 'luxurious'],
    confidence: 0.9
  },
  'suede': {
    colors: ['brown', 'tan', 'chocolate', 'camel', 'mahogany'],
    textures: ['textured', 'matte'],
    confidence: 0.8
  }
};

export function analyzeImageColorsAdvanced(imageBase64: string): Promise<ColorAnalysis> {
  return new Promise((resolve) => {
    console.log('🎨 Starting advanced color analysis...');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      console.log('⚠️ Not in browser environment, using fallback');
      resolve({
        dominantColor: 'black',
        secondaryColors: ['black'],
        colorPalette: ['black'],
        materialGuess: 'cotton',
        confidence: 0.3
      });
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      console.log('📸 Image loaded, analyzing colors...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.log('❌ Canvas context failed');
        resolve({
          dominantColor: 'black',
          secondaryColors: ['black'],
          colorPalette: ['black'],
          materialGuess: 'cotton',
          confidence: 0.3
        });
        return;
      }
      
      // Resize for performance
      const maxSize = 200;
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      console.log(`🔍 Analyzing ${pixels.length / 4} pixels...`);
      
      const colorCounts: {[key: string]: number} = {};
      let totalPixels = 0;
      
      // Sample every 4th pixel for performance
      for (let i = 0; i < pixels.length; i += 16) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Skip transparent/white background pixels
        if (r > 240 && g > 240 && b > 240) continue;
        
        totalPixels++;
        const closestColor = getClosestFashionColor(r, g, b);
        colorCounts[closestColor] = (colorCounts[closestColor] || 0) + 1;
      }
      
      console.log(`📊 Analyzed ${totalPixels} pixels, found ${Object.keys(colorCounts).length} colors`);
      console.log('🎨 Color counts:', colorCounts);
      
      // Sort colors by frequency
      const sortedColors = Object.entries(colorCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([color]) => color);
      
      const dominantColor = sortedColors[0] || 'black';
      const secondaryColors = sortedColors.slice(1, 3);
      const colorPalette = sortedColors.slice(0, 5);
      
      // Guess material based on dominant color
      const materialGuess = guessMaterialFromColor(dominantColor);
      
      console.log('✅ Color analysis result:', {
        dominantColor,
        secondaryColors,
        colorPalette,
        materialGuess,
        confidence: Math.min(sortedColors.length / 5, 1)
      });
      
      resolve({
        dominantColor,
        secondaryColors,
        colorPalette,
        materialGuess,
        confidence: Math.min(sortedColors.length / 5, 1)
      });
    };
    
    img.onerror = (error) => {
      console.error('❌ Image load error:', error);
      resolve({
        dominantColor: 'black',
        secondaryColors: ['black'],
        colorPalette: ['black'],
        materialGuess: 'cotton',
        confidence: 0.3
      });
    };
    
    img.src = `data:image/jpeg;base64,${imageBase64}`;
  });
}

function getClosestFashionColor(r: number, g: number, b: number): string {
  let minDistance = Infinity;
  let closestColor = 'black';
  
  for (const [colorName, [cr, cg, cb]] of Object.entries(FASHION_COLORS)) {
    const distance = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorName;
    }
  }
  
  return closestColor;
}

function guessMaterialFromColor(color: string): string {
  // First try exact matches with material patterns
  for (const [material, data] of Object.entries(MATERIAL_PATTERNS)) {
    if (data.colors.includes(color)) {
      return material;
    }
  }
  
  // Enhanced color-material mapping with more specific colors
  const colorMaterialMap: {[key: string]: string} = {
    // Blues
    'navy': 'denim', 'denim_blue': 'denim', 'royal_blue': 'denim', 
    'midnight_blue': 'denim', 'steel_blue': 'denim',
    
    // Neutrals
    'black': 'cotton', 'white': 'cotton', 'gray': 'wool', 
    'charcoal': 'wool', 'dark_gray': 'wool', 'light_gray': 'cotton',
    'cream': 'linen', 'beige': 'linen', 'ivory': 'linen', 'off_white': 'cotton',
    
    // Browns
    'brown': 'leather', 'tan': 'leather', 'chocolate': 'leather',
    'mahogany': 'leather', 'chestnut': 'leather', 'camel': 'leather',
    'mocha': 'leather', 'bronze': 'leather', 'copper': 'leather',
    
    // Reds/Burgundies
    'burgundy': 'silk', 'maroon': 'silk', 'wine': 'silk',
    'cherry_red': 'cotton', 'crimson': 'cotton', 'scarlet': 'cotton',
    
    // Greens
    'forest_green': 'cotton', 'olive': 'cotton', 'sage': 'cotton',
    'emerald': 'silk', 'hunter_green': 'cotton', 'army_green': 'cotton',
    
    // Purples
    'plum': 'silk', 'lavender': 'silk', 'violet': 'silk',
    'purple': 'silk', 'amethyst': 'silk', 'eggplant': 'silk',
    
    // Yellows/Oranges
    'gold': 'silk', 'mustard': 'cotton', 'amber': 'silk',
    'orange': 'cotton', 'peach': 'cotton', 'apricot': 'cotton',
    
    // Pinks
    'blush': 'cotton', 'dusty_rose': 'cotton', 'rose': 'silk',
    'coral': 'cotton', 'salmon': 'cotton', 'hot_pink': 'cotton'
  };
  
  return colorMaterialMap[color] || 'cotton';
}

export function analyzeMaterialFromImage(imageBase64: string): Promise<MaterialAnalysis> {
  return new Promise((resolve) => {
    console.log('🧵 Starting material analysis...');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      console.log('⚠️ Not in browser environment, using fallback');
      resolve({
        material: 'cotton',
        texture: 'smooth',
        weight: 'medium',
        confidence: 0.3
      });
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      console.log('📸 Image loaded for material analysis...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.log('❌ Canvas context failed for material analysis');
        resolve({
          material: 'cotton',
          texture: 'smooth',
          weight: 'medium',
          confidence: 0.3
        });
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Analyze texture by looking at pixel variation
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      let variation = 0;
      let sampleCount = 0;
      
      console.log(`🔍 Analyzing texture from ${pixels.length / 4} pixels...`);
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Calculate local variation
        if (i + 4 < pixels.length) {
          const nextR = pixels[i + 4];
          const nextG = pixels[i + 5];
          const nextB = pixels[i + 6];
          
          variation += Math.abs(r - nextR) + Math.abs(g - nextG) + Math.abs(b - nextB);
          sampleCount++;
        }
      }
      
      const avgVariation = variation / sampleCount;
      console.log(`📊 Average pixel variation: ${avgVariation.toFixed(2)}`);
      
      let texture = 'smooth';
      let material = 'cotton';
      let weight: 'light' | 'medium' | 'heavy' = 'medium';
      
      if (avgVariation > 50) {
        texture = 'textured';
        material = 'denim';
        weight = 'heavy';
      } else if (avgVariation > 30) {
        texture = 'slightly_textured';
        material = 'wool';
        weight = 'medium';
      } else {
        texture = 'smooth';
        material = 'cotton';
        weight = 'light';
      }
      
      const result = {
        material,
        texture,
        weight,
        confidence: Math.min(avgVariation / 100, 1)
      };
      
      console.log('✅ Material analysis result:', result);
      
      resolve(result);
    };
    
    img.onerror = (error) => {
      console.error('❌ Image load error for material analysis:', error);
      resolve({
        material: 'cotton',
        texture: 'smooth',
        weight: 'medium',
        confidence: 0.3
      });
    };
    
    img.src = `data:image/jpeg;base64,${imageBase64}`;
  });
}
