import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Camera, ChefHat, Dog, Loader2, RefreshCw, Shield, Sparkles, Upload, Scale, DollarSign, ShoppingCart } from "lucide-react";
import { useCallback, useState, useRef } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { DogProfile } from "../../../drizzle/schema";

// Average ingredient prices (USD per unit)
const INGREDIENT_PRICES: Record<string, { pricePerUnit: number; unit: string }> = {
  // Proteins
  'ground beef': { pricePerUnit: 5.99, unit: 'pound' },
  'beef': { pricePerUnit: 5.99, unit: 'pound' },
  'chicken': { pricePerUnit: 3.99, unit: 'pound' },
  'chicken breast': { pricePerUnit: 4.99, unit: 'pound' },
  'salmon': { pricePerUnit: 9.99, unit: 'pound' },
  'fish': { pricePerUnit: 7.99, unit: 'pound' },
  'turkey': { pricePerUnit: 4.49, unit: 'pound' },
  'lamb': { pricePerUnit: 8.99, unit: 'pound' },
  'eggs': { pricePerUnit: 0.30, unit: 'each' },
  // Vegetables
  'sweet potato': { pricePerUnit: 1.29, unit: 'pound' },
  'green beans': { pricePerUnit: 2.49, unit: 'pound' },
  'carrots': { pricePerUnit: 1.49, unit: 'pound' },
  'spinach': { pricePerUnit: 3.99, unit: 'pound' },
  'pumpkin': { pricePerUnit: 2.99, unit: 'can' },
  'peas': { pricePerUnit: 1.99, unit: 'pound' },
  'broccoli': { pricePerUnit: 2.49, unit: 'pound' },
  'zucchini': { pricePerUnit: 1.79, unit: 'pound' },
  // Carbs
  'brown rice': { pricePerUnit: 2.99, unit: 'pound' },
  'rice': { pricePerUnit: 2.49, unit: 'pound' },
  'oatmeal': { pricePerUnit: 3.99, unit: 'pound' },
  'quinoa': { pricePerUnit: 5.99, unit: 'pound' },
  'pasta': { pricePerUnit: 1.49, unit: 'pound' },
  // Fats & Oils
  'olive oil': { pricePerUnit: 0.50, unit: 'tablespoon' },
  'coconut oil': { pricePerUnit: 0.40, unit: 'tablespoon' },
  'fish oil': { pricePerUnit: 0.15, unit: 'capsule' },
  // Supplements
  'calcium': { pricePerUnit: 0.10, unit: 'dose' },
  'multivitamin': { pricePerUnit: 0.25, unit: 'dose' },
};

function calculateRecipeCost(ingredients: any[]): number {
  let totalCost = 0;
  
  for (const ing of ingredients) {
    const name = ing.name?.toLowerCase() || '';
    const amount = parseFloat(ing.amount) || 0;
    const unit = ing.unit?.toLowerCase() || '';
    
    // Find matching price
    let priceInfo = null;
    for (const [key, value] of Object.entries(INGREDIENT_PRICES)) {
      if (name.includes(key)) {
        priceInfo = value;
        break;
      }
    }
    
    if (priceInfo) {
      // Convert units and calculate cost
      let costMultiplier = amount;
      
      // Handle unit conversions
      if (unit === 'cup' || unit === 'cups') {
        // Approximate: 1 cup = 0.5 lbs for most ingredients
        if (priceInfo.unit === 'pound') {
          costMultiplier = amount * 0.5;
        }
      } else if (unit === 'tablespoon' || unit === 'tablespoons') {
        if (priceInfo.unit === 'tablespoon') {
          costMultiplier = amount;
        }
      } else if (unit === 'pound' || unit === 'pounds' || unit === 'lb' || unit === 'lbs') {
        costMultiplier = amount;
      } else if (unit === 'mg' || unit === 'dose') {
        costMultiplier = 1; // Per dose
      }
      
      totalCost += priceInfo.pricePerUnit * costMultiplier;
    } else {
      // Default estimate for unknown ingredients
      totalCost += 1.00;
    }
  }
  
  return totalCost;
}

