'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Plus, TrendingUp, Heart, Activity, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Image from 'next/image';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  weight: number;
}

interface Recipe {
  id: string;
  name: string;
  recipeImageUrl?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

interface NutritionLog {
  id: string;
  date: string;
  dogProfile: DogProfile;
  recipe?: Recipe;
  customEntry?: string;
  portionSize: number;
  treats?: string;
  waterIntake?: number;
  notes?: string;
}

interface HealthObservation {
  id: string;
  date: string;
  dogProfile: DogProfile;
  energyLevel?: number;
  stoolQuality?: number;
  coatCondition?: string;
  symptoms: string[];
  weight?: number;
  notes?: string;
}

export default function NutritionTrackerPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedDog, setSelectedDog] = useState<string>('');
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [healthObservations, setHealthObservations] = useState<HealthObservation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Log form state
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [customEntry, setCustomEntry] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [treats, setTreats] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [logNotes, setLogNotes] = useState('');

  // Health form state
  const [showHealthDialog, setShowHealthDialog] = useState(false);
  const [healthDate, setHealthDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [energyLevel, setEnergyLevel] = useState('3');
  const [stoolQuality, setStoolQuality] = useState('3');
  const [coatCondition, setCoatCondition] = useState('good');
  const [weight, setWeight] = useState('');
  const [healthNotes, setHealthNotes] = useState('');

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
      fetchNutritionLogs(selectedDog);
      fetchHealthObservations(selectedDog);
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

  const fetchNutritionLogs = async (dogId: string) => {
    try {
      const res = await fetch(`/api/nutrition-logs?dogProfileId=${dogId}&limit=30`);
      const data = await res.json();
      setNutritionLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching nutrition logs:', error);
      toast.error('Failed to load nutrition logs');
    }
  };

  const fetchHealthObservations = async (dogId: string) => {
    try {
      const res = await fetch(`/api/health-observations?dogProfileId=${dogId}&limit=30`);
      const data = await res.json();
      setHealthObservations(data.observations || []);
    } catch (error) {
      console.error('Error fetching health observations:', error);
      toast.error('Failed to load health observations');
    }
  };

  const submitNutritionLog = async () => {
    if (!selectedDog || !portionSize) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/nutrition-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogProfileId: selectedDog,
          date: new Date(logDate).toISOString(),
          recipeId: selectedRecipe || undefined,
          customEntry: customEntry || undefined,
          portionSize: parseFloat(portionSize),
          treats: treats || undefined,
          waterIntake: waterIntake ? parseFloat(waterIntake) : undefined,
          notes: logNotes || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Nutrition log added!');
        fetchNutritionLogs(selectedDog);
        setShowLogDialog(false);
        resetLogForm();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add nutrition log');
      }
    } catch (error) {
      console.error('Error adding nutrition log:', error);
      toast.error('Failed to add nutrition log');
    }
  };

  const submitHealthObservation = async () => {
    if (!selectedDog) {
      toast.error('Please select a dog');
      return;
    }

    try {
      const res = await fetch('/api/health-observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogProfileId: selectedDog,
          date: new Date(healthDate).toISOString(),
          energyLevel: parseInt(energyLevel),
          stoolQuality: parseInt(stoolQuality),
          coatCondition,
          weight: weight ? parseFloat(weight) : undefined,
          symptoms: [],
          notes: healthNotes || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Health observation added!');
        fetchHealthObservations(selectedDog);
        setShowHealthDialog(false);
        resetHealthForm();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add health observation');
      }
    } catch (error) {
      console.error('Error adding health observation:', error);
      toast.error('Failed to add health observation');
    }
  };

  const resetLogForm = () => {
    setLogDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedRecipe('');
    setCustomEntry('');
    setPortionSize('');
    setTreats('');
    setWaterIntake('');
    setLogNotes('');
  };

  const resetHealthForm = () => {
    setHealthDate(format(new Date(), 'yyyy-MM-dd'));
    setEnergyLevel('3');
    setStoolQuality('3');
    setCoatCondition('good');
    setWeight('');
    setHealthNotes('');
  };

  // Calculate insights
  const getAverageEnergyLevel = () => {
    if (healthObservations.length === 0) return 0;
    const total = healthObservations
      .filter(o => o.energyLevel)
      .reduce((sum, o) => sum + (o.energyLevel || 0), 0);
    return (total / healthObservations.filter(o => o.energyLevel).length).toFixed(1);
  };

  const getAverageWaterIntake = () => {
    if (nutritionLogs.length === 0) return 0;
    const total = nutritionLogs
      .filter(l => l.waterIntake)
      .reduce((sum, l) => sum + (l.waterIntake || 0), 0);
    return (total / nutritionLogs.filter(l => l.waterIntake).length).toFixed(1);
  };

  const getWeightTrend = () => {
    const recentWeights = healthObservations
      .filter(o => o.weight)
      .slice(0, 5)
      .map(o => o.weight || 0);
    
    if (recentWeights.length < 2) return 'stable';
    
    const firstWeight = recentWeights[recentWeights.length - 1];
    const lastWeight = recentWeights[0];
    const diff = lastWeight - firstWeight;
    
    if (diff > 1) return 'increasing';
    if (diff < -1) return 'decreasing';
    return 'stable';
  };

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
              You need to add a dog profile before tracking nutrition.
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

  const selectedDogProfile = dogs.find(d => d.id === selectedDog);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary">Nutrition Tracker</h1>
        <p className="text-muted-foreground">Track feeding, health, and progress over time</p>
      </div>

      {/* Dog Selection */}
      <div className="mb-6 max-w-xs">
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

      {/* Insights Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Energy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageEnergyLevel()}/5</div>
            <p className="text-xs text-muted-foreground">
              Based on {healthObservations.filter(o => o.energyLevel).length} observations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageWaterIntake()} cups</div>
            <p className="text-xs text-muted-foreground">
              Daily average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{getWeightTrend()}</div>
            <p className="text-xs text-muted-foreground">
              Last 5 measurements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Feeding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Feeding</DialogTitle>
              <DialogDescription>
                Record what {selectedDogProfile?.name} ate today
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="log-date">Date</Label>
                <Input
                  id="log-date"
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="recipe-select">Recipe (Optional)</Label>
                <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                  <SelectTrigger id="recipe-select">
                    <SelectValue placeholder="Select a recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map(recipe => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="custom-entry">Custom Entry (Optional)</Label>
                <Input
                  id="custom-entry"
                  placeholder="e.g., Commercial kibble"
                  value={customEntry}
                  onChange={(e) => setCustomEntry(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="portion-size">Portion Size (cups) *</Label>
                <Input
                  id="portion-size"
                  type="number"
                  step="0.25"
                  placeholder="e.g., 2.5"
                  value={portionSize}
                  onChange={(e) => setPortionSize(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="treats">Treats (Optional)</Label>
                <Input
                  id="treats"
                  placeholder="e.g., 3 training treats"
                  value={treats}
                  onChange={(e) => setTreats(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="water-intake">Water Intake (cups)</Label>
                <Input
                  id="water-intake"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 4"
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="log-notes">Notes</Label>
                <Textarea
                  id="log-notes"
                  placeholder="Any additional notes..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                />
              </div>
              <Button onClick={submitNutritionLog} className="w-full">
                Save Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showHealthDialog} onOpenChange={setShowHealthDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Heart className="h-4 w-4 mr-2" />
              Log Health
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Health Observation</DialogTitle>
              <DialogDescription>
                Track {selectedDogProfile?.name}'s health and wellness
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="health-date">Date</Label>
                <Input
                  id="health-date"
                  type="date"
                  value={healthDate}
                  onChange={(e) => setHealthDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="energy-level">Energy Level (1-5)</Label>
                <Select value={energyLevel} onValueChange={setEnergyLevel}>
                  <SelectTrigger id="energy-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Low</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Normal</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stool-quality">Stool Quality (1-5)</Label>
                <Select value={stoolQuality} onValueChange={setStoolQuality}>
                  <SelectTrigger id="stool-quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Poor</SelectItem>
                    <SelectItem value="2">2 - Poor</SelectItem>
                    <SelectItem value="3">3 - Normal</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="coat-condition">Coat Condition</Label>
                <Select value={coatCondition} onValueChange={setCoatCondition}>
                  <SelectTrigger id="coat-condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 45.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="health-notes">Notes</Label>
                <Textarea
                  id="health-notes"
                  placeholder="Any symptoms or observations..."
                  value={healthNotes}
                  onChange={(e) => setHealthNotes(e.target.value)}
                />
              </div>
              <Button onClick={submitHealthObservation} className="w-full">
                Save Observation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for Logs and Health */}
      <Tabs defaultValue="nutrition" className="w-full">
        <TabsList>
          <TabsTrigger value="nutrition">Nutrition Logs ({nutritionLogs.length})</TabsTrigger>
          <TabsTrigger value="health">Health Observations ({healthObservations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="nutrition" className="space-y-4 mt-6">
          {nutritionLogs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No nutrition logs yet. Start tracking today!</p>
              </CardContent>
            </Card>
          ) : (
            nutritionLogs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {format(new Date(log.date), 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <span className="text-sm font-semibold text-primary">
                      {log.portionSize} cups
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {log.recipe && (
                    <div className="flex items-center gap-3">
                      {log.recipe.recipeImageUrl && (
                        <div className="relative w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={log.recipe.recipeImageUrl}
                            alt={log.recipe.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{log.recipe.name}</p>
                        {log.recipe.calories && (
                          <p className="text-sm text-muted-foreground">
                            {log.recipe.calories} calories per serving
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {log.customEntry && (
                    <p className="text-sm"><strong>Food:</strong> {log.customEntry}</p>
                  )}
                  {log.treats && (
                    <p className="text-sm"><strong>Treats:</strong> {log.treats}</p>
                  )}
                  {log.waterIntake && (
                    <p className="text-sm"><strong>Water:</strong> {log.waterIntake} cups</p>
                  )}
                  {log.notes && (
                    <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {log.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-4 mt-6">
          {healthObservations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No health observations yet. Start tracking today!</p>
              </CardContent>
            </Card>
          ) : (
            healthObservations.map((obs) => (
              <Card key={obs.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {format(new Date(obs.date), 'EEEE, MMMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {obs.energyLevel && (
                      <div>
                        <p className="text-sm font-semibold">Energy Level</p>
                        <p className="text-2xl font-bold">{obs.energyLevel}/5</p>
                      </div>
                    )}
                    {obs.stoolQuality && (
                      <div>
                        <p className="text-sm font-semibold">Stool Quality</p>
                        <p className="text-2xl font-bold">{obs.stoolQuality}/5</p>
                      </div>
                    )}
                    {obs.coatCondition && (
                      <div>
                        <p className="text-sm font-semibold">Coat Condition</p>
                        <p className="text-2xl font-bold capitalize">{obs.coatCondition}</p>
                      </div>
                    )}
                    {obs.weight && (
                      <div>
                        <p className="text-sm font-semibold">Weight</p>
                        <p className="text-2xl font-bold">{obs.weight} lbs</p>
                      </div>
                    )}
                  </div>
                  {obs.notes && (
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong>Notes:</strong> {obs.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}