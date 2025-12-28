'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import Image from 'next/image';

interface PrintableRecipeProps {
  recipe: any;
}

export function PrintableRecipe({ recipe }: PrintableRecipeProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (!recipe) return null;

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const nutritionSummary = recipe.nutritionSummary || {};
  const supplements = Array.isArray(recipe.supplements) ? recipe.supplements : [];
  const transitionGuide = Array.isArray(recipe.transitionGuide) ? recipe.transitionGuide : [];

  return (
    <>
      {/* Print Button - Hidden during print */}
      <Button
        onClick={handlePrint}
        variant="outline"
        size="sm"
        className="no-print"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Recipe
      </Button>

      {/* Printable Content - Hidden on screen, visible when printing */}
      <div ref={printRef} className="print-only hidden">
        <div className="p-8">
          {/* Header */}
          <div className="border-b-4 border-[#F97316] pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1C1917] mb-2">{recipe.name}</h1>
                <p className="text-sm text-gray-600">For: {recipe.dogProfile?.name || 'Your Dog'}</p>
                <p className="text-sm text-gray-600">Breed: {recipe.dogProfile?.breed || 'N/A'}</p>
              </div>
              {recipe.recipeImageUrl && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                  <Image
                    src={recipe.recipeImageUrl}
                    alt={recipe.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Nutrition Summary */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#F97316] mb-3">Nutritional Information</h2>
            <div className="grid grid-cols-2 gap-3">
              {nutritionSummary.protein && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-semibold">Protein</p>
                  <p className="text-lg">{nutritionSummary.protein}%</p>
                </div>
              )}
              {nutritionSummary.fat && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-semibold">Fat</p>
                  <p className="text-lg">{nutritionSummary.fat}%</p>
                </div>
              )}
              {nutritionSummary.fiber && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-semibold">Fiber</p>
                  <p className="text-lg">{nutritionSummary.fiber}%</p>
                </div>
              )}
              {nutritionSummary.calcium && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-semibold">Calcium</p>
                  <p className="text-lg">{nutritionSummary.calcium}%</p>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">Serving Size: {recipe.servingSize || 'See instructions'}</p>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#F97316] mb-3">Ingredients</h2>
            <div className="space-y-2">
              {ingredients.map((ing: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#F97316] font-bold mt-1">•</span>
                  <div className="flex-1">
                    <p className="font-semibold">{ing.name}</p>
                    <p className="text-sm text-gray-600">{ing.amount}</p>
                    {ing.notes && <p className="text-xs text-gray-500 italic">{ing.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 page-break-before">
            <h2 className="text-xl font-bold text-[#F97316] mb-3">Cooking Instructions</h2>
            <ol className="space-y-3">
              {instructions.map((instruction: string, idx: number) => (
                <li key={idx} className="flex gap-3">
                  <span className="font-bold text-[#F97316] flex-shrink-0">{idx + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Supplements */}
          {supplements.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#F97316] mb-3">Recommended Supplements</h2>
              <div className="space-y-2">
                {supplements.map((supp: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">{supp.name}</p>
                    <p className="text-sm text-gray-600">{supp.dosage}</p>
                    {supp.reason && <p className="text-xs text-gray-500 mt-1">{supp.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transition Guide */}
          {transitionGuide.length > 0 && (
            <div className="mb-6 page-break-before">
              <h2 className="text-xl font-bold text-[#F97316] mb-3">7-Day Transition Guide</h2>
              <p className="text-sm text-gray-600 mb-4">
                Gradually transition your dog to this new diet over 7 days to avoid digestive upset.
              </p>
              <div className="space-y-2">
                {transitionGuide.map((day: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-[#F97316] pl-4 py-2">
                    <p className="font-semibold">{day.day}</p>
                    <p className="text-sm text-gray-600">{day.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="border-t-2 border-gray-300 pt-4 mt-6">
            <h3 className="font-bold text-lg mb-3">Important Notes:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Always consult with your veterinarian before making significant changes to your dog's diet.</li>
              <li>• Monitor your dog's weight, energy levels, and stool quality during the transition.</li>
              <li>• Store prepared food in airtight containers in the refrigerator for up to 3 days, or freeze for up to 3 months.</li>
              <li>• Ensure fresh water is always available.</li>
              <li>• If your dog shows any signs of digestive upset, slow down the transition process.</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
            <p><strong>Chef Doggo</strong> - Personalized Homemade Dog Food Recipes</p>
            <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </>
  );
}
