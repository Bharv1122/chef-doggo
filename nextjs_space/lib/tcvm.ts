// Traditional Chinese Veterinary Medicine (TCVM) Integration (Phase 1C)

export type TCVMConstitution = 'neutral' | 'warm' | 'hot' | 'cool' | 'cold';
export type TCVMFoodEnergy = 'neutral' | 'warming' | 'hot' | 'cooling' | 'cold';

export interface TCVMProfile {
  constitution: TCVMConstitution;
  conditions: string[];
  recommendations: {
    avoid: string[];
    favor: string[];
    reasoning: string;
  };
}

// TCVM food energetics database
export const TCVM_FOOD_ENERGETICS: Record<string, TCVMFoodEnergy> = {
  // Proteins - Warming/Hot
  'chicken': 'warming',
  'lamb': 'warming',
  'venison': 'warming',
  'beef': 'neutral',
  'turkey': 'cooling',
  'duck': 'neutral',
  'rabbit': 'cooling',
  'fish': 'cooling',
  'salmon': 'neutral',
  
  // Carbohydrates
  'sweet potato': 'neutral',
  'white rice': 'cooling',
  'brown rice': 'neutral',
  'oats': 'warming',
  'barley': 'cooling',
  'quinoa': 'cooling',
  'potato': 'neutral',
  
  // Vegetables - mostly cooling
  'spinach': 'cooling',
  'broccoli': 'neutral',
  'carrot': 'neutral',
  'celery': 'cooling',
  'cucumber': 'cooling',
  'green beans': 'neutral',
  'kale': 'cooling',
  'pumpkin': 'cooling',
  'squash': 'cooling',
  'zucchini': 'cooling',
  
  // Oils/Fats
  'coconut oil': 'cooling',
  'olive oil': 'neutral',
  'fish oil': 'cooling',
};

// Determine TCVM constitution based on health conditions
export function determineTCVMConstitution(healthConditions: string[]): TCVMProfile {
  const lowerConditions = healthConditions.map(c => c.toLowerCase());
  
  // Hot/Warm patterns (inflammatory, excess heat)
  const hotPatterns = ['allergies', 'skin infections', 'hot spots', 'itching', 'red eyes', 'panting'];
  const hasHotPattern = lowerConditions.some(c => hotPatterns.some(p => c.includes(p)));
  
  // Cold/Cool patterns (deficiency, cold intolerance)
  const coldPatterns = ['hypothyroid', 'arthritis', 'cold intolerance', 'weak digestion', 'lethargy'];
  const hasColdPattern = lowerConditions.some(c => coldPatterns.some(p => c.includes(p)));
  
  // Damp patterns (fluid retention, mucus)
  const dampPatterns = ['obesity', 'edema', 'diarrhea', 'excessive mucus'];
  const hasDampPattern = lowerConditions.some(c => dampPatterns.some(p => c.includes(p)));
  
  // Determine constitution
  let constitution: TCVMConstitution = 'neutral';
  let avoid: string[] = [];
  let favor: string[] = [];
  let reasoning = '';
  
  if (hasHotPattern && !hasColdPattern) {
    constitution = 'hot';
    avoid = ['chicken', 'lamb', 'venison', 'oats'];
    favor = ['turkey', 'rabbit', 'fish', 'duck', 'white rice', 'celery', 'cucumber', 'spinach'];
    reasoning = 'Hot constitution benefits from cooling foods. Avoid warming proteins like chicken and lamb. Favor cooling proteins like turkey, rabbit, and fish.';
  } else if (hasColdPattern && !hasHotPattern) {
    constitution = 'cold';
    avoid = ['turkey', 'rabbit', 'white rice', 'celery', 'cucumber'];
    favor = ['chicken', 'lamb', 'venison', 'beef', 'oats', 'sweet potato'];
    reasoning = 'Cold constitution benefits from warming foods. Favor warming proteins like chicken, lamb, and venison. Avoid cooling foods.';
  } else if (hasDampPattern) {
    constitution = 'neutral';
    avoid = ['dairy', 'fatty meats', 'excessive carbs'];
    favor = ['lean proteins', 'vegetables', 'limited grains'];
    reasoning = 'Damp pattern benefits from resolving dampness. Use lean proteins, limit fats and carbohydrates.';
  } else {
    constitution = 'neutral';
    favor = ['balanced variety of proteins', 'vegetables', 'whole grains'];
    reasoning = 'Neutral constitution allows for balanced diet with variety. No specific TCVM restrictions.';
  }
  
  return {
    constitution,
    conditions: lowerConditions,
    recommendations: {
      avoid,
      favor,
      reasoning
    }
  };
}

// Check if ingredient aligns with TCVM recommendations
export function checkTCVMAlignment(
  ingredient: string,
  tcvmProfile: TCVMProfile
): { aligned: boolean; note?: string } {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Check if should be avoided
  const shouldAvoid = tcvmProfile.recommendations.avoid.some(avoid => 
    lowerIngredient.includes(avoid.toLowerCase())
  );
  
  if (shouldAvoid) {
    return {
      aligned: false,
      note: `Not recommended for ${tcvmProfile.constitution} constitution per TCVM`
    };
  }
  
  // Check if favored
  const isFavored = tcvmProfile.recommendations.favor.some(favor => 
    lowerIngredient.includes(favor.toLowerCase())
  );
  
  if (isFavored) {
    return {
      aligned: true,
      note: `Recommended for ${tcvmProfile.constitution} constitution per TCVM`
    };
  }
  
  return { aligned: true };
}

// Get TCVM notes for recipe
export function getTCVMNotes(tcvmProfile: TCVMProfile): string {
  return `TCVM Constitution: ${tcvmProfile.constitution.toUpperCase()}\n\n${tcvmProfile.recommendations.reasoning}\n\nFavor: ${tcvmProfile.recommendations.favor.join(', ')}${tcvmProfile.recommendations.avoid.length > 0 ? `\nAvoid: ${tcvmProfile.recommendations.avoid.join(', ')}` : ''}`;
}
