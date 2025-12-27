'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { DisclaimerModal } from '@/components/modals/disclaimer-modal';
import { ArrowLeft, Loader2, AlertCircle, ChefHat } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function GenerateRecipePage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const dogId = searchParams?.get('dogId');

  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>(dogId ?? '');
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerTier, setDisclaimerTier] = useState<'standard' | 'critical'>('standard');
  const [errorMessage, setErrorMessage] = useState('');
  const [healthRestrictions, setHealthRestrictions] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchDogs();
    }
  }, [status, router]);

  async function fetchDogs() {
    try {
      const response = await fetch('/api/dogs');
      if (!response.ok) throw new Error('Failed to fetch dogs');
      const data = await response.json();
      setDogs(data?.dogs ?? []);
      
      // Set first dog as selected if none provided
      if (!selectedDogId && data?.dogs?.length > 0) {
        setSelectedDogId(data.dogs[0].id);
      }
    } catch (error) {
      toast.error('Failed to load dog profiles');
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setHealthRestrictions(null);

    const formData = new FormData(e.currentTarget);
    const kibbleNutrition = {
      protein: formData.get('protein'),
      fat: formData.get('fat'),
      fiber: formData.get('fiber'),
      calcium: formData.get('calcium'),
      phosphorus: formData.get('phosphorus'),
    };

    try {
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogProfileId: selectedDogId,
          kibbleNutrition,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error ?? 'Failed to generate recipe');
        setDisclaimerTier(data?.disclaimerTier ?? 'critical');
        setHealthRestrictions(data?.healthRestrictions);
        setShowDisclaimer(true);
        return;
      }

      // Success - show disclaimer before showing recipe
      setGeneratedRecipe(data.recipe);
      setHealthRestrictions(data.healthRestrictions);
      setDisclaimerTier('standard');
      setShowDisclaimer(true);
    } catch (error) {
      toast.error('Failed to generate recipe');
    } finally {
      setLoading(false);
    }
  }

  async function saveRecipe() {
    if (!generatedRecipe) return;

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogProfileId: selectedDogId,
          ...generatedRecipe,
        }),
      });

      if (!response.ok) throw new Error('Failed to save recipe');

      const data = await response.json();
      toast.success('Recipe saved!');
      router.push(`/recipe/${data?.recipe?.id}`);
    } catch (error) {
      toast.error('Failed to save recipe');
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FDF6E9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDF6E9] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/my-dogs">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Dogs
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <ChefHat className="w-8 h-8 text-[#F97316]" />
            <div>
              <h1 className="text-3xl font-bold text-[#1C1917]">Generate Recipe</h1>
              <p className="text-[#78716C]">Create a personalized homemade recipe for your dog</p>
            </div>
          </div>

          {dogs?.length === 0 ? (
            <Card className="p-6 bg-[#FDF6E9] border-[#F97316]">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#1C1917] font-medium mb-2">No Dog Profiles Found</p>
                  <p className="text-[#78716C] text-sm mb-4">
                    You need to create a dog profile before generating recipes.
                  </p>
                  <Link href="/my-dogs/new">
                    <Button size="sm" className="bg-[#F97316] hover:bg-[#ea580c]">
                      Create Dog Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <Label htmlFor="dogId">Select Dog</Label>
                <select
                  id="dogId"
                  value={selectedDogId}
                  onChange={(e) => setSelectedDogId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                >
                  <option value="">Choose a dog</option>
                  {dogs.map((dog) => (
                    <option key={dog?.id} value={dog?.id}>
                      {dog?.name ?? 'Unknown'} - {dog?.breed ?? 'Mixed Breed'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-[#1C1917] mb-4">Kibble Nutrition Information</h3>
                <p className="text-sm text-[#78716C] mb-4">
                  Enter the nutritional values from your dog's current kibble (found on the packaging)
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="protein">Protein (%) *</Label>
                    <Input
                      id="protein"
                      name="protein"
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g., 24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fat">Fat (%) *</Label>
                    <Input
                      id="fat"
                      name="fat"
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g., 12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fiber">Fiber (%) *</Label>
                    <Input
                      id="fiber"
                      name="fiber"
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g., 4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="calcium">Calcium (%)</Label>
                    <Input
                      id="calcium"
                      name="calcium"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phosphorus">Phosphorus (%)</Label>
                    <Input
                      id="phosphorus"
                      name="phosphorus"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.0"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F97316] hover:bg-[#ea580c]"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate Recipe
              </Button>
            </form>
          )}
        </motion.div>
      </div>

      <DisclaimerModal
        open={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onAccept={() => {
          setShowDisclaimer(false);
          if (generatedRecipe && disclaimerTier === 'standard') {
            saveRecipe();
          }
        }}
        tier={disclaimerTier}
        dogProfileId={selectedDogId}
        customMessage={errorMessage || undefined}
      />
    </div>
  );
}