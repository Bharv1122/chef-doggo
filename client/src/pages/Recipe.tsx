import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ChefHat, ExternalLink, Heart, Loader2, Printer, Shield, ShoppingCart } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

const SUPPLEMENT_LINKS = {
  "Calcium": "https://www.chewy.com/s?query=dog+calcium+supplement",
  "Multivitamin": "https://www.chewy.com/s?query=dog+multivitamin",
  "Omega-3": "https://www.chewy.com/s?query=dog+omega+3+fish+oil",
  "Fish Oil": "https://www.chewy.com/s?query=dog+fish+oil",
  "Vitamin E": "https://www.chewy.com/s?query=dog+vitamin+e",
  "Zinc": "https://www.chewy.com/s?query=dog+zinc+supplement",
};

export default function Recipe() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: recipe, isLoading } = trpc.recipes.get.useQuery(
    { id: parseInt(id || "0") },
    { enabled: isAuthenticated && !!id }
  );

  const toggleFavorite = trpc.recipes.toggleFavorite.useMutation({
    onSuccess: () => {
      toast.success(recipe?.isFavorite ? "Removed from favorites" : "Added to favorites");
    }
  });

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || isLoading) {
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
        <h1 className="text-2xl font-bold mb-2">Sign in to view recipes</h1>
        <a href={getLoginUrl()}>
          <Button className="btn-doggo">Sign In</Button>
        </a>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ChefHat className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Recipe not found</h1>
        <Link href="/recipes">
          <Button variant="outline">Back to Recipes</Button>
        </Link>
      </div>
    );
  }

  const ingredients = JSON.parse(recipe.ingredients);
  const instructions = JSON.parse(recipe.instructions);
  const nutrition = recipe.nutrition ? JSON.parse(recipe.nutrition) : null;
  const supplements = recipe.supplements ? JSON.parse(recipe.supplements) : [];

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Header */}
      <header className="border-b bg-card print:hidden">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/recipes">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{recipe.name}</h1>
                {recipe.description && (
                  <p className="text-sm text-muted-foreground">{recipe.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => toggleFavorite.mutate({ id: recipe.id })}
              >
                <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 print:py-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Print Header */}
          <div className="hidden print:block mb-8">
            <h1 className="text-3xl font-bold">{recipe.name}</h1>
            {recipe.description && <p className="text-gray-600">{recipe.description}</p>}
          </div>

          {/* Nutrition Summary */}
          {nutrition && (
            <Card className="card-doggo print:shadow-none print:border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Nutrition per Serving</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-muted rounded-lg p-4 print:bg-gray-100">
                    <p className="font-bold text-2xl text-primary">{nutrition.caloriesPerServing}</p>
                    <p className="text-sm text-muted-foreground">calories</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 print:bg-gray-100">
                    <p className="font-bold text-2xl text-secondary">{nutrition.protein}g</p>
                    <p className="text-sm text-muted-foreground">protein</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 print:bg-gray-100">
                    <p className="font-bold text-2xl text-accent">{nutrition.fat}g</p>
                    <p className="text-sm text-muted-foreground">fat</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 print:bg-gray-100">
                    <p className="font-bold text-2xl">{nutrition.carbohydrates}g</p>
                    <p className="text-sm text-muted-foreground">carbs</p>
                  </div>
                </div>
                
                {recipe.servingSize && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Serving size: {recipe.servingSize} 
                    {recipe.servingsPerDay && ` • ${recipe.servingsPerDay} servings per day`}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ingredients */}
          <Card className="card-doggo print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {["protein", "vegetable", "carb", "other"].map((category) => {
                  const categoryIngredients = ingredients.filter((i: any) => i.category === category);
                  if (categoryIngredients.length === 0) return null;
                  
                  const categoryLabels: Record<string, string> = {
                    protein: "🥩 Proteins",
                    vegetable: "🥬 Vegetables",
                    carb: "🍚 Carbohydrates",
                    other: "🧂 Other"
                  };
                  
                  return (
                    <div key={category}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        {categoryLabels[category]}
                      </h4>
                      <ul className="space-y-1">
                        {categoryIngredients.map((ing: any, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              category === 'protein' ? 'bg-primary' :
                              category === 'vegetable' ? 'bg-secondary' :
                              category === 'carb' ? 'bg-accent' :
                              'bg-muted-foreground'
                            }`} />
                            <span>{ing.amount} {ing.unit} {ing.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="card-doggo print:shadow-none print:border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Instructions</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {recipe.prepTimeMinutes && <span>Prep: {recipe.prepTimeMinutes}min</span>}
                  {recipe.prepTimeMinutes && recipe.cookTimeMinutes && <span> • </span>}
                  {recipe.cookTimeMinutes && <span>Cook: {recipe.cookTimeMinutes}min</span>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {instructions.map((step: any) => (
                  <li key={step.step} className="flex gap-4">
                    <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0 print:bg-gray-800 print:text-white">
                      {step.step}
                    </span>
                    <p className="pt-1">{step.instruction}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Supplements */}
          {supplements.length > 0 && (
            <Card className="border-amber-200 bg-amber-50 print:bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Shield className="w-5 h-5" />
                  Required Supplements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-amber-700">
                  Homemade diets require supplementation to be nutritionally complete. 
                  Add these supplements to each serving:
                </p>
                
                <div className="space-y-3">
                  {supplements.map((sup: any, i: number) => {
                    const link = Object.entries(SUPPLEMENT_LINKS).find(([key]) => 
                      sup.name.toLowerCase().includes(key.toLowerCase())
                    )?.[1];
                    
                    return (
                      <div key={i} className="bg-white rounded-lg p-4 border border-amber-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-amber-800">{sup.name}</p>
                            <p className="text-amber-700">{sup.amount}</p>
                            <p className="text-sm text-amber-600 mt-1">{sup.reason}</p>
                          </div>
                          {link && (
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="print:hidden"
                            >
                              <Button variant="outline" size="sm" className="text-amber-700 border-amber-300">
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Buy
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <p className="text-xs text-amber-600 italic print:hidden">
                  Affiliate disclosure: Links may earn us a commission at no extra cost to you.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Transition Guide */}
          <Card className="card-doggo print:shadow-none print:border">
            <CardHeader>
              <CardTitle>Transition Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Transition your dog to homemade food gradually over 7-10 days to avoid digestive upset:
              </p>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="bg-muted rounded-lg p-3">
                  <p className="font-bold">Days 1-2</p>
                  <p className="text-muted-foreground">25% new</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="font-bold">Days 3-4</p>
                  <p className="text-muted-foreground">50% new</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="font-bold">Days 5-6</p>
                  <p className="text-muted-foreground">75% new</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="font-bold">Day 7+</p>
                  <p className="text-muted-foreground">100% new</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Veterinary Disclaimer */}
          <div className="bg-muted rounded-lg p-4 text-center text-sm text-muted-foreground">
            <Shield className="w-5 h-5 mx-auto mb-2" />
            <p>
              Always consult your veterinarian before making changes to your dog's diet. 
              This recipe is for educational purposes only.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
