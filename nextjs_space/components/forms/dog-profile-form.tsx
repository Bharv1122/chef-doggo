'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DogProfileFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function DogProfileForm({ initialData, isEdit = false }: DogProfileFormProps) {
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
      nutritionPhilosophy: formData.get('nutritionPhilosophy'),
      useTCVM: formData.get('useTCVM') === 'on',
      useAyurveda: formData.get('useAyurveda') === 'on',
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
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1C1917]">Basic Information</h3>
        
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
      </div>

      {/* Health Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#1C1917]">Health & Dietary Information</h3>

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
              placeholder="e.g., diabetes"
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
              placeholder="e.g., no grains"
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

        <div>
          <Label>Holistic Medicine Preferences</Label>
          <p className="text-sm text-gray-600 mb-3">Optional: Incorporate traditional healing systems into recipes</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useTCVM"
                name="useTCVM"
                defaultChecked={initialData?.useTCVM ?? false}
                className="w-4 h-4 text-[#F97316] border-gray-300 rounded focus:ring-[#F97316]"
              />
              <label htmlFor="useTCVM" className="text-sm text-[#1C1917]">
                Use TCVM (Traditional Chinese Veterinary Medicine) - Food energetics and constitution-based recommendations
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useAyurveda"
                name="useAyurveda"
                defaultChecked={initialData?.useAyurveda ?? false}
                className="w-4 h-4 text-[#F97316] border-gray-300 rounded focus:ring-[#F97316]"
              />
              <label htmlFor="useAyurveda" className="text-sm text-[#1C1917]">
                Use Ayurveda - Dosha-based dietary principles for balance
              </label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="nutritionPhilosophy">Nutrition Philosophy</Label>
          <select
            id="nutritionPhilosophy"
            name="nutritionPhilosophy"
            defaultValue={initialData?.nutritionPhilosophy ?? 'Balanced'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <option value="Balanced">Balanced</option>
            <option value="High-Protein">High-Protein</option>
            <option value="Low-Fat">Low-Fat</option>
            <option value="Grain-Free">Grain-Free</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-[#F97316] hover:bg-[#ea580c]">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isEdit ? 'Update Profile' : 'Create Profile'}
      </Button>
    </form>
  );
}