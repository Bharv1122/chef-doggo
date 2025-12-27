// Medication-Food Interaction Database and Checker (Phase 1B)

export interface MedicationInteraction {
  medication: string;
  affectedIngredients: string[];
  severity: 'mild' | 'moderate' | 'severe';
  warning: string;
  recommendation: string;
}

// Common medication-food interactions for dogs
export const MEDICATION_INTERACTIONS: MedicationInteraction[] = [
  {
    medication: 'NSAID',
    affectedIngredients: ['fat', 'oil', 'butter', 'fatty meat', 'bacon'],
    severity: 'moderate',
    warning: 'NSAIDs (like Rimadyl, Carprofen) can cause stomach upset when combined with high-fat foods.',
    recommendation: 'Use lean proteins and reduce fat content in recipes.'
  },
  {
    medication: 'Prednisone',
    affectedIngredients: ['salt', 'sodium', 'salty'],
    severity: 'moderate',
    warning: 'Steroids like Prednisone can increase sodium retention and thirst.',
    recommendation: 'Minimize added salt and avoid high-sodium ingredients.'
  },
  {
    medication: 'Vetmedin',
    affectedIngredients: ['potassium', 'banana', 'sweet potato'],
    severity: 'mild',
    warning: 'Heart medications may interact with high-potassium foods.',
    recommendation: 'Monitor potassium-rich ingredients. Consult your vet about portion sizes.'
  },
  {
    medication: 'Levothyroxine',
    affectedIngredients: ['soy', 'tofu', 'edamame'],
    severity: 'moderate',
    warning: 'Thyroid medication absorption can be reduced by soy products.',
    recommendation: 'Avoid soy-based ingredients or give medication 4 hours apart from meals.'
  },
  {
    medication: 'Antibiotics',
    affectedIngredients: ['dairy', 'cheese', 'yogurt', 'milk'],
    severity: 'mild',
    warning: 'Some antibiotics can be less effective when taken with dairy products.',
    recommendation: 'Avoid dairy products or give medication 2 hours apart from meals.'
  },
  {
    medication: 'Phenobarbital',
    affectedIngredients: ['vitamin d', 'calcium'],
    severity: 'moderate',
    warning: 'Seizure medications can affect calcium and vitamin D metabolism.',
    recommendation: 'Ensure adequate calcium supplementation. Consult your vet.'
  }
];

// Normalize medication names for matching
function normalizeMedicationName(name: string): string {
  return name.toLowerCase().trim();
}

// Check if a medication matches any known interactions
export function checkMedicationInteractions(
  medications: string[],
  ingredients: Array<{ name: string; quantity: string }>
): MedicationInteraction[] {
  const foundInteractions: MedicationInteraction[] = [];
  const normalizedMeds = medications.map(normalizeMedicationName);

  for (const interaction of MEDICATION_INTERACTIONS) {
    const normalizedMedication = normalizeMedicationName(interaction.medication);
    
    // Check if any user medication matches or contains this interaction medication
    const medicationMatches = normalizedMeds.some(
      med => med.includes(normalizedMedication) || normalizedMedication.includes(med)
    );

    if (medicationMatches) {
      // Check if any recipe ingredient matches the affected ingredients
      const ingredientMatches = ingredients.some(ingredient =>
        interaction.affectedIngredients.some(affected =>
          ingredient.name.toLowerCase().includes(affected.toLowerCase())
        )
      );

      if (ingredientMatches) {
        foundInteractions.push(interaction);
      }
    }
  }

  return foundInteractions;
}

// Get disclaimer tier based on medication interactions
export function getMedicationDisclaimerTier(
  interactions: MedicationInteraction[]
): 'medication' | 'therapeutic' | null {
  if (interactions.length === 0) return null;
  
  const hasSevere = interactions.some(i => i.severity === 'severe');
  const hasModerate = interactions.some(i => i.severity === 'moderate');
  
  if (hasSevere) return 'therapeutic';
  if (hasModerate || interactions.length > 0) return 'medication';
  
  return null;
}
