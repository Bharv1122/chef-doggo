/**
 * Breed-Specific Health Predispositions Database
 * Common health issues and dietary considerations for popular dog breeds
 */

export interface BreedHealthInfo {
  breed: string;
  commonIssues: string[];
  dietaryConsiderations: string[];
  riskFactors: {
    condition: string;
    severity: 'high' | 'moderate' | 'low';
    recommendation: string;
  }[];
  notes?: string;
}

export const BREED_HEALTH_DATABASE: BreedHealthInfo[] = [
  {
    breed: 'Golden Retriever',
    commonIssues: ['Hip Dysplasia', 'Elbow Dysplasia', 'Cancer', 'Heart Disease', 'Obesity'],
    dietaryConsiderations: [
      'Weight management critical',
      'Joint support supplements beneficial',
      'Moderate protein (22-25%)',
      'Omega-3 fatty acids for coat and joints'
    ],
    riskFactors: [
      {
        condition: 'Obesity',
        severity: 'high',
        recommendation: 'Monitor calorie intake closely. Avoid high-fat treats. Regular exercise essential.'
      },
      {
        condition: 'Hip Dysplasia',
        severity: 'high',
        recommendation: 'Include glucosamine and chondroitin. Maintain healthy weight. Omega-3 for inflammation.'
      },
      {
        condition: 'Cancer',
        severity: 'moderate',
        recommendation: 'Antioxidant-rich diet. Quality protein sources. Consider omega-3 supplementation.'
      }
    ]
  },
  {
    breed: 'Labrador Retriever',
    commonIssues: ['Obesity', 'Hip Dysplasia', 'Elbow Dysplasia', 'Arthritis'],
    dietaryConsiderations: [
      'Prone to overeating - portion control essential',
      'High protein for muscle maintenance',
      'Joint support crucial',
      'Fiber for satiety'
    ],
    riskFactors: [
      {
        condition: 'Obesity',
        severity: 'high',
        recommendation: 'Strict portion control. Labs are food-motivated and prone to weight gain. High fiber, moderate fat.'
      },
      {
        condition: 'Joint Disease',
        severity: 'high',
        recommendation: 'Glucosamine, chondroitin, and omega-3 supplementation. Maintain lean body condition.'
      }
    ]
  },
  {
    breed: 'German Shepherd',
    commonIssues: ['Hip Dysplasia', 'Degenerative Myelopathy', 'Bloat', 'Allergies', 'Pancreatitis'],
    dietaryConsiderations: [
      'High-quality protein (25-28%)',
      'Moderate fat to prevent pancreatitis',
      'Avoid rapid eating (bloat risk)',
      'Hypoallergenic options may be needed'
    ],
    riskFactors: [
      {
        condition: 'Bloat (GDV)',
        severity: 'high',
        recommendation: 'Feed multiple small meals. Avoid exercise before/after eating. No elevated bowls. Slow eating encouraged.'
      },
      {
        condition: 'Food Allergies',
        severity: 'moderate',
        recommendation: 'Limited ingredient diets. Novel protein sources. Avoid common allergens (chicken, beef, dairy).'
      },
      {
        condition: 'Pancreatitis',
        severity: 'moderate',
        recommendation: 'Low-fat diet (<10%). Avoid fatty meats and oils. Lean proteins only.'
      }
    ]
  },
  {
    breed: 'Bulldog',
    commonIssues: ['Breathing Issues', 'Hip Dysplasia', 'Skin Allergies', 'Obesity', 'Heart Disease'],
    dietaryConsiderations: [
      'Weight management critical (breathing)',
      'Easy-to-digest foods',
      'Hypoallergenic formulas',
      'Avoid overheating (no warm/hot food)'
    ],
    riskFactors: [
      {
        condition: 'Obesity',
        severity: 'high',
        recommendation: 'Strict calorie control. Extra weight worsens breathing. Low-calorie, high-satiety diet.'
      },
      {
        condition: 'Food Allergies',
        severity: 'high',
        recommendation: 'Elimination diet trials. Novel proteins. Avoid common allergens. Monitor skin closely.'
      }
    ]
  },
  {
    breed: 'Poodle',
    commonIssues: ['Hip Dysplasia', 'Progressive Retinal Atrophy', 'Addison\'s Disease', 'Bloat'],
    dietaryConsiderations: [
      'High-quality protein',
      'Omega-3 for coat and skin',
      'Small, frequent meals (bloat prevention)',
      'Easily digestible'
    ],
    riskFactors: [
      {
        condition: 'Bloat',
        severity: 'moderate',
        recommendation: 'Multiple small meals daily. Avoid exercise around mealtimes. Slow eating.'
      },
      {
        condition: 'Addison\'s Disease',
        severity: 'moderate',
        recommendation: 'Consistent sodium levels. Avoid sudden diet changes. Monitor electrolytes with vet.'
      }
    ]
  },
  {
    breed: 'Beagle',
    commonIssues: ['Obesity', 'Hip Dysplasia', 'Epilepsy', 'Hypothyroidism'],
    dietaryConsiderations: [
      'Portion control essential',
      'High fiber for satiety',
      'Moderate protein',
      'Avoid table scraps'
    ],
    riskFactors: [
      {
        condition: 'Obesity',
        severity: 'high',
        recommendation: 'Beagles are very food-motivated. Strict portions. High fiber, lower fat. Regular exercise.'
      },
      {
        condition: 'Hypothyroidism',
        severity: 'moderate',
        recommendation: 'Monitor weight closely. May need higher fiber, lower calorie diet. Regular vet checks.'
      }
    ]
  },
  {
    breed: 'Boxer',
    commonIssues: ['Heart Disease', 'Cancer', 'Hip Dysplasia', 'Bloat', 'Allergies'],
    dietaryConsiderations: [
      'High-quality protein',
      'Heart-healthy diet (low sodium)',
      'Antioxidants for cancer prevention',
      'Multiple small meals'
    ],
    riskFactors: [
      {
        condition: 'Heart Disease',
        severity: 'high',
        recommendation: 'Low sodium diet. Taurine supplementation. Omega-3 fatty acids. Regular cardiac monitoring.'
      },
      {
        condition: 'Bloat',
        severity: 'high',
        recommendation: 'Feed 2-3 small meals. Avoid exercise around meals. Slow eating. No elevated bowls.'
      }
    ]
  },
  {
    breed: 'Dachshund',
    commonIssues: ['Intervertebral Disc Disease', 'Obesity', 'Diabetes', 'Dental Disease'],
    dietaryConsiderations: [
      'Weight control critical (spine health)',
      'Calcium and phosphorus balance',
      'Low-calorie, nutrient-dense',
      'Soft foods if dental issues'
    ],
    riskFactors: [
      {
        condition: 'IVDD (Back Problems)',
        severity: 'high',
        recommendation: 'Maintain lean weight. Extra pounds stress the spine. Anti-inflammatory omega-3s beneficial.'
      },
      {
        condition: 'Obesity',
        severity: 'high',
        recommendation: 'Very small portions. High fiber. Avoid overfeeding. Weight gain extremely dangerous for spine.'
      }
    ]
  },
  {
    breed: 'Yorkshire Terrier',
    commonIssues: ['Dental Disease', 'Patellar Luxation', 'Liver Shunt', 'Hypoglycemia'],
    dietaryConsiderations: [
      'Small frequent meals (hypoglycemia)',
      'Dental-friendly texture',
      'High-quality protein',
      'Easy to digest'
    ],
    riskFactors: [
      {
        condition: 'Hypoglycemia',
        severity: 'high',
        recommendation: 'Feed 3-4 small meals daily. Never skip meals. Monitor for weakness or seizures. Quick glucose source on hand.'
      },
      {
        condition: 'Liver Shunt',
        severity: 'moderate',
        recommendation: 'Moderate protein (not too high). Easily digestible. Small frequent meals. Vet-supervised diet.'
      }
    ]
  },
  {
    breed: 'Shih Tzu',
    commonIssues: ['Dental Disease', 'Eye Problems', 'Breathing Issues', 'Obesity'],
    dietaryConsiderations: [
      'Soft, easily chewed food',
      'Weight management',
      'Hypoallergenic if needed',
      'Room temperature food'
    ],
    riskFactors: [
      {
        condition: 'Obesity',
        severity: 'moderate',
        recommendation: 'Portion control. Weight gain worsens breathing. Low-calorie, nutrient-dense food.'
      },
      {
        condition: 'Dental Disease',
        severity: 'high',
        recommendation: 'May need softer foods. Dental chews. Regular dental care. Avoid hard kibble if severe.'
      }
    ]
  },
  {
    breed: 'Rottweiler',
    commonIssues: ['Hip Dysplasia', 'Elbow Dysplasia', 'Osteosarcoma', 'Bloat', 'Heart Disease'],
    dietaryConsiderations: [
      'High-quality protein (large breed)',
      'Controlled calcium/phosphorus (growing)',
      'Joint support',
      'Multiple meals (bloat prevention)'
    ],
    riskFactors: [
      {
        condition: 'Bloat',
        severity: 'high',
        recommendation: '2-3 meals daily. No exercise before/after eating. Slow eating. Deep-chested breed at high risk.'
      },
      {
        condition: 'Joint Disease',
        severity: 'high',
        recommendation: 'Glucosamine/chondroitin. Omega-3s. Maintain lean weight. Appropriate calcium for growth.'
      }
    ]
  },
  {
    breed: 'Chihuahua',
    commonIssues: ['Dental Disease', 'Patellar Luxation', 'Heart Disease', 'Hypoglycemia', 'Tracheal Collapse'],
    dietaryConsiderations: [
      'Small frequent meals',
      'Soft food (dental issues)',
      'Heart-healthy (low sodium)',
      'High-quality protein'
    ],
    riskFactors: [
      {
        condition: 'Hypoglycemia',
        severity: 'high',
        recommendation: 'Feed 3-4 times daily. Never skip meals. Monitor energy levels. Keep honey or Karo syrup on hand.'
      },
      {
        condition: 'Heart Disease',
        severity: 'moderate',
        recommendation: 'Low sodium diet. Taurine-rich foods. Omega-3 supplementation. Regular cardiac checks.'
      }
    ]
  },
  {
    breed: 'Great Dane',
    commonIssues: ['Bloat', 'Hip Dysplasia', 'Heart Disease', 'Osteosarcoma'],
    dietaryConsiderations: [
      'Multiple small meals (bloat)',
      'Large breed formula',
      'Controlled calcium (growing)',
      'High-quality protein'
    ],
    riskFactors: [
      {
        condition: 'Bloat',
        severity: 'high',
        recommendation: 'CRITICAL: 2-3 meals daily. Never one large meal. No exercise 1 hour before/after. Slow eating. Life-threatening emergency.'
      },
      {
        condition: 'Heart Disease',
        severity: 'high',
        recommendation: 'Taurine supplementation essential. Low sodium. Omega-3s. Regular cardiac monitoring.'
      }
    ]
  },
  {
    breed: 'Siberian Husky',
    commonIssues: ['Hip Dysplasia', 'Eye Problems', 'Hypothyroidism', 'Zinc Deficiency'],
    dietaryConsiderations: [
      'High-quality protein',
      'Zinc supplementation may be needed',
      'Omega-3 for coat',
      'Moderate fat'
    ],
    riskFactors: [
      {
        condition: 'Zinc-Responsive Dermatosis',
        severity: 'moderate',
        recommendation: 'Zinc supplementation. High-quality protein. Omega-3s for skin health. Monitor coat condition.'
      }
    ]
  },
];

