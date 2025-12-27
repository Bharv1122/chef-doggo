// Ayurvedic Pet Care Integration (Phase 1C)

export type Dosha = 'vata' | 'pitta' | 'kapha';
export type DoshaBalance = 'balanced' | 'excess' | 'deficient';

export interface AyurvedaProfile {
  primaryDosha: Dosha;
  balance: DoshaBalance;
  characteristics: string[];
  recommendations: {
    favor: string[];
    avoid: string[];
    reasoning: string;
  };
}

// Ayurvedic food properties
export const AYURVEDA_FOOD_PROPERTIES: Record<string, { balances: Dosha[]; aggravates: Dosha[] }> = {
  // Proteins
  'chicken': { balances: ['vata'], aggravates: ['pitta'] },
  'turkey': { balances: ['pitta', 'kapha'], aggravates: [] },
  'lamb': { balances: ['vata'], aggravates: ['pitta', 'kapha'] },
  'beef': { balances: ['vata'], aggravates: ['pitta', 'kapha'] },
  'fish': { balances: ['vata'], aggravates: ['pitta'] },
  'duck': { balances: ['vata'], aggravates: ['kapha'] },
  
  // Carbohydrates
  'rice': { balances: ['vata', 'pitta'], aggravates: [] },
  'oats': { balances: ['vata'], aggravates: ['kapha'] },
  'barley': { balances: ['pitta', 'kapha'], aggravates: [] },
  'quinoa': { balances: ['vata', 'pitta'], aggravates: [] },
  'sweet potato': { balances: ['vata'], aggravates: ['kapha'] },
  
  // Vegetables
  'spinach': { balances: ['pitta', 'kapha'], aggravates: [] },
  'carrot': { balances: ['vata'], aggravates: [] },
  'broccoli': { balances: ['kapha'], aggravates: ['vata'] },
  'green beans': { balances: ['pitta', 'kapha'], aggravates: [] },
  'pumpkin': { balances: ['vata', 'pitta'], aggravates: [] },
  'zucchini': { balances: ['pitta'], aggravates: ['vata'] },
  
  // Oils
  'coconut oil': { balances: ['pitta', 'vata'], aggravates: ['kapha'] },
  'olive oil': { balances: ['vata'], aggravates: [] },
};

// Determine primary dosha based on dog characteristics
export function determineDosha(
  size: string,
  activityLevel: string,
  healthConditions: string[]
): AyurvedaProfile {
  const lowerConditions = healthConditions.map(c => c.toLowerCase());
  
  // Vata characteristics: thin, energetic, anxious, dry skin
  const vataSignals = ['anxiety', 'nervous', 'dry skin', 'constipation', 'joint issues'];
  const vataScore = lowerConditions.filter(c => vataSignals.some(s => c.includes(s))).length;
  
  // Pitta characteristics: medium build, intense, inflammatory
  const pittaSignals = ['hot spots', 'inflammation', 'allergies', 'skin infections', 'aggressive'];
  const pittaScore = lowerConditions.filter(c => pittaSignals.some(s => c.includes(s))).length;
  
  // Kapha characteristics: heavy, slow, congestion
  const kaphaSignals = ['obesity', 'overweight', 'lethargy', 'congestion', 'hypothyroid'];
  const kaphaScore = lowerConditions.filter(c => kaphaSignals.some(s => c.includes(s))).length;
  
  // Size and activity factor
  const isSmallEnergetic = (size === 'toy' || size === 'small') && activityLevel === 'high';
  const isLargeSlow = (size === 'large' || size === 'giant') && activityLevel === 'low';
  
  let primaryDosha: Dosha;
  let balance: DoshaBalance = 'balanced';
  let characteristics: string[] = [];
  let favor: string[] = [];
  let avoid: string[] = [];
  let reasoning = '';
  
  // Determine primary dosha
  if (pittaScore > vataScore && pittaScore > kaphaScore) {
    primaryDosha = 'pitta';
    balance = 'excess';
    characteristics = ['Intense', 'Strong digestion', 'Inflammatory tendencies'];
    favor = ['cooling foods', 'turkey', 'barley', 'spinach', 'green beans', 'coconut oil'];
    avoid = ['heating foods', 'excessive chicken', 'lamb', 'spicy foods'];
    reasoning = 'Pitta excess manifests as inflammation and heat. Cool, calming foods help balance.';
  } else if (kaphaScore > vataScore && kaphaScore > pittaScore) {
    primaryDosha = 'kapha';
    balance = 'excess';
    characteristics = ['Heavy build', 'Slow metabolism', 'Tendency to gain weight'];
    favor = ['light proteins', 'turkey', 'barley', 'spinach', 'green beans'];
    avoid = ['heavy foods', 'excessive fats', 'sweet potato', 'dairy'];
    reasoning = 'Kapha excess manifests as heaviness and sluggishness. Light, stimulating foods help balance.';
  } else if (isSmallEnergetic || vataScore > pittaScore) {
    primaryDosha = 'vata';
    balance = vataScore > 0 ? 'excess' : 'balanced';
    characteristics = ['Light build', 'Energetic', 'Sensitive digestion'];
    favor = ['grounding foods', 'chicken', 'rice', 'sweet potato', 'carrot', 'olive oil'];
    avoid = ['raw foods', 'cold foods', 'excessive vegetables'];
    reasoning = 'Vata benefits from warm, grounding, nourishing foods. Avoid cold, raw, or difficult-to-digest foods.';
  } else {
    // Default to vata for active dogs, kapha for less active
    primaryDosha = activityLevel === 'high' ? 'vata' : 'kapha';
    balance = 'balanced';
    characteristics = ['Balanced constitution'];
    favor = ['variety of foods', 'seasonal ingredients'];
    reasoning = 'Balanced dosha allows for dietary variety. Focus on fresh, whole ingredients.';
  }
  
  return {
    primaryDosha,
    balance,
    characteristics,
    recommendations: {
      favor,
      avoid,
      reasoning
    }
  };
}

