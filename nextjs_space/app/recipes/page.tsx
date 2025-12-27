'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { Button } from '@/components/ui/button';
import { ChefHat, Grid3x3, List, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RecipesPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [dogs, setDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDogId, setFilterDogId] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  async function fetchData() {
    try {
      const [recipesRes, dogsRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/dogs'),
      ]);

      if (!recipesRes.ok || !dogsRes.ok) throw new Error('Failed to fetch data');

      const recipesData = await recipesRes.json();
      const dogsData = await dogsRes.json();

      setRecipes(recipesData?.recipes ?? []);
      setDogs(dogsData?.dogs ?? []);
    } catch (error) {
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }

  const filteredRecipes = filterDogId
    ? recipes.filter((r) => r?.dogProfileId === filterDogId)
    : recipes;

  if (status === 'loading' || (status === 'authenticated' && loading)) {
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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1C1917]">Saved Recipes</h1>
            <p className="text-[#78716C] mt-1">Your personalized homemade dog food recipes</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-[#F97316] hover:bg-[#ea580c]' : ''}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-[#F97316] hover:bg-[#ea580c]' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter */}
        {dogs?.length > 1 && (
          <div className="mb-6">
            <select
              value={filterDogId}
              onChange={(e) => setFilterDogId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="">All Dogs</option>
              {dogs.map((dog) => (
                <option key={dog?.id} value={dog?.id}>
                  {dog?.name ?? 'Unknown'}
                </option>
              ))}
            </select>
          </div>
        )}

        {filteredRecipes?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <ChefHat className="w-20 h-20 text-[#F97316] mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[#1C1917] mb-2">No Recipes Yet</h2>
            <p className="text-[#78716C] mb-6 max-w-md mx-auto">
              {filterDogId
                ? 'No recipes found for this dog. Generate a new recipe to get started.'
                : 'Generate your first recipe to start creating homemade meals for your dogs.'}
            </p>
            <Link href="/generate">
              <Button className="bg-[#F97316] hover:bg-[#ea580c]">
                <ChefHat className="w-4 h-4 mr-2" />
                Generate Recipe
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div
            className={`${
              viewMode === 'grid'
                ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }`}
          >
            {filteredRecipes.map((recipe, i) => (
              <motion.div
                key={recipe?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <RecipeCard recipe={recipe} onFavoriteToggle={fetchData} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}