/**
 * Get health information for a specific breed
 */
export function getBreedHealthInfo(breed: string): BreedHealthInfo | undefined {
  const breedLower = breed.toLowerCase();
  return BREED_HEALTH_DATABASE.find(b => b.breed.toLowerCase() === breedLower);
}

/**
 * Search breeds by health condition
 */
export function getBreedsByCondition(condition: string): BreedHealthInfo[] {
  const conditionLower = condition.toLowerCase();
  return BREED_HEALTH_DATABASE.filter(b => 
    b.commonIssues.some(issue => issue.toLowerCase().includes(conditionLower)) ||
    b.riskFactors.some(risk => risk.condition.toLowerCase().includes(conditionLower))
  );
}

/**
 * Get all unique health conditions
 */
export function getAllHealthConditions(): string[] {
  const conditions = new Set<string>();
  BREED_HEALTH_DATABASE.forEach(b => {
    b.commonIssues.forEach(issue => conditions.add(issue));
    b.riskFactors.forEach(risk => conditions.add(risk.condition));
  });
  return Array.from(conditions).sort();
}

/**
 * Check if a breed has specific dietary concerns
 */
export function hasBreedSpecificDietaryConcerns(breed: string): boolean {
  const info = getBreedHealthInfo(breed);
  return info !== undefined && info.dietaryConsiderations.length > 0;
}