export default function Generate() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preselectedDogId = params.get("dog");
  const [, navigate] = useLocation();
  
  const [selectedDogId, setSelectedDogId] = useState<string>(preselectedDogId || "");
  const [kibbleImage, setKibbleImage] = useState<string | null>(null);
  const [kibbleIngredients, setKibbleIngredients] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [batchMultiplier, setBatchMultiplier] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: dogs, isLoading: dogsLoading } = trpc.dogs.list.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const saveRecipe = trpc.recipes.create.useMutation({
    onSuccess: (recipe) => {
      toast.success("Recipe saved!");
      if (recipe) {
        navigate(`/recipe/${recipe.id}`);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setKibbleImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!kibbleImage) return;
    
    setIsAnalyzing(true);
    try {
      // Call the analyze endpoint
      const response = await fetch("/api/analyze-kibble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: kibbleImage })
      });
      
      if (!response.ok) throw new Error("Failed to analyze image");
      
      const data = await response.json();
      setKibbleIngredients(data.ingredients || "");
      toast.success("Ingredients extracted!");
    } catch (error) {
      toast.error("Failed to analyze image. Please enter ingredients manually.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [kibbleImage]);

  const generateRecipe = useCallback(async () => {
    if (!selectedDogId || !hasAcceptedDisclaimer) {
      toast.error("Please select a dog and accept the disclaimer");
      return;
    }
    
    const selectedDog = dogs?.find((d: DogProfile) => d.id === parseInt(selectedDogId));
    if (!selectedDog) {
      toast.error("Please select a dog");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dog: selectedDog,
          kibbleIngredients: kibbleIngredients || null
        })
      });
      
      if (!response.ok) throw new Error("Failed to generate recipe");
      
      const data = await response.json();
      setGeneratedRecipe(data);
      toast.success("Recipe generated!");
    } catch (error) {
      toast.error("Failed to generate recipe. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedDogId, dogs, kibbleIngredients, hasAcceptedDisclaimer]);

  const handleSaveRecipe = useCallback(() => {
    if (!generatedRecipe || !selectedDogId) return;
    
    saveRecipe.mutate({
      dogProfileId: parseInt(selectedDogId),
      name: generatedRecipe.name,
      description: generatedRecipe.description,
      ingredients: JSON.stringify(generatedRecipe.ingredients),
      instructions: JSON.stringify(generatedRecipe.instructions),
      nutrition: generatedRecipe.nutrition ? JSON.stringify(generatedRecipe.nutrition) : undefined,
      supplements: generatedRecipe.supplements ? JSON.stringify(generatedRecipe.supplements) : undefined,
      servingSize: generatedRecipe.servingSize,
      servingsPerDay: generatedRecipe.servingsPerDay,
      prepTimeMinutes: generatedRecipe.prepTimeMinutes,
      cookTimeMinutes: generatedRecipe.cookTimeMinutes,
      kibbleIngredients: kibbleIngredients || undefined
    });
  }, [generatedRecipe, selectedDogId, kibbleIngredients, saveRecipe]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ChefHat className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to generate recipes</h1>
        <p className="text-muted-foreground mb-6">Create personalized recipes for your furry friend.</p>
        <a href={getLoginUrl()}>
          <Button className="btn-doggo">Sign In</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Generate Recipe</h1>
              <p className="text-sm text-muted-foreground">Create a fresh homemade meal for your dog</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Disclaimer */}
          {!hasAcceptedDisclaimer && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Shield className="w-5 h-5" />
                  Important Veterinary Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-amber-700 text-sm">
                  Chef Doggo provides educational information based on veterinary nutrition science. 
                  The recipes generated are intended as general guidance and should not replace 
                  professional veterinary advice.
                </p>
                <ul className="text-amber-700 text-sm space-y-2 list-disc pl-5">
                  <li>Always consult with a licensed veterinarian before changing your dog's diet</li>
                  <li>Homemade diets require proper supplementation to be nutritionally complete</li>
                  <li>Transition to new foods gradually over 7-10 days</li>
                  <li>Monitor your dog for any adverse reactions</li>
                </ul>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="disclaimer"
                    className="w-4 h-4"
                    onChange={(e) => setHasAcceptedDisclaimer(e.target.checked)}
                  />
                  <label htmlFor="disclaimer" className="text-sm text-amber-800 font-medium">
                    I understand and will consult my veterinarian before making dietary changes
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {hasAcceptedDisclaimer && (
            <>
              {/* Step 1: Select Dog */}
              <Card className="card-doggo">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dog className="w-5 h-5 text-primary" />
                    Step 1: Select Your Dog
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dogsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : dogs && dogs.length > 0 ? (
                    <Select value={selectedDogId} onValueChange={setSelectedDogId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dog" />
                      </SelectTrigger>
                      <SelectContent>
                        {dogs.map((dog: DogProfile) => (
                          <SelectItem key={dog.id} value={dog.id.toString()}>
                            {dog.name} - {dog.breed || "Mixed"} ({dog.weightLbs} lbs)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">No dogs found. Add a dog profile first.</p>
                      <Link href="/my-dogs">
                        <Button variant="outline">Add Dog Profile</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Upload Kibble Label (Optional) */}
              <Card className="card-doggo">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-secondary" />
                    Step 2: Upload Kibble Label (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload a photo of your dog food's ingredient label to create a recipe that matches its nutritional profile.
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {kibbleImage ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img 
                          src={kibbleImage} 
                          alt="Kibble label" 
                          className="w-full max-h-64 object-contain rounded-lg border"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setKibbleImage(null);
                            setKibbleIngredients("");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      <Button 
                        onClick={analyzeImage} 
                        disabled={isAnalyzing}
                        className="w-full"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Extract Ingredients
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium">Click to upload or take a photo</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Or enter ingredients manually:
                    </label>
                    <Textarea
                      value={kibbleIngredients}
                      onChange={(e) => setKibbleIngredients(e.target.value)}
                      placeholder="e.g., Chicken, Brown Rice, Chicken Meal, Barley, Oatmeal..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Generate */}
              <Card className="card-doggo">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-accent" />
                    Step 3: Generate Recipe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={generateRecipe}
                    disabled={!selectedDogId || isGenerating}
                    className="w-full btn-doggo"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Cooking up something special...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Fresh Recipe
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Recipe */}
              {generatedRecipe && (
                <Card className="card-doggo border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{generatedRecipe.name}</CardTitle>
                        <p className="text-muted-foreground">{generatedRecipe.description}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={generateRecipe}
                        disabled={isGenerating}
                      >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Batch Scaling */}
                    <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-secondary flex items-center gap-2">
                          <Scale className="w-4 h-4" />
                          Batch Size
                        </h3>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((mult) => (
                            <Button
                              key={mult}
                              variant={batchMultiplier === mult ? "default" : "outline"}
                              size="sm"
                              onClick={() => setBatchMultiplier(mult)}
                              className={batchMultiplier === mult ? "bg-secondary hover:bg-secondary/90" : ""}
                            >
                              {mult}x
                            </Button>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {batchMultiplier === 1 
                          ? "Single batch - enough for 1 day"
                          : `${batchMultiplier}x batch - enough for ${batchMultiplier * (generatedRecipe.servingInfo?.daysThisRecipeLasts || 1)} days of meals`
                        }
                      </p>
                    </div>

                    {/* Serving Info */}
                    {generatedRecipe.servingInfo && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <h3 className="font-bold text-primary mb-2">Serving Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                          <div>
                            <p className="font-bold text-xl text-primary">{(generatedRecipe.servingInfo.totalCups * batchMultiplier).toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">total cups</p>
                          </div>
                          <div>
                            <p className="font-bold text-xl text-secondary">{generatedRecipe.servingInfo.cupsPerMeal}</p>
                            <p className="text-xs text-muted-foreground">cups/meal</p>
                          </div>
                          <div>
                            <p className="font-bold text-xl text-accent">{generatedRecipe.servingInfo.mealsPerDay}</p>
                            <p className="text-xs text-muted-foreground">meals/day</p>
                          </div>
                          <div>
                            <p className="font-bold text-xl">{(generatedRecipe.servingInfo.daysThisRecipeLasts || 1) * batchMultiplier}</p>
                            <p className="text-xs text-muted-foreground">days batch</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cost Estimation */}
                    {generatedRecipe.ingredients && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Estimated Cost
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
                          <div>
                            <p className="font-bold text-xl text-green-700">
                              ${(calculateRecipeCost(generatedRecipe.ingredients) * batchMultiplier).toFixed(2)}
                            </p>
                            <p className="text-xs text-green-600">total batch</p>
                          </div>
                          <div>
                            <p className="font-bold text-xl text-green-700">
                              ${(calculateRecipeCost(generatedRecipe.ingredients) / (generatedRecipe.servingInfo?.mealsPerDay || 2)).toFixed(2)}
                            </p>
                            <p className="text-xs text-green-600">per meal</p>
                          </div>
                          <div>
                            <p className="font-bold text-xl text-green-700">
                              ${calculateRecipeCost(generatedRecipe.ingredients).toFixed(2)}
                            </p>
                            <p className="text-xs text-green-600">per day</p>
                          </div>
                        </div>
                        <p className="text-xs text-green-600 mt-2 text-center">
                          *Estimates based on average US grocery prices
                        </p>
                      </div>
                    )}

                    {/* Nutrition Summary */}
                    {generatedRecipe.nutrition && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                        <div className="bg-muted rounded-lg p-3">
                          <p className="font-bold text-lg text-primary">{generatedRecipe.nutrition.totalCalories || generatedRecipe.nutrition.caloriesPerServing}</p>
                          <p className="text-xs text-muted-foreground">total calories</p>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <p className="font-bold text-lg text-secondary">{generatedRecipe.nutrition.proteinGrams || generatedRecipe.nutrition.protein}g</p>
                          <p className="text-xs text-muted-foreground">protein</p>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <p className="font-bold text-lg text-accent">{generatedRecipe.nutrition.fatGrams || generatedRecipe.nutrition.fat}g</p>
                          <p className="text-xs text-muted-foreground">fat</p>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <p className="font-bold text-lg">{generatedRecipe.nutrition.carbGrams || generatedRecipe.nutrition.carbohydrates}g</p>
                          <p className="text-xs text-muted-foreground">carbs</p>
                        </div>
                      </div>
                    )}

                    {/* Ingredients */}
                    <div>
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        Ingredients
                        {batchMultiplier > 1 && (
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                            {batchMultiplier}x scaled
                          </span>
                        )}
                      </h3>
                      <ul className="space-y-2">
                        {generatedRecipe.ingredients?.map((ing: any, i: number) => {
                          const scaledAmount = parseFloat(ing.amount) * batchMultiplier;
                          const displayAmount = scaledAmount % 1 === 0 ? scaledAmount : scaledAmount.toFixed(2);
                          return (
                            <li key={i} className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  ing.category === 'protein' ? 'bg-primary' :
                                  ing.category === 'vegetable' ? 'bg-secondary' :
                                  ing.category === 'carb' ? 'bg-accent' :
                                  ing.category === 'fat' ? 'bg-yellow-500' :
                                  'bg-muted-foreground'
                                }`} />
                                <span>{displayAmount} {ing.unit} {ing.name}</span>
                              </div>
                              {ing.volumeCups && (
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                  {(parseFloat(ing.volumeCups) * batchMultiplier).toFixed(1)} cups
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      {generatedRecipe.totalVolumeCups && (
                        <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                          <strong>Total Volume:</strong> {(parseFloat(generatedRecipe.totalVolumeCups) * batchMultiplier).toFixed(1)} cups
                        </p>
                      )}
                    </div>

                    {/* Instructions */}
                    <div>
                      <h3 className="font-bold mb-3">Instructions</h3>
                      <ol className="space-y-3">
                        {generatedRecipe.instructions?.map((step: any) => (
                          <li key={step.step} className="flex gap-3">
                            <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                              {step.step}
                            </span>
                            <span>{step.instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Supplements */}
                    {generatedRecipe.supplements && generatedRecipe.supplements.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Required Supplements
                        </h3>
                        <ul className="space-y-2">
                          {generatedRecipe.supplements.map((sup: any, i: number) => (
                            <li key={i} className="text-amber-700">
                              <span className="font-medium">{sup.name}</span> - {sup.amount}
                              <p className="text-sm text-amber-600">{sup.reason}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="flex gap-4">
                      <Button 
                        onClick={handleSaveRecipe}
                        disabled={saveRecipe.isPending}
                        className="flex-1 btn-doggo"
                      >
                        {saveRecipe.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Save Recipe
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={generateRecipe}
                        disabled={isGenerating}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Another
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
