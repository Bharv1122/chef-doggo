'use client';

import Link from 'next/link';
import { Heart, ChefHat, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface RecipeCardProps {
  recipe: any;
  onFavoriteToggle?: () => void;
}

export function RecipeCard({ recipe, onFavoriteToggle }: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(recipe?.isFavorite ?? false);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const response = await fetch(`/api/recipes/${recipe?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      onFavoriteToggle?.();
    } catch (error) {
      toast.error('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link href={`/recipe/${recipe?.id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white border-[#FDF6E9] hover:border-[#F97316] group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-[#F97316]" />
            <h3 className="font-semibold text-lg text-[#1C1917] group-hover:text-[#F97316] transition-colors">
              {recipe?.name ?? 'Untitled Recipe'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFavorite}
            disabled={loading}
            className="hover:bg-transparent"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-[#F97316] text-[#F97316]' : 'text-gray-400 hover:text-[#F97316]'
              }`}
            />
          </Button>
        </div>

        <div className="space-y-2 text-sm text-[#78716C]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>For: {recipe?.dogProfile?.name ?? 'Unknown Dog'}</span>
          </div>

          <div className="flex gap-4 mt-3">
            <div className="bg-[#FDF6E9] px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-[#1C1917]">
                Protein: {recipe?.nutritionSummary?.protein ?? 0}%
              </span>
            </div>
            <div className="bg-[#FDF6E9] px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-[#1C1917]">
                Fat: {recipe?.nutritionSummary?.fat ?? 0}%
              </span>
            </div>
          </div>

          <p className="text-xs mt-3">
            Serving: {recipe?.servingSize ?? 'N/A'}
          </p>
        </div>
      </Card>
    </Link>
  );
}