import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ChefHat, Heart, Loader2, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Recipes() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const { data: recipes, isLoading, refetch } = trpc.recipes.list.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const toggleFavorite = trpc.recipes.toggleFavorite.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const deleteRecipe = trpc.recipes.delete.useMutation({
    onSuccess: () => {
      toast.success("Recipe deleted");
      refetch();
    }
  });

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
        <h1 className="text-2xl font-bold mb-2">Sign in to view recipes</h1>
        <p className="text-muted-foreground mb-6">Save and manage your generated recipes.</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">My Recipes</h1>
                <p className="text-sm text-muted-foreground">Your saved homemade dog food recipes</p>
              </div>
            </div>
            
            <Link href="/generate">
              <Button className="btn-doggo">
                <Plus className="w-4 h-4 mr-2" />
                New Recipe
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => {
              const nutrition = recipe.nutrition ? JSON.parse(recipe.nutrition) : null;
              
              return (
                <Card key={recipe.id} className="card-doggo">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{recipe.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleFavorite.mutate({ id: recipe.id })}
                        >
                          <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm("Delete this recipe?")) {
                              deleteRecipe.mutate({ id: recipe.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {nutrition && (
                      <div className="grid grid-cols-4 gap-1 text-center text-xs mb-4">
                        <div className="bg-muted rounded p-2">
                          <p className="font-bold">{nutrition.caloriesPerServing}</p>
                          <p className="text-muted-foreground">cal</p>
                        </div>
                        <div className="bg-muted rounded p-2">
                          <p className="font-bold">{nutrition.protein}g</p>
                          <p className="text-muted-foreground">protein</p>
                        </div>
                        <div className="bg-muted rounded p-2">
                          <p className="font-bold">{nutrition.fat}g</p>
                          <p className="text-muted-foreground">fat</p>
                        </div>
                        <div className="bg-muted rounded p-2">
                          <p className="font-bold">{nutrition.carbohydrates}g</p>
                          <p className="text-muted-foreground">carbs</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {recipe.prepTimeMinutes && (
                        <span>Prep: {recipe.prepTimeMinutes}min</span>
                      )}
                      {recipe.cookTimeMinutes && (
                        <span>Cook: {recipe.cookTimeMinutes}min</span>
                      )}
                    </div>
                    
                    <Link href={`/recipe/${recipe.id}`}>
                      <Button className="w-full" variant="outline">
                        View Recipe
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No recipes yet</h2>
            <p className="text-muted-foreground mb-6">Generate your first recipe for your furry friend!</p>
            <Link href="/generate">
              <Button className="btn-doggo">
                <Plus className="w-4 h-4 mr-2" />
                Generate Recipe
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
