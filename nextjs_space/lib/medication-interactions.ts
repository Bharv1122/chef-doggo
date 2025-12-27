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
  // NSAIDs (Nonsteroidal Anti-Inflammatory Drugs)
  {
    medication: 'NSAID',
    affectedIngredients: ['fat', 'oil', 'butter', 'fatty meat', 'bacon', 'pork belly', 'lamb'],
    severity: 'moderate',
    warning: 'NSAIDs (like Rimadyl, Carprofen) can cause stomach upset when combined with high-fat foods.',
    recommendation: 'Use lean proteins and reduce fat content in recipes.'
  },
  {
    medication: 'Rimadyl',
    affectedIngredients: ['fat', 'oil', 'butter', 'fatty meat'],
    severity: 'moderate',
    warning: 'Rimadyl (Carprofen) may cause GI upset with high-fat foods.',
    recommendation: 'Feed with lean proteins. Monitor for vomiting or diarrhea.'
  },
  {
    medication: 'Carprofen',
    affectedIngredients: ['fat', 'oil', 'butter', 'fatty meat'],
    severity: 'moderate',
    warning: 'Carprofen may cause stomach irritation with fatty foods.',
    recommendation: 'Use low-fat recipes. Feed with food to reduce stomach upset.'
  },
  {
    medication: 'Meloxicam',
    affectedIngredients: ['fat', 'oil', 'fatty meat'],
    severity: 'moderate',
    warning: 'Meloxicam (Metacam) can irritate stomach lining, especially with fatty foods.',
    recommendation: 'Use lean proteins and avoid high-fat ingredients.'
  },
  {
    medication: 'Deracoxib',
    affectedIngredients: ['fat', 'oil', 'fatty meat'],
    severity: 'moderate',
    warning: 'Deracoxib (Deramaxx) can cause GI issues with high-fat content.',
    recommendation: 'Keep fat content low. Monitor for signs of stomach upset.'
  },

  // Corticosteroids
  {
    medication: 'Prednisone',
    affectedIngredients: ['salt', 'sodium', 'salty', 'processed meat'],
    severity: 'moderate',
    warning: 'Steroids like Prednisone can increase sodium retention and thirst.',
    recommendation: 'Minimize added salt and avoid high-sodium ingredients.'
  },
  {
    medication: 'Prednisolone',
    affectedIngredients: ['salt', 'sodium', 'sugar', 'carbohydrates'],
    severity: 'moderate',
    warning: 'Prednisolone can affect blood sugar and increase sodium retention.',
    recommendation: 'Low-sodium diet. Monitor blood sugar levels.'
  },
  {
    medication: 'Dexamethasone',
    affectedIngredients: ['salt', 'sodium', 'sugar'],
    severity: 'moderate',
    warning: 'Dexamethasone can cause fluid retention and blood sugar changes.',
    recommendation: 'Restrict sodium intake. Monitor for increased thirst and urination.'
  },

  // Heart Medications
  {
    medication: 'Vetmedin',
    affectedIngredients: ['potassium', 'banana', 'sweet potato', 'spinach'],
    severity: 'mild',
    warning: 'Heart medications may interact with high-potassium foods.',
    recommendation: 'Monitor potassium-rich ingredients. Consult your vet about portion sizes.'
  },
  {
    medication: 'Pimobendan',
    affectedIngredients: ['potassium', 'banana', 'salt'],
    severity: 'mild',
    warning: 'Pimobendan works best with consistent low-sodium diet.',
    recommendation: 'Keep sodium low. Monitor potassium levels with your vet.'
  },
  {
    medication: 'Furosemide',
    affectedIngredients: ['salt', 'sodium', 'potassium'],
    severity: 'moderate',
    warning: 'Furosemide (Lasix) is a diuretic that depletes potassium and affects sodium balance.',
    recommendation: 'Low-sodium diet. May need potassium supplementation - consult vet.'
  },
  {
    medication: 'Enalapril',
    affectedIngredients: ['salt', 'sodium', 'potassium'],
    severity: 'moderate',
    warning: 'ACE inhibitors can increase potassium levels. Low sodium is important.',
    recommendation: 'Restrict sodium. Monitor potassium - avoid supplements without vet approval.'
  },

  // Thyroid Medications
  {
    medication: 'Levothyroxine',
    affectedIngredients: ['soy', 'tofu', 'edamame', 'fiber', 'calcium'],
    severity: 'moderate',
    warning: 'Thyroid medication absorption can be reduced by soy products, high fiber, and calcium.',
    recommendation: 'Avoid soy. Give medication on empty stomach or 4 hours apart from meals.'
  },
  {
    medication: 'Soloxine',
    affectedIngredients: ['soy', 'fiber', 'calcium', 'iron'],
    severity: 'moderate',
    warning: 'Soloxine absorption affected by soy, fiber, and minerals.',
    recommendation: 'Give medication separately from food. Avoid soy products.'
  },

  // Antibiotics
  {
    medication: 'Antibiotics',
    affectedIngredients: ['dairy', 'cheese', 'yogurt', 'milk'],
    severity: 'mild',
    warning: 'Some antibiotics can be less effective when taken with dairy products.',
    recommendation: 'Avoid dairy products or give medication 2 hours apart from meals.'
  },
  {
    medication: 'Doxycycline',
    affectedIngredients: ['dairy', 'calcium', 'iron'],
    severity: 'moderate',
    warning: 'Doxycycline binds to calcium and iron, reducing effectiveness.',
    recommendation: 'Avoid dairy, calcium supplements. Give 2 hours before or after meals.'
  },
  {
    medication: 'Enrofloxacin',
    affectedIngredients: ['dairy', 'calcium', 'magnesium', 'iron'],
    severity: 'moderate',
    warning: 'Enrofloxacin (Baytril) absorption reduced by minerals.',
    recommendation: 'Give on empty stomach. Avoid dairy and mineral supplements.'
  },
  {
    medication: 'Metronidazole',
    affectedIngredients: ['alcohol'],
    severity: 'severe',
    warning: 'Metronidazole with alcohol can cause severe reactions.',
    recommendation: 'Absolutely no alcohol. Give with food to reduce nausea.'
  },

  // Seizure Medications
  {
    medication: 'Phenobarbital',
    affectedIngredients: ['vitamin d', 'calcium', 'folic acid'],
    severity: 'moderate',
    warning: 'Seizure medications can affect calcium and vitamin D metabolism.',
    recommendation: 'Ensure adequate calcium supplementation. Consult your vet.'
  },
  {
    medication: 'Potassium Bromide',
    affectedIngredients: ['salt', 'sodium', 'chloride'],
    severity: 'moderate',
    warning: 'Potassium Bromide levels affected by salt/chloride intake.',
    recommendation: 'Keep sodium intake consistent. Avoid sudden changes in salt.'
  },
  {
    medication: 'Levetiracetam',
    affectedIngredients: ['vitamin b6'],
    severity: 'mild',
    warning: 'Keppra may deplete vitamin B6.',
    recommendation: 'Consider B-complex supplementation. Consult your vet.'
  },

  // Chemotherapy
  {
    medication: 'Chemotherapy',
    affectedIngredients: ['grapefruit', 'raw meat', 'raw eggs'],
    severity: 'severe',
    warning: 'Chemotherapy weakens immune system. Raw foods pose infection risk.',
    recommendation: 'Only fully cooked ingredients. Consult oncologist for diet.'
  },

  // Immunosuppressants
  {
    medication: 'Cyclosporine',
    affectedIngredients: ['grapefruit', 'grapefruit juice'],
    severity: 'severe',
    warning: 'Grapefruit significantly increases cyclosporine blood levels, causing toxicity.',
    recommendation: 'Absolutely avoid grapefruit. Maintain consistent diet.'
  },
  {
    medication: 'Azathioprine',
    affectedIngredients: ['raw meat', 'raw eggs', 'unpasteurized'],
    severity: 'moderate',
    warning: 'Immunosuppression increases infection risk from raw foods.',
    recommendation: 'All ingredients must be fully cooked. Practice strict food safety.'
  },

  // Antifungals
  {
    medication: 'Ketoconazole',
    affectedIngredients: ['fatty foods', 'antacids'],
    severity: 'mild',
    warning: 'Ketoconazole absorption affected by fat content and stomach acid.',
    recommendation: 'Give with food. Avoid antacids within 2 hours.'
  },

  // Pain Medications
  {
    medication: 'Tramadol',
    affectedIngredients: ['serotonin-rich foods'],
    severity: 'mild',
    warning: 'Tramadol affects serotonin levels.',
    recommendation: 'Monitor for side effects. Give with food to reduce nausea.'
  },
  {
    medication: 'Gabapentin',
    affectedIngredients: ['antacids'],
    severity: 'mild',
    warning: 'Gabapentin absorption reduced by antacids.',
    recommendation: 'Give 2 hours apart from antacids. Can be given with food.'
  },
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