// Check if ingredient aligns with Ayurvedic recommendations
export function checkAyurvedaAlignment(
  ingredient: string,
  ayurvedaProfile: AyurvedaProfile
): { aligned: boolean; note?: string } {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Find food properties
  const foodKey = Object.keys(AYURVEDA_FOOD_PROPERTIES).find(key => 
    lowerIngredient.includes(key.toLowerCase())
  );
  
  if (!foodKey) {
    return { aligned: true }; // Unknown food, assume okay
  }
  
  const food = AYURVEDA_FOOD_PROPERTIES[foodKey];
  
  // Check if it aggravates the primary dosha (bad)
  if (food.aggravates.includes(ayurvedaProfile.primaryDosha)) {
    return {
      aligned: false,
      note: `May aggravate ${ayurvedaProfile.primaryDosha} dosha per Ayurveda`
    };
  }
  
  // Check if it balances the primary dosha (good)
  if (food.balances.includes(ayurvedaProfile.primaryDosha)) {
    return {
      aligned: true,
      note: `Balances ${ayurvedaProfile.primaryDosha} dosha per Ayurveda`
    };
  }
  
  return { aligned: true };
}

// Get Ayurveda notes for recipe
export function getAyurvedaNotes(ayurvedaProfile: AyurvedaProfile): string {
  return `Ayurvedic Dosha: ${ayurvedaProfile.primaryDosha.toUpperCase()} (${ayurvedaProfile.balance})\n\nCharacteristics: ${ayurvedaProfile.characteristics.join(', ')}\n\n${ayurvedaProfile.recommendations.reasoning}\n\nFavor: ${ayurvedaProfile.recommendations.favor.join(', ')}${ayurvedaProfile.recommendations.avoid.length > 0 ? `\nAvoid: ${ayurvedaProfile.recommendations.avoid.join(', ')}` : ''}`;
}

// Detect conflicts between TCVM and Ayurveda
export function detectHolisticConflicts(
  tcvmAvoid: string[],
  tcvmFavor: string[],
  ayurvedaAvoid: string[],
  ayurvedaFavor: string[]
): { hasConflict: boolean; conflicts: string[] } {
  const conflicts: string[] = [];
  
  // Check if TCVM avoid overlaps with Ayurveda favor
  for (const item of tcvmAvoid) {
    if (ayurvedaFavor.some(f => f.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(f.toLowerCase()))) {
      conflicts.push(`TCVM suggests avoiding ${item}, but Ayurveda recommends it`);
    }
  }
  
  // Check if Ayurveda avoid overlaps with TCVM favor
  for (const item of ayurvedaAvoid) {
    if (tcvmFavor.some(f => f.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(f.toLowerCase()))) {
      conflicts.push(`Ayurveda suggests avoiding ${item}, but TCVM recommends it`);
    }
  }
  
  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
}
