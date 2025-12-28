'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, AlertTriangle, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  searchToxicIngredients,
  filterByToxicityLevel,
  filterByCategory,
  getAllCategories,
  type ToxicIngredient,
} from '@/lib/toxic-ingredients-database';

export default function SafetyDatabasePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToxicity, setSelectedToxicity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIngredient, setSelectedIngredient] = useState<ToxicIngredient | null>(null);

  const categories = getAllCategories();

  const filteredIngredients = useMemo(() => {
    let results = searchToxicIngredients(searchQuery);

    if (selectedToxicity !== 'all') {
      results = results.filter(ing => ing.toxicityLevel === selectedToxicity);
    }

    if (selectedCategory !== 'all') {
      results = results.filter(ing => ing.category === selectedCategory);
    }

    return results.sort((a, b) => {
      // Sort by toxicity level first
      const toxicityOrder = { 'Critical': 0, 'High': 1, 'Moderate': 2 };
      const orderA = toxicityOrder[a.toxicityLevel];
      const orderB = toxicityOrder[b.toxicityLevel];
      if (orderA !== orderB) return orderA - orderB;
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, selectedToxicity, selectedCategory]);

  const getToxicityColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-500';
      case 'High':
        return 'bg-orange-500';
      case 'Moderate':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getToxicityBadgeColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedToxicity('all');
    setSelectedCategory('all');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <h1 className="text-4xl font-bold text-primary">Ingredient Safety Database</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive guide to toxic and dangerous ingredients for dogs
        </p>
      </div>

      {/* Emergency Alert */}
      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Emergency Information</AlertTitle>
        <AlertDescription className="text-red-700">
          If your dog has ingested a toxic ingredient, <strong>call your veterinarian or Pet Poison Helpline (855-764-7661) immediately</strong>.
          Time is critical for many poisonings.
        </AlertDescription>
      </Alert>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ingredient name, alias, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Toxicity Level</label>
              <Select value={selectedToxicity} onValueChange={setSelectedToxicity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredIngredients.length}</strong> ingredients
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIngredients.map((ingredient) => (
          <Card
            key={ingredient.name}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedIngredient(ingredient)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                <Badge className={getToxicityBadgeColor(ingredient.toxicityLevel)}>
                  {ingredient.toxicityLevel}
                </Badge>
              </div>
              <CardDescription>{ingredient.category}</CardDescription>
            </CardHeader>
            <CardContent>
              {ingredient.aliases.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Also known as:</p>
                  <div className="flex flex-wrap gap-1">
                    {ingredient.aliases.slice(0, 3).map((alias) => (
                      <Badge key={alias} variant="outline" className="text-xs">
                        {alias}
                      </Badge>
                    ))}
                    {ingredient.aliases.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{ingredient.aliases.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-semibold text-muted-foreground">Onset Time:</p>
                  <p>{ingredient.onsetTime}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Primary Symptoms:</p>
                  <ul className="list-disc list-inside text-xs">
                    {ingredient.symptoms.slice(0, 3).map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                    {ingredient.symptoms.length > 3 && (
                      <li className="text-muted-foreground">+{ingredient.symptoms.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center italic">
                Click card for full details
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ingredients found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedIngredient && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIngredient(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl">{selectedIngredient.name}</CardTitle>
                    <Badge className={getToxicityBadgeColor(selectedIngredient.toxicityLevel)}>
                      {selectedIngredient.toxicityLevel}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{selectedIngredient.category}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedIngredient(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Aliases */}
              {selectedIngredient.aliases.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Also Known As:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIngredient.aliases.map((alias) => (
                      <Badge key={alias} variant="outline">
                        {alias}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Onset Time */}
              <div>
                <h4 className="font-semibold mb-2">Onset Time:</h4>
                <p className="text-muted-foreground">{selectedIngredient.onsetTime}</p>
              </div>

              {/* Lethal Dose */}
              {selectedIngredient.lethalDose && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Lethal/Toxic Dose:</h4>
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {selectedIngredient.lethalDose}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Symptoms */}
              <div>
                <h4 className="font-semibold mb-2">Symptoms:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedIngredient.symptoms.map((symptom, idx) => (
                    <li key={idx} className="text-muted-foreground">{symptom}</li>
                  ))}
                </ul>
              </div>

              {/* Treatment */}
              <div>
                <h4 className="font-semibold mb-2">Treatment:</h4>
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-700">
                    {selectedIngredient.treatment}
                  </AlertDescription>
                </Alert>
              </div>

              {/* Notes */}
              {selectedIngredient.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Important Notes:</h4>
                  <p className="text-muted-foreground">{selectedIngredient.notes}</p>
                </div>
              )}

              {/* Emergency Contact */}
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Emergency Contacts</AlertTitle>
                <AlertDescription className="text-red-700 space-y-1">
                  <p><strong>Pet Poison Helpline:</strong> 855-764-7661 (24/7)</p>
                  <p><strong>ASPCA Poison Control:</strong> 888-426-4435 (24/7)</p>
                  <p className="text-xs mt-2">Contact your veterinarian immediately if ingestion is suspected</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
