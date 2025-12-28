'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
}

interface Recipe {
  id: string;
  name: string;
  recipeImageUrl?: string;
  calories?: number;
}

interface MealPlanEntry {
  id: string;
  date: Date;
  mealType: string;
  recipeId?: string;
  recipe?: Recipe;
  notes?: string;
}

interface MealPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  dogProfile: DogProfile;
  entries: MealPlanEntry[];
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function MealPlannerPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedDog, setSelectedDog] = useState<string>('');
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; mealType: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDogs();
      fetchRecipes();
    }
  }, [status]);

  useEffect(() => {
    if (selectedDog) {
      fetchMealPlans(selectedDog);
    }
  }, [selectedDog]);

  const fetchDogs = async () => {
    try {
      const res = await fetch('/api/dogs');
      const data = await res.json();
      setDogs(data.dogs || []);
      if (data.dogs?.length > 0) {
        setSelectedDog(data.dogs[0].id);
      }
    } catch (error) {
      console.error('Error fetching dogs:', error);
      toast.error('Failed to load dog profiles');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes');
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchMealPlans = async (dogId: string) => {
    try {
      const res = await fetch(`/api/meal-plans?dogProfileId=${dogId}`);
      const data = await res.json();
      const plans = data.mealPlans || [];
      setMealPlans(plans);
      
      // Find active plan or use most recent
      const now = new Date();
      const activePlan = plans.find((p: MealPlan) => {
        const start = new Date(p.startDate);
        const end = p.endDate ? new Date(p.endDate) : null;
        return start <= now && (!end || end >= now);
      });
      
      setCurrentMealPlan(activePlan || plans[0] || null);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast.error('Failed to load meal plans');
    }
  };

  const createNewPlan = async () => {
    if (!newPlanName.trim() || !selectedDog) return;

    try {
      const res = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogProfileId: selectedDog,
          name: newPlanName,
          startDate: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMealPlans([data.mealPlan, ...mealPlans]);
        setCurrentMealPlan(data.mealPlan);
        setNewPlanName('');
        setShowNewPlanDialog(false);
        toast.success('Meal plan created!');
      } else {
        toast.error(data.error || 'Failed to create meal plan');
      }
    } catch (error) {
      console.error('Error creating meal plan:', error);
      toast.error('Failed to create meal plan');
    }
  };

  const assignRecipeToSlot = async (date: Date, mealType: string, recipeId: string) => {
    if (!currentMealPlan) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/meal-plans/${currentMealPlan.id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: [{
            date: date.toISOString(),
            mealType,
            recipeId,
          }],
        }),
      });

      if (res.ok) {
        // Refresh current meal plan
        const planRes = await fetch(`/api/meal-plans/${currentMealPlan.id}`);
        const planData = await planRes.json();
        setCurrentMealPlan(planData.mealPlan);
        toast.success('Recipe assigned!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to assign recipe');
      }
    } catch (error) {
      console.error('Error assigning recipe:', error);
      toast.error('Failed to assign recipe');
    } finally {
      setSaving(false);
    }
  };

  const getEntryForSlot = (date: Date, mealType: string): MealPlanEntry | undefined => {
    if (!currentMealPlan) return undefined;
    return currentMealPlan.entries.find(entry => 
      isSameDay(new Date(entry.date), date) && entry.mealType === mealType
    );
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (dogs.length === 0) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>No Dogs Found</CardTitle>
            <CardDescription>
              You need to add a dog profile before creating meal plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/my-dogs/new')}>
              Add Your First Dog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary">Weekly Meal Planner</h1>
        <p className="text-muted-foreground">Plan and organize your dog's meals for the week</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="dog-select">Select Dog</Label>
          <Select value={selectedDog} onValueChange={setSelectedDog}>
            <SelectTrigger id="dog-select">
              <SelectValue placeholder="Select a dog" />
            </SelectTrigger>
            <SelectContent>
              {dogs.map(dog => (
                <SelectItem key={dog.id} value={dog.id}>
                  {dog.name} ({dog.breed})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="plan-select">Active Meal Plan</Label>
          <Select 
            value={currentMealPlan?.id || ''} 
            onValueChange={(id) => {
              const plan = mealPlans.find(p => p.id === id);
              setCurrentMealPlan(plan || null);
            }}
          >
            <SelectTrigger id="plan-select">
              <SelectValue placeholder="Select or create a plan" />
            </SelectTrigger>
            <SelectContent>
              {mealPlans.map(plan => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Meal Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Meal Plan</DialogTitle>
                <DialogDescription>
                  Create a new meal plan for {dogs.find(d => d.id === selectedDog)?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    placeholder="e.g., Summer 2024 Plan"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                  />
                </div>
                <Button onClick={createNewPlan} className="w-full">
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!currentMealPlan ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Meal Plan</CardTitle>
            <CardDescription>
              Create a new meal plan to get started
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Week
            </Button>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5" />
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
            >
              Next Week
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {weekDays.map((day, dayIndex) => (
              <Card key={dayIndex} className="overflow-hidden">
                <CardHeader className="pb-3 bg-muted/50">
                  <CardTitle className="text-center text-sm font-semibold">
                    {format(day, 'EEE')}
                  </CardTitle>
                  <CardDescription className="text-center text-lg font-bold">
                    {format(day, 'd')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                  {mealTypes.map(mealType => {
                    const entry = getEntryForSlot(day, mealType);
                    return (
                      <div
                        key={mealType}
                        className="border rounded-lg p-2 min-h-[100px] hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedSlot({ date: day, mealType })}
                      >
                        <div className="text-xs font-semibold text-muted-foreground mb-1 capitalize">
                          {mealType}
                        </div>
                        {entry?.recipe ? (
                          <div className="space-y-1">
                            {entry.recipe.recipeImageUrl && (
                              <div className="relative w-full aspect-video bg-muted rounded overflow-hidden">
                                <Image
                                  src={entry.recipe.recipeImageUrl}
                                  alt={entry.recipe.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <p className="text-xs font-medium line-clamp-2">
                              {entry.recipe.name}
                            </p>
                            {entry.recipe.calories && (
                              <p className="text-xs text-muted-foreground">
                                {entry.recipe.calories} cal
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-16 text-muted-foreground">
                            <Plus className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Recipe Selection Dialog */}
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Assign Recipe to {selectedSlot?.mealType && selectedSlot.mealType.charAt(0).toUpperCase() + selectedSlot.mealType.slice(1)}
            </DialogTitle>
            <DialogDescription>
              {selectedSlot && format(selectedSlot.date, 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {recipes.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground mb-4">No recipes available</p>
                <Button onClick={() => router.push('/generate/new')}>
                  Generate Your First Recipe
                </Button>
              </div>
            ) : (
              recipes.map(recipe => (
                <Card
                  key={recipe.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => {
                    if (selectedSlot) {
                      assignRecipeToSlot(selectedSlot.date, selectedSlot.mealType, recipe.id);
                      setSelectedSlot(null);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    {recipe.recipeImageUrl && (
                      <div className="relative w-full aspect-video bg-muted rounded overflow-hidden mb-2">
                        <Image
                          src={recipe.recipeImageUrl}
                          alt={recipe.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h4 className="font-semibold text-sm mb-1">{recipe.name}</h4>
                    {recipe.calories && (
                      <p className="text-xs text-muted-foreground">
                        {recipe.calories} calories
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
