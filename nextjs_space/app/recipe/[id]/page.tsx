'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Heart, Trash2, Loader2, ChefHat, ShoppingCart, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PrintableRecipe } from '@/components/recipes/printable-recipe';

export default function RecipeDetailPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const params = useParams();
  const recipeId = params?.id as string;

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && recipeId) {
      fetchRecipe();
    }
  }, [status, recipeId, router]);

  async function fetchRecipe() {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (!response.ok) throw new Error('Failed to fetch recipe');
      const data = await response.json();
      setRecipe(data?.recipe);
      setIsFavorite(data?.recipe?.isFavorite ?? false);
    } catch (error) {
      toast.error('Failed to load recipe');
      router.push('/recipes');
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite() {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });

      if (!response.ok) throw new Error('Failed to toggle favorite');

      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  }

  async function deleteRecipe() {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete recipe');

      toast.success('Recipe deleted');
      router.push('/recipes');
    } catch (error) {
      toast.error('Failed to delete recipe');
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#FDF6E9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !recipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDF6E9] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/recipes">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Recipes
            </Button>
          </Link>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={toggleFavorite}
              className={isFavorite ? 'border-[#F97316]' : ''}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  isFavorite ? 'fill-[#F97316] text-[#F97316]' : ''
                }`}
              />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
            <Button variant="outline" onClick={deleteRecipe} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <PrintableRecipe recipe={recipe} />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <Card className="p-8 bg-gradient-to-br from-[#F97316] to-[#ea580c] text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <ChefHat className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">{recipe?.name ?? 'Untitled Recipe'}</h1>
                </div>
                <p className="text-white/90">For: {recipe?.dogProfile?.name ?? 'Unknown Dog'}</p>
                <p className="text-sm text-white/80 mt-2">Serving Size: {recipe?.servingSize ?? 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Nutrition Summary */}
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-semibold text-[#1C1917] mb-4">Nutrition Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Protein', value: recipe?.nutritionSummary?.protein, unit: '%' },
                { label: 'Fat', value: recipe?.nutritionSummary?.fat, unit: '%' },
                { label: 'Fiber', value: recipe?.nutritionSummary?.fiber, unit: '%' },
                { label: 'Calcium', value: recipe?.nutritionSummary?.calcium, unit: '%' },
                { label: 'Phosphorus', value: recipe?.nutritionSummary?.phosphorus, unit: '%' },
              ].map((nutrient, i) => (
                <div key={i} className="bg-[#FDF6E9] p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-[#F97316]">
                    {nutrient?.value ?? 0}{nutrient?.unit}
                  </p>
                  <p className="text-sm text-[#78716C] mt-1">{nutrient?.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Ingredients */}
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-semibold text-[#1C1917] mb-4">Ingredients</h2>
            <ul className="space-y-3">
              {(recipe?.ingredients as any[] ?? []).map((ingredient, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 bg-[#FDF6E9] p-3 rounded-lg"
                >
                  <span className="w-6 h-6 rounded-full bg-[#F97316] text-white text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-[#1C1917]">
                      {ingredient?.amount} {ingredient?.name}
                    </p>
                    {ingredient?.notes && (
                      <p className="text-sm text-[#78716C] mt-1">{ingredient.notes}</p>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </Card>

          {/* Instructions */}
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-semibold text-[#1C1917] mb-4">Cooking Instructions</h2>
            <ol className="space-y-4">
              {(recipe?.instructions as any[] ?? []).map((instruction, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4"
                >
                  <span className="w-8 h-8 rounded-full bg-[#22C55E] text-white font-semibold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-[#1C1917] pt-1">{instruction}</p>
                </motion.li>
              ))}
            </ol>
          </Card>

          {/* Supplements */}
          <Card className="p-6 bg-white border-2 border-[#F59E0B]">
            <div className="flex items-start gap-3 mb-4">
              <ShoppingCart className="w-6 h-6 text-[#F59E0B] flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-[#1C1917]">Recommended Supplements</h2>
                <p className="text-sm text-[#78716C] mt-1">
                  Essential supplements to ensure complete and balanced nutrition
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {(recipe?.supplements as any[] ?? []).map((supplement, i) => (
                <div key={i} className="bg-[#FDF6E9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#1C1917] mb-1">{supplement?.name}</h3>
                  <p className="text-sm text-[#78716C] mb-2">
                    <span className="font-medium">Amount:</span> {supplement?.amount}
                  </p>
                  <p className="text-sm text-[#78716C] mb-3">
                    <span className="font-medium">Why:</span> {supplement?.reason}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(supplement?.affiliateLinks as any[] ?? []).map((link, j) => (
                      <a
                        key={j}
                        href={link?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-md hover:bg-[#ea580c] transition-colors text-sm"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Buy on {link?.retailer}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#78716C] mt-4 italic">
              Affiliate Disclosure: Chef Doggo may earn a commission from purchases made through these links at
              no extra cost to you.
            </p>
          </Card>

          {/* Transition Guide */}
          {recipe?.transitionGuide && (recipe.transitionGuide as any[])?.length > 0 && (
            <Card className="p-6 bg-white">
              <h2 className="text-xl font-semibold text-[#1C1917] mb-4">7-Day Transition Guide</h2>
              <p className="text-[#78716C] mb-4 text-sm">
                Gradually transition from kibble to homemade food to avoid digestive upset
              </p>
              <div className="space-y-3">
                {(recipe.transitionGuide as any[]).map((day, i) => (
                  <div key={i} className="flex items-center gap-4 bg-[#FDF6E9] p-4 rounded-lg">
                    <div className="flex-shrink-0 w-24">
                      <p className="font-semibold text-[#1C1917] text-sm">{day?.day}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-4 text-sm">
                        <span className="text-[#78716C]">
                          <strong className="text-[#F97316]">Kibble:</strong> {day?.kibble}
                        </span>
                        <span className="text-[#78716C]">
                          <strong className="text-[#22C55E]">Homemade:</strong> {day?.homemade}
                        </span>
                      </div>
                      <p className="text-xs text-[#78716C] mt-1">{day?.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Important Disclaimer */}
          <Card className="p-6 bg-[#FDF6E9] border-2 border-[#F97316]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-[#F97316] flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-[#1C1917] mb-2">Important Veterinary Disclaimer</h3>
                <p className="text-sm text-[#78716C] leading-relaxed">
                  This recipe is for informational purposes only and is NOT a substitute for professional
                  veterinary advice. Before making any changes to your dog's diet, consult with your
                  veterinarian to ensure it meets your dog's specific nutritional needs and health requirements.
                  Monitor your dog closely during any dietary transition.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}