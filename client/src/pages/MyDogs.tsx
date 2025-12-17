import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Dog, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const COMMON_ALLERGIES = [
  "Beef", "Dairy", "Chicken", "Wheat", "Lamb", "Soy", "Corn", "Egg", "Pork", "Fish"
];

const DIETARY_RESTRICTIONS = [
  "Grain-free", "Low-fat", "High-protein", "Kidney-friendly", "Weight management", "Joint support"
];

const BREEDS = [
  "Mixed Breed", "Labrador Retriever", "German Shepherd", "Golden Retriever", "French Bulldog",
  "Bulldog", "Poodle", "Beagle", "Rottweiler", "Yorkshire Terrier", "Boxer", "Dachshund",
  "Siberian Husky", "Great Dane", "Doberman", "Australian Shepherd", "Cavalier King Charles",
  "Shih Tzu", "Boston Terrier", "Pomeranian", "Chihuahua", "Border Collie", "Corgi",
  "Australian Cattle Dog", "Other"
];

function calculateSizeCategory(weightLbs: number): "toy" | "small" | "medium" | "large" | "giant" {
  if (weightLbs < 10) return "toy";
  if (weightLbs < 25) return "small";
  if (weightLbs < 50) return "medium";
  if (weightLbs < 100) return "large";
  return "giant";
}

function calculateLifeStage(ageYears: number, sizeCategory: string): "puppy" | "adult" | "senior" {
  if (ageYears < 1) return "puppy";
  if (sizeCategory === "giant" && ageYears >= 6) return "senior";
  if ((sizeCategory === "large") && ageYears >= 7) return "senior";
  if (ageYears >= 8) return "senior";
  return "adult";
}

function calculateDailyCalories(weightLbs: number, sizeCategory: string, activityLevel: string): number {
  let baseCalories: number;
  switch (sizeCategory) {
    case "toy":
    case "small":
      baseCalories = weightLbs * 40;
      break;
    case "medium":
      baseCalories = weightLbs * 30;
      break;
    case "large":
      baseCalories = weightLbs * 25;
      break;
    case "giant":
      baseCalories = weightLbs * 22.5;
      break;
    default:
      baseCalories = weightLbs * 30;
  }
  
  switch (activityLevel) {
    case "sedentary":
      return Math.round(baseCalories * 0.8);
    case "active":
      return Math.round(baseCalories * 1.2);
    case "very_active":
      return Math.round(baseCalories * 1.4);
    default:
      return Math.round(baseCalories);
  }
}

export default function MyDogs() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    weightLbs: "",
    ageYears: "",
    ageMonths: "0",
    activityLevel: "moderate",
    allergies: [] as string[],
    dietaryRestrictions: [] as string[],
    healthConditions: ""
  });

  const { data: dogs, isLoading, refetch } = trpc.dogs.list.useQuery(undefined, {
    enabled: isAuthenticated
  });
  
  const createDog = trpc.dogs.create.useMutation({
    onSuccess: () => {
      toast.success("Dog profile created!");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const updateDog = trpc.dogs.update.useMutation({
    onSuccess: () => {
      toast.success("Dog profile updated!");
      setIsDialogOpen(false);
      setEditingDog(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  
  const deleteDog = trpc.dogs.delete.useMutation({
    onSuccess: () => {
      toast.success("Dog profile deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      breed: "",
      weightLbs: "",
      ageYears: "",
      ageMonths: "0",
      activityLevel: "moderate",
      allergies: [],
      dietaryRestrictions: [],
      healthConditions: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const weightLbs = parseInt(formData.weightLbs);
    const ageYears = parseInt(formData.ageYears);
    const ageMonths = parseInt(formData.ageMonths);
    
    if (!formData.name || !weightLbs || isNaN(ageYears)) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const sizeCategory = calculateSizeCategory(weightLbs);
    const lifeStage = calculateLifeStage(ageYears, sizeCategory);
    const dailyCalories = calculateDailyCalories(weightLbs, sizeCategory, formData.activityLevel);
    
    const dogData = {
      name: formData.name,
      breed: formData.breed || null,
      weightLbs,
      ageYears,
      ageMonths,
      sizeCategory,
      lifeStage,
      activityLevel: formData.activityLevel as "sedentary" | "moderate" | "active" | "very_active",
      allergies: formData.allergies,
      dietaryRestrictions: formData.dietaryRestrictions,
      healthConditions: formData.healthConditions ? formData.healthConditions.split(",").map(s => s.trim()) : [],
      dailyCalories
    };
    
    if (editingDog) {
      updateDog.mutate({ id: editingDog.id, ...dogData });
    } else {
      createDog.mutate(dogData);
    }
  };

  const handleEdit = (dog: any) => {
    setEditingDog(dog);
    setFormData({
      name: dog.name,
      breed: dog.breed || "",
      weightLbs: dog.weightLbs.toString(),
      ageYears: dog.ageYears.toString(),
      ageMonths: (dog.ageMonths || 0).toString(),
      activityLevel: dog.activityLevel,
      allergies: dog.allergies ? JSON.parse(dog.allergies) : [],
      dietaryRestrictions: dog.dietaryRestrictions ? JSON.parse(dog.dietaryRestrictions) : [],
      healthConditions: dog.healthConditions ? JSON.parse(dog.healthConditions).join(", ") : ""
    });
    setIsDialogOpen(true);
  };

  const toggleAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const toggleRestriction = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

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
        <Dog className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to manage your dogs</h1>
        <p className="text-muted-foreground mb-6">Create profiles for your furry friends to get personalized recipes.</p>
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
                <h1 className="text-2xl font-bold">My Dogs</h1>
                <p className="text-sm text-muted-foreground">Manage your dog profiles</p>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingDog(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="btn-doggo">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Dog
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingDog ? "Edit Dog Profile" : "Add New Dog"}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">Dog's Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Max"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="breed">Breed</Label>
                      <Select
                        value={formData.breed}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, breed: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select breed" />
                        </SelectTrigger>
                        <SelectContent>
                          {BREEDS.map(breed => (
                            <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="weight">Weight (lbs) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weightLbs}
                        onChange={(e) => setFormData(prev => ({ ...prev, weightLbs: e.target.value }))}
                        placeholder="e.g., 50"
                        min="1"
                        max="300"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="age">Age (years) *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.ageYears}
                        onChange={(e) => setFormData(prev => ({ ...prev, ageYears: e.target.value }))}
                        placeholder="e.g., 3"
                        min="0"
                        max="25"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="activity">Activity Level</Label>
                      <Select
                        value={formData.activityLevel}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (mostly resting)</SelectItem>
                          <SelectItem value="moderate">Moderate (regular walks)</SelectItem>
                          <SelectItem value="active">Active (daily exercise)</SelectItem>
                          <SelectItem value="very_active">Very Active (working dog)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Known Allergies</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {COMMON_ALLERGIES.map(allergy => (
                        <div key={allergy} className="flex items-center gap-2">
                          <Checkbox
                            id={`allergy-${allergy}`}
                            checked={formData.allergies.includes(allergy)}
                            onCheckedChange={() => toggleAllergy(allergy)}
                          />
                          <label htmlFor={`allergy-${allergy}`} className="text-sm cursor-pointer">
                            {allergy}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Dietary Restrictions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {DIETARY_RESTRICTIONS.map(restriction => (
                        <div key={restriction} className="flex items-center gap-2">
                          <Checkbox
                            id={`restriction-${restriction}`}
                            checked={formData.dietaryRestrictions.includes(restriction)}
                            onCheckedChange={() => toggleRestriction(restriction)}
                          />
                          <label htmlFor={`restriction-${restriction}`} className="text-sm cursor-pointer">
                            {restriction}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="health">Health Conditions (comma-separated)</Label>
                    <Input
                      id="health"
                      value={formData.healthConditions}
                      onChange={(e) => setFormData(prev => ({ ...prev, healthConditions: e.target.value }))}
                      placeholder="e.g., Arthritis, Diabetes"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full btn-doggo"
                    disabled={createDog.isPending || updateDog.isPending}
                  >
                    {(createDog.isPending || updateDog.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingDog ? "Update Dog" : "Add Dog"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : dogs && dogs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => {
              const allergies = dog.allergies ? JSON.parse(dog.allergies) : [];
              const restrictions = dog.dietaryRestrictions ? JSON.parse(dog.dietaryRestrictions) : [];
              
              return (
                <Card key={dog.id} className="card-doggo">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Dog className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{dog.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{dog.breed || "Mixed Breed"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(dog)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this dog profile?")) {
                              deleteDog.mutate({ id: dog.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                      <div className="bg-muted rounded-lg p-2">
                        <p className="font-bold">{dog.weightLbs}</p>
                        <p className="text-muted-foreground text-xs">lbs</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <p className="font-bold">{dog.ageYears}</p>
                        <p className="text-muted-foreground text-xs">years</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <p className="font-bold">{dog.dailyCalories}</p>
                        <p className="text-muted-foreground text-xs">cal/day</p>
                      </div>
                    </div>
                    
                    {allergies.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Allergies:</p>
                        <div className="flex flex-wrap gap-1">
                          {allergies.map((a: string) => (
                            <span key={a} className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {restrictions.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Diet:</p>
                        <div className="flex flex-wrap gap-1">
                          {restrictions.map((r: string) => (
                            <span key={r} className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Link href={`/generate?dog=${dog.id}`}>
                      <Button className="w-full mt-4" variant="outline">
                        Generate Recipe
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Dog className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No dogs yet</h2>
            <p className="text-muted-foreground mb-6">Add your first dog to get personalized recipes!</p>
            <Button className="btn-doggo" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Dog
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
