/**
 * Comprehensive Toxic Ingredients Database
 * Detailed information for each toxic ingredient including symptoms and treatment
 */

export interface ToxicIngredient {
  name: string;
  aliases: string[];
  toxicityLevel: 'Critical' | 'High' | 'Moderate';
  category: string;
  symptoms: string[];
  onsetTime: string;
  treatment: string;
  lethalDose?: string;
  notes?: string;
}

export const TOXIC_INGREDIENTS_DATABASE: ToxicIngredient[] = [
  // Critical - Always fatal or severely toxic
  {
    name: 'Chocolate',
    aliases: ['cocoa', 'theobromine', 'cacao', 'dark chocolate', 'milk chocolate'],
    toxicityLevel: 'Critical',
    category: 'Food',
    symptoms: [
      'Vomiting',
      'Diarrhea',
      'Increased thirst',
      'Restlessness',
      'Rapid heart rate',
      'Tremors',
      'Seizures',
      'Death'
    ],
    onsetTime: '6-12 hours',
    treatment: 'Immediate veterinary care required. Induce vomiting if recent ingestion. Activated charcoal may be administered.',
    lethalDose: '100-200 mg/kg (varies by chocolate type)',
    notes: 'Dark chocolate is most toxic. Even small amounts can be dangerous.'
  },
  {
    name: 'Xylitol',
    aliases: ['birch sugar', 'sugar-free sweetener'],
    toxicityLevel: 'Critical',
    category: 'Sweetener',
    symptoms: [
      'Rapid drop in blood sugar',
      'Vomiting',
      'Weakness',
      'Lethargy',
      'Loss of coordination',
      'Seizures',
      'Liver failure'
    ],
    onsetTime: '15-30 minutes',
    treatment: 'EMERGENCY - Immediate veterinary care. IV fluids and glucose supplementation required.',
    lethalDose: '0.1 g/kg can cause hypoglycemia',
    notes: 'Found in sugar-free gum, peanut butter, baked goods. Extremely dangerous.'
  },
  {
    name: 'Grapes',
    aliases: ['raisins', 'currants', 'sultanas'],
    toxicityLevel: 'Critical',
    category: 'Fruit',
    symptoms: [
      'Vomiting',
      'Diarrhea',
      'Loss of appetite',
      'Lethargy',
      'Abdominal pain',
      'Decreased urination',
      'Acute kidney failure'
    ],
    onsetTime: '12-24 hours',
    treatment: 'Immediate veterinary care. Induce vomiting within 2 hours. IV fluids for 48 hours.',
    lethalDose: 'Unknown - even small amounts can cause kidney failure',
    notes: 'Toxicity mechanism unknown. Any amount is potentially fatal.'
  },
  {
    name: 'Onions',
    aliases: ['garlic', 'leeks', 'shallots', 'chives', 'scallions'],
    toxicityLevel: 'Critical',
    category: 'Vegetable',
    symptoms: [
      'Weakness',
      'Lethargy',
      'Pale gums',
      'Orange/dark red urine',
      'Rapid breathing',
      'Vomiting',
      'Diarrhea',
      'Hemolytic anemia'
    ],
    onsetTime: '1-3 days',
    treatment: 'Veterinary care required. Blood transfusion may be necessary in severe cases.',
    lethalDose: '15-30 g/kg (about 0.5% of body weight)',
    notes: 'All forms toxic: raw, cooked, powdered. Garlic is 5x more potent than onions.'
  },
  {
    name: 'Macadamia Nuts',
    aliases: ['macadamia', 'queensland nut'],
    toxicityLevel: 'High',
    category: 'Nut',
    symptoms: [
      'Weakness in hind legs',
      'Vomiting',
      'Tremors',
      'Hyperthermia',
      'Depression',
      'Unable to walk'
    ],
    onsetTime: '12 hours',
    treatment: 'Supportive care. Most dogs recover within 48 hours.',
    lethalDose: '2.4 g/kg can cause toxicity',
    notes: 'Symptoms usually resolve within 24-48 hours with supportive care.'
  },
  {
    name: 'Avocado',
    aliases: ['persin', 'avocado pit', 'avocado skin'],
    toxicityLevel: 'High',
    category: 'Fruit',
    symptoms: [
      'Vomiting',
      'Diarrhea',
      'Difficulty breathing',
      'Fluid accumulation around heart'
    ],
    onsetTime: '24-48 hours',
    treatment: 'Supportive care. Monitor for pancreatitis due to high fat content.',
    notes: 'Persin is toxic. Pit is a choking hazard and can cause intestinal blockage.'
  },
  {
    name: 'Alcohol',
    aliases: ['ethanol', 'beer', 'wine', 'liquor', 'spirits'],
    toxicityLevel: 'Critical',
    category: 'Beverage',
    symptoms: [
      'Vomiting',
      'Disorientation',
      'Difficulty walking',
      'Tremors',
      'Difficulty breathing',
      'Coma',
      'Death'
    ],
    onsetTime: '30-60 minutes',
    treatment: 'EMERGENCY - Immediate veterinary care. IV fluids and respiratory support.',
    lethalDose: '5.5-7.9 g/kg',
    notes: 'Never funny. Can cause severe CNS depression and acidosis.'
  },
  {
    name: 'Caffeine',
    aliases: ['coffee', 'tea', 'energy drinks', 'soda'],
    toxicityLevel: 'High',
    category: 'Beverage',
    symptoms: [
      'Restlessness',
      'Rapid heart rate',
      'Tremors',
      'Vomiting',
      'Elevated blood pressure',
      'Seizures'
    ],
    onsetTime: '1-2 hours',
    treatment: 'Veterinary care required. Induce vomiting, activated charcoal, supportive care.',
    lethalDose: '140-150 mg/kg',
    notes: 'Cats more sensitive than dogs. Coffee grounds and tea bags especially dangerous.'
  },
  {
    name: 'Raw Yeast Dough',
    aliases: ['bread dough', 'pizza dough', 'rising dough'],
    toxicityLevel: 'Critical',
    category: 'Food',
    symptoms: [
      'Bloated stomach',
      'Vomiting',
      'Abdominal pain',
      'Difficulty breathing',
      'Alcohol poisoning (from fermentation)',
      'Gastric dilatation-volvulus (GDV)'
    ],
    onsetTime: '1-2 hours',
    treatment: 'EMERGENCY - Can cause stomach rupture. Immediate surgery may be required.',
    notes: 'Dough continues to rise in warm stomach. Produces alcohol. Life-threatening.'
  },
  {
    name: 'Nutmeg',
    aliases: ['mace', 'myristicin'],
    toxicityLevel: 'High',
    category: 'Spice',
    symptoms: [
      'Disorientation',
      'Hallucinations',
      'Increased heart rate',
      'High blood pressure',
      'Seizures',
      'Tremors'
    ],
    onsetTime: '3-8 hours',
    treatment: 'Veterinary care. Supportive treatment for symptoms.',
    notes: 'Myristicin causes CNS toxicity. Even small amounts dangerous.'
  },
  {
    name: 'Star Anise',
    aliases: ['chinese star anise', 'illicium verum'],
    toxicityLevel: 'High',
    category: 'Spice',
    symptoms: [
      'Tremors',
      'Seizures',
      'Vomiting'
    ],
    onsetTime: '1-4 hours',
    treatment: 'Veterinary care for seizure management.',
    notes: 'Often confused with Japanese star anise which is even more toxic.'
  },
  {
    name: 'Hops',
    aliases: ['humulus lupulus', 'spent hops'],
    toxicityLevel: 'Critical',
    category: 'Herb',
    symptoms: [
      'Rapid heart rate',
      'Panting',
      'High fever (105°F+)',
      'Vomiting',
      'Seizures',
      'Death'
    ],
    onsetTime: '2-6 hours',
    treatment: 'EMERGENCY - Aggressive cooling and supportive care required.',
    notes: 'Malignant hyperthermia. Particularly dangerous for certain breeds.'
  },
  {
    name: 'Moldy Food',
    aliases: ['moldy', 'spoiled food', 'mycotoxins'],
    toxicityLevel: 'Critical',
    category: 'Food',
    symptoms: [
      'Tremors',
      'Seizures',
      'Vomiting',
      'High temperature'
    ],
    onsetTime: '30 minutes - 2 hours',
    treatment: 'Immediate veterinary care for tremor/seizure management.',
    notes: 'Mycotoxins can be fatal. Keep dogs away from compost and trash.'
  },
  {
    name: 'Raw Potato',
    aliases: ['potato skin', 'green potato', 'potato sprouts', 'solanine'],
    toxicityLevel: 'Moderate',
    category: 'Vegetable',
    symptoms: [
      'Vomiting',
      'Diarrhea',
      'Neurological issues',
      'Confusion'
    ],
    onsetTime: '2-4 hours',
    treatment: 'Supportive care. Most cases resolve with treatment.',
    notes: 'Solanine is toxic. Cooked potatoes are safe. Green parts most toxic.'
  },
  {
    name: 'Rhubarb',
    aliases: ['rhubarb leaves', 'rhubarb stalks'],
    toxicityLevel: 'High',
    category: 'Vegetable',
    symptoms: [
      'Drooling',
      'Vomiting',
      'Diarrhea',
      'Tremors',
      'Kidney failure'
    ],
    onsetTime: '1-3 hours',
    treatment: 'Veterinary care. IV fluids and kidney function monitoring.',
    notes: 'Oxalic acid causes kidney damage. Leaves more toxic than stalks.'
  },
  {
    name: 'Stone Fruit Pits',
    aliases: ['cherry pits', 'peach pits', 'apricot pits', 'plum pits', 'cyanide'],
    toxicityLevel: 'Critical',
    category: 'Fruit Seeds',
    symptoms: [
      'Dilated pupils',
      'Difficulty breathing',
      'Bright red gums',
      'Shock',
      'Death'
    ],
    onsetTime: '15-20 minutes',
    treatment: 'EMERGENCY - Cyanide poisoning. Immediate veterinary care required.',
    notes: 'Contains amygdalin which converts to cyanide. Also choking/blockage hazard.'
  },
  {
    name: 'Apple Seeds',
    aliases: ['apple core', 'cyanogenic glycosides'],
    toxicityLevel: 'Moderate',
    category: 'Fruit Seeds',
    symptoms: [
      'Dilated pupils',
      'Difficulty breathing',
      'Panting',
      'Shock'
    ],
    onsetTime: '15-20 minutes',
    treatment: 'Veterinary care if large quantity ingested.',
    notes: 'Apple flesh is safe. Seeds contain cyanide. Large dogs need many seeds for toxicity.'
  },
  {
    name: 'Wild Mushrooms',
    aliases: ['mushrooms', 'toadstools', 'fungi'],
    toxicityLevel: 'Critical',
    category: 'Fungi',
    symptoms: [
      'Vomiting',
      'Diarrhea',
      'Abdominal pain',
      'Jaundice',
      'Seizures',
      'Liver failure',
      'Death'
    ],
    onsetTime: '30 minutes - 12 hours (varies by species)',
    treatment: 'EMERGENCY - Bring mushroom sample to vet. Aggressive treatment required.',
    notes: 'Many species are toxic. Never let dogs eat wild mushrooms.'
  },
  {
    name: 'Artificial Sweeteners',
    aliases: ['aspartame', 'sucralose', 'stevia', 'saccharin'],
    toxicityLevel: 'Moderate',
    category: 'Sweetener',
    symptoms: [
      'Vomiting',
      'Diarrhea',
      'Upset stomach'
    ],
    onsetTime: '1-2 hours',
    treatment: 'Supportive care. Less dangerous than xylitol but should be avoided.',
    notes: 'Not as toxic as xylitol but can cause GI upset.'
  },
  {
    name: 'MSG',
    aliases: ['monosodium glutamate', 'e621'],
    toxicityLevel: 'Moderate',
    category: 'Additive',
    symptoms: [
      'Vomiting',
      'Diarrhea',
      'Tremors',
      'Disorientation'
    ],
    onsetTime: '1-2 hours',
    treatment: 'Supportive care. Usually resolves within 24 hours.',
    notes: 'Can cause "Chinese Restaurant Syndrome" in sensitive dogs.'
  },
  {
    name: 'Propylene Glycol',
    aliases: ['pg', 'e1520'],
    toxicityLevel: 'Moderate',
    category: 'Additive',
    symptoms: [
      'CNS depression',
      'Vomiting',
      'Lethargy'
    ],
    onsetTime: '1-4 hours',
    treatment: 'Supportive care.',
    notes: 'Found in some dog foods. Banned in cat food. High doses problematic.'
  },
  {
    name: 'Salt',
    aliases: ['sodium chloride', 'table salt', 'rock salt'],
    toxicityLevel: 'High',
    category: 'Mineral',
    symptoms: [
      'Excessive thirst',
      'Urination',
      'Vomiting',
      'Diarrhea',
      'Tremors',
      'Seizures',
      'Death'
    ],
    onsetTime: '1-3 hours',
    treatment: 'Veterinary care. Slow IV fluid replacement. Monitor electrolytes.',
    lethalDose: '4 g/kg',
    notes: 'Salt poisoning is serious. Keep salt dough crafts away from dogs.'
  },
  {
    name: 'Raw Eggs',
    aliases: ['raw egg whites', 'avidin'],
    toxicityLevel: 'Moderate',
    category: 'Food',
    symptoms: [
      'Biotin deficiency (long-term)',
      'Skin problems',
      'Salmonella risk'
    ],
    onsetTime: 'Long-term exposure',
    treatment: 'Cook eggs to prevent issues.',
    notes: 'Raw egg whites contain avidin which blocks biotin absorption.'
  },
  {
    name: 'Cooked Bones',
    aliases: ['chicken bones', 'rib bones', 'cooked bones'],
    toxicityLevel: 'High',
    category: 'Physical Hazard',
    symptoms: [
      'Choking',
      'Intestinal blockage',
      'Perforated intestines',
      'Constipation',
      'Rectal bleeding'
    ],
    onsetTime: 'Immediate to hours',
    treatment: 'EMERGENCY if choking or showing distress. May require surgery.',
    notes: 'Cooked bones splinter easily. Raw bones are safer but supervise always.'
  },
  {
    name: 'Tobacco',
    aliases: ['nicotine', 'cigarettes', 'cigars', 'vaping liquid'],
    toxicityLevel: 'Critical',
    category: 'Drug',
    symptoms: [
      'Drooling',
      'Vomiting',
      'Diarrhea',
      'Tremors',
      'Twitching',
      'Seizures',
      'Death'
    ],
    onsetTime: '15-45 minutes',
    treatment: 'EMERGENCY - Immediate veterinary care required.',
    lethalDose: '10 mg/kg nicotine',
    notes: 'E-cigarette liquid especially dangerous due to high concentration.'
  },
  {
    name: 'Corn on the Cob',
    aliases: ['corn cob'],
    toxicityLevel: 'High',
    category: 'Physical Hazard',
    symptoms: [
      'Vomiting',
      'Abdominal pain',
      'Loss of appetite',
      'Intestinal blockage'
    ],
    onsetTime: '1-24 hours',
    treatment: 'EMERGENCY - Often requires surgery to remove.',
    notes: 'Corn kernels are safe. Cob causes dangerous blockages.'
  },
];

/**
 * Search toxic ingredients by name or alias
 */
export function searchToxicIngredients(query: string): ToxicIngredient[] {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return TOXIC_INGREDIENTS_DATABASE;
  
  return TOXIC_INGREDIENTS_DATABASE.filter(ingredient => {
    return (
      ingredient.name.toLowerCase().includes(lowerQuery) ||
      ingredient.aliases.some(alias => alias.toLowerCase().includes(lowerQuery)) ||
      ingredient.category.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Get ingredient by exact name
 */
export function getToxicIngredientByName(name: string): ToxicIngredient | undefined {
  return TOXIC_INGREDIENTS_DATABASE.find(ing => 
    ing.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Filter by toxicity level
 */
export function filterByToxicityLevel(level: 'Critical' | 'High' | 'Moderate'): ToxicIngredient[] {
  return TOXIC_INGREDIENTS_DATABASE.filter(ing => ing.toxicityLevel === level);
}

/**
 * Filter by category
 */
export function filterByCategory(category: string): ToxicIngredient[] {
  return TOXIC_INGREDIENTS_DATABASE.filter(ing => 
    ing.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(TOXIC_INGREDIENTS_DATABASE.map(ing => ing.category));
  return Array.from(categories).sort();
}
