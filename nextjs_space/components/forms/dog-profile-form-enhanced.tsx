'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface DogProfileFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function DogProfileFormEnhanced({ initialData, isEdit = false }: DogProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allergies, setAllergies] = useState<string[]>(initialData?.allergies ?? []);
  const [healthConditions, setHealthConditions] = useState<string[]>(initialData?.healthConditions ?? []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialData?.dietaryRestrictions ?? []);
  const [medications, setMedications] = useState<string[]>(initialData?.medications ?? []);
  const [allergyInput, setAllergyInput] = useState('');
  const [healthInput, setHealthInput] = useState('');
  const [dietaryInput, setDietaryInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      breed: formData.get('breed'),
      weight: formData.get('weight'),
      age: formData.get('age'),
      size: formData.get('size'),
      lifeStage: formData.get('lifeStage'),
      activityLevel: formData.get('activityLevel'),
      // Holistic options
      nutritionPhilosophy: formData.get('nutritionPhilosophy') || null,
      tcvmConstitution: formData.get('tcvmConstitution') || null,
      tcvmThermalNature: formData.get('tcvmThermalNature') || null,
      ayurvedicDosha: formData.get('ayurvedicDosha') || null,
      conditionDiet: formData.get('conditionDiet') || null,
      // Arrays
      allergies,
      healthConditions,
      dietaryRestrictions,
      medications,
    };

    try {
      const url = isEdit ? `/api/dogs/${initialData?.id}` : '/api/dogs';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save dog profile');
      }

      toast.success(isEdit ? 'Dog profile updated!' : 'Dog profile created!');
      router.push('/my-dogs');
      router.refresh();
    } catch (error) {
      toast.error('Failed to save dog profile');
    } finally {
      setLoading(false);
    }
  }

  const addAllergy = () => {
    if (allergyInput?.trim?.() && !allergies?.includes?.(allergyInput.trim())) {
      setAllergies([...(allergies ?? []), allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const addHealth = () => {
    if (healthInput?.trim?.() && !healthConditions?.includes?.(healthInput.trim())) {
      setHealthConditions([...(healthConditions ?? []), healthInput.trim()]);
      setHealthInput('');
    }
  };

  const addDietary = () => {
    if (dietaryInput?.trim?.() && !dietaryRestrictions?.includes?.(dietaryInput.trim())) {
      setDietaryRestrictions([...(dietaryRestrictions ?? []), dietaryInput.trim()]);
      setDietaryInput('');
    }
  };

  const addMedication = () => {
    if (medicationInput?.trim?.() && !medications?.includes?.(medicationInput.trim())) {
      setMedications([...(medications ?? []), medicationInput.trim()]);
      setMedicationInput('');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="health">Health & Diet</TabsTrigger>
          <TabsTrigger value="holistic">Holistic Options</TabsTrigger>
        </TabsList>

        {/* BASIC INFO TAB */}
        <TabsContent value="basic" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about your dog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Dog's Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={initialData?.name}
                  required
                  placeholder="e.g., Max"
                />
              </div>

              <div>
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  name="breed"
                  defaultValue={initialData?.breed}
                  placeholder="e.g., Golden Retriever"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (lbs) *</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    defaultValue={initialData?.weight}
                    required
                    placeholder="e.g., 50"
                  />
                </div>

                <div>
                  <Label htmlFor="age">Age (years) *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    step="0.1"
                    defaultValue={initialData?.age}
                    required
                    placeholder="e.g., 3"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="size">Size *</Label>
                <select
                  id="size"
                  name="size"
                  defaultValue={initialData?.size}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="">Select size</option>
                  <option value="toy">Toy (under 10 lbs)</option>
                  <option value="small">Small (10-25 lbs)</option>
                  <option value="medium">Medium (26-50 lbs)</option>
                  <option value="large">Large (51-90 lbs)</option>
                  <option value="giant">Giant (over 90 lbs)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="lifeStage">Life Stage *</Label>
                <select
                  id="lifeStage"
                  name="lifeStage"
                  defaultValue={initialData?.lifeStage}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="">Select life stage</option>
                  <option value="puppy">Puppy (under 1 year)</option>
                  <option value="adult">Adult (1-7 years)</option>
                  <option value="senior">Senior (7+ years)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="activityLevel">Activity Level *</Label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  defaultValue={initialData?.activityLevel}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="">Select activity level</option>
                  <option value="low">Low (mostly sedentary)</option>
                  <option value="moderate">Moderate (daily walks)</option>
                  <option value="high">High (very active, working dog)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HEALTH & DIET TAB */}
        <TabsContent value="health" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Health & Dietary Information</CardTitle>
              <CardDescription>Medical conditions, allergies, and current medications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Allergies</Label>
                <div className="flex gap-2">
                  <Input
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    placeholder="e.g., chicken"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  />
                  <Button type="button" onClick={addAllergy} size="sm">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
                {allergies?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allergies.map((allergy, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#F59E0B] text-white rounded-full text-sm flex items-center gap-2"
                      >
                        {allergy}
                        <button
                          type="button"
                          onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}
                          className="hover:text-gray-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Health Conditions</Label>
                <div className="flex gap-2">
                  <Input
                    value={healthInput}
                    onChange={(e) => setHealthInput(e.target.value)}
                    placeholder="e.g., diabetes, arthritis"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHealth())}
                  />
                  <Button type="button" onClick={addHealth} size="sm">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
                {healthConditions?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {healthConditions.map((condition, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#22C55E] text-white rounded-full text-sm flex items-center gap-2"
                      >
                        {condition}
                        <button
                          type="button"
                          onClick={() => setHealthConditions(healthConditions.filter((_, idx) => idx !== i))}
                          className="hover:text-gray-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Dietary Restrictions</Label>
                <div className="flex gap-2">
                  <Input
                    value={dietaryInput}
                    onChange={(e) => setDietaryInput(e.target.value)}
                    placeholder="e.g., grain-free, low-fat"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDietary())}
                  />
                  <Button type="button" onClick={addDietary} size="sm">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
                {dietaryRestrictions?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dietaryRestrictions.map((restriction, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#F97316] text-white rounded-full text-sm flex items-center gap-2"
                      >
                        {restriction}
                        <button
                          type="button"
                          onClick={() => setDietaryRestrictions(dietaryRestrictions.filter((_, idx) => idx !== i))}
                          className="hover:text-gray-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Current Medications</Label>
                <p className="text-sm text-gray-600 mb-2">List any medications your dog is currently taking (for interaction warnings)</p>
                <div className="flex gap-2">
                  <Input
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                    placeholder="e.g., Prednisone, Rimadyl"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                  />
                  <Button type="button" onClick={addMedication} size="sm">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
                {medications?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {medications.map((medication, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm flex items-center gap-2"
                      >
                        {medication}
                        <button
                          type="button"
                          onClick={() => setMedications(medications.filter((_, idx) => idx !== i))}
                          className="hover:text-gray-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HOLISTIC OPTIONS TAB */}
        <TabsContent value="holistic" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Holistic Nutrition Options</CardTitle>
              <CardDescription>
                Optional: Incorporate traditional healing systems and specialized diets into recipes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nutrition Philosophy */}
              <div>
                <Label htmlFor="nutritionPhilosophy">Nutrition Philosophy</Label>
                <p className="text-sm text-gray-600 mb-2">Your preferred approach to feeding</p>
                <select
                  id="nutritionPhilosophy"
                  name="nutritionPhilosophy"
                  defaultValue={initialData?.nutritionPhilosophy ?? ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="">Not specified</option>
                  <option value="Balanced">Balanced (AAFCO-compliant standard)</option>
                  <option value="Raw-BARF">Raw/BARF (Biologically Appropriate Raw Food)</option>
                  <option value="Ancestral">Ancestral (prey-model, high protein)</option>
                  <option value="Whole-Food">Whole Food (minimally processed variety)</option>
                  <option value="Rotational">Rotational (rotating proteins to prevent allergies)</option>
                  <option value="Functional">Functional (therapeutic ingredients focus)</option>
                </select>
              </div>

              {/* TCVM Section */}
              <div className="space-y-3 p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <h4 className="text-md font-semibold text-[#1C1917]">Traditional Chinese Veterinary Medicine (TCVM)</h4>
                  <Info className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm text-gray-600">Food energetics and Five Element constitution</p>
                
                <div>
                  <Label htmlFor="tcvmConstitution">Five Element Constitution</Label>
                  <select
                    id="tcvmConstitution"
                    name="tcvmConstitution"
                    defaultValue={initialData?.tcvmConstitution ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="">Not specified</option>
                    <option value="wood">Wood (Liver, Gallbladder) - Flexibility, eye health</option>
                    <option value="fire">Fire (Heart, Small Intestine) - Circulation, spirit</option>
                    <option value="earth">Earth (Spleen, Stomach) - Digestion, immunity</option>
                    <option value="metal">Metal (Lung, Large Intestine) - Breathing, skin</option>
                    <option value="water">Water (Kidney, Bladder) - Bones, joints, longevity</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="tcvmThermalNature">Thermal Nature / Constitutional Type</Label>
                  <select
                    id="tcvmThermalNature"
                    name="tcvmThermalNature"
                    defaultValue={initialData?.tcvmThermalNature ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="">Not specified / Auto-detect</option>
                    <option value="yang-hot">Yang/Hot (energetic, seeks cool, red gums) - Needs cooling foods</option>
                    <option value="yin-cold">Yin/Cold (sedate, seeks warmth, cold paws) - Needs warming foods</option>
                    <option value="balanced">Balanced (adapts well, steady energy) - Variety OK</option>
                  </select>
                </div>
              </div>

              {/* Ayurveda Section */}
              <div className="space-y-3 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <h4 className="text-md font-semibold text-[#1C1917]">Ayurvedic Medicine</h4>
                  <Info className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Dosha-based dietary principles for balance</p>
                
                <div>
                  <Label htmlFor="ayurvedicDosha">Ayurvedic Dosha</Label>
                  <select
                    id="ayurvedicDosha"
                    name="ayurvedicDosha"
                    defaultValue={initialData?.ayurvedicDosha ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="">Not specified</option>
                    <option value="vata">Vata (Air/Space) - High energy, anxious, dry skin - Needs warming</option>
                    <option value="pitta">Pitta (Fire/Water) - Smart, athletic, aggressive - Needs cooling</option>
                    <option value="kapha">Kapha (Earth/Water) - Sturdy, easy-going, weight gain - Needs light/dry</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Common breeds: Vata (Greyhound, Poodle), Pitta (German Shepherd, Doberman), Kapha (Saint Bernard, Basset Hound)
                  </p>
                </div>
              </div>

              {/* Condition-Specific Diet */}
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <h4 className="text-md font-semibold text-[#1C1917]">Condition-Specific Therapeutic Diet</h4>
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Evidence-based dietary modifications for health conditions</p>
                
                <div>
                  <Label htmlFor="conditionDiet">Therapeutic Diet Type</Label>
                  <select
                    id="conditionDiet"
                    name="conditionDiet"
                    defaultValue={initialData?.conditionDiet ?? ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="">None / Not specified</option>
                    <option value="anti-inflammatory">Anti-Inflammatory (allergies, joint pain, skin issues)</option>
                    <option value="ketogenic">Ketogenic (cancer support, epilepsy) ⚠️ Requires vet approval</option>
                    <option value="renal">Renal-Friendly (kidney disease/CKD) ⚠️ Low protein, low phosphorus</option>
                    <option value="cardiac">Cardiac-Friendly (heart disease/CHF) ⚠️ Low sodium</option>
                    <option value="diabetic">Diabetic-Friendly (diabetes mellitus) ⚠️ High fiber, complex carbs</option>
                    <option value="elimination">Elimination Diet (identifying allergies) ⚠️ Single protein source</option>
                  </select>
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Therapeutic diets require veterinary supervision and regular monitoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button type="submit" disabled={loading} className="w-full bg-[#F97316] hover:bg-[#ea580c]">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isEdit ? 'Update Profile' : 'Create Profile'}
      </Button>
    </form>
  );
}
