import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Dog, Plus, Trash2, Edit, Loader2, HelpCircle, Leaf, Flame, Droplets, Mountain, TreePine } from "lucide-react";
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

// TCVM Five Element Constitutions
const TCVM_CONSTITUTIONS = [
  { value: "fire", label: "Fire 🔥", icon: Flame, description: "Outgoing, loves attention, excitable, may have heart/anxiety issues" },
  { value: "earth", label: "Earth 🌍", icon: Mountain, description: "Loyal, nurturing, food-motivated, may have digestive/weight issues" },
  { value: "metal", label: "Metal ⚪", icon: Mountain, description: "Confident, aloof, rule-follower, may have skin/respiratory issues" },
  { value: "water", label: "Water 💧", icon: Droplets, description: "Fearful, cautious, introverted, may have kidney/bone issues" },
  { value: "wood", label: "Wood 🌲", icon: TreePine, description: "Assertive, athletic, competitive, may have tendon/eye issues" },
];

// Ayurvedic Doshas
const AYURVEDIC_DOSHAS = [
  { value: "vata", label: "Vata (Air/Space)", description: "Thin, nervous, dry skin, cold intolerant, irregular digestion" },
  { value: "pitta", label: "Pitta (Fire/Water)", description: "Medium build, hot-natured, strong digestion, prone to inflammation" },
  { value: "kapha", label: "Kapha (Earth/Water)", description: "Heavy build, calm, slow metabolism, prone to weight gain" },
  { value: "vata-pitta", label: "Vata-Pitta", description: "Mix of Vata and Pitta characteristics" },
  { value: "pitta-kapha", label: "Pitta-Kapha", description: "Mix of Pitta and Kapha characteristics" },
  { value: "vata-kapha", label: "Vata-Kapha", description: "Mix of Vata and Kapha characteristics" },
];

// Nutrition Philosophies
const NUTRITION_PHILOSOPHIES = [
  { value: "balanced", label: "Balanced (AAFCO/NRC)", description: "Science-based nutrition meeting all AAFCO guidelines" },
  { value: "barf", label: "BARF Diet", description: "Biologically Appropriate Raw Food - 70% meat, 10% bone, 7% veg" },
  { value: "prey-model", label: "Prey Model Raw", description: "80% meat, 10% bone, 10% organs - mimics whole prey" },
  { value: "rotational", label: "Rotational Feeding", description: "Rotating proteins and ingredients for variety" },
  { value: "functional", label: "Functional Foods", description: "Focus on foods with specific health benefits" },
];

// Condition-Specific Diets
const CONDITION_DIETS = [
  { value: "", label: "None", description: "No specific condition diet needed" },
  { value: "anti-inflammatory", label: "Anti-Inflammatory", description: "For allergies, arthritis, chronic inflammation" },
  { value: "ketogenic", label: "Ketogenic", description: "Very low carb for epilepsy/cancer support (vet supervised)" },
  { value: "renal", label: "Renal/Kidney", description: "Controlled protein and phosphorus for kidney disease" },
  { value: "cardiac", label: "Cardiac/Heart", description: "Low sodium, taurine-rich for heart conditions" },
  { value: "diabetic", label: "Diabetic", description: "High fiber, complex carbs for blood sugar control" },
  { value: "elimination", label: "Elimination Diet", description: "Single protein to identify allergies" },
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
    healthConditions: "",
    // Holistic nutrition fields
    tcvmConstitution: "",
    tcvmFoodEnergetics: "neutral",
    ayurvedicDosha: "",
    nutritionPhilosophy: "balanced",
    preferRawFood: false,
    conditionDiet: ""
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
      healthConditions: "",
      tcvmConstitution: "",
      tcvmFoodEnergetics: "neutral",
      ayurvedicDosha: "",
      nutritionPhilosophy: "balanced",
      preferRawFood: false,
      conditionDiet: ""
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
      dailyCalories,
      // Holistic nutrition fields
      tcvmConstitution: formData.tcvmConstitution || null,
      tcvmFoodEnergetics: formData.tcvmFoodEnergetics || null,
      ayurvedicDosha: formData.ayurvedicDosha || null,
      nutritionPhilosophy: formData.nutritionPhilosophy,
      preferRawFood: formData.preferRawFood,
      conditionDiet: formData.conditionDiet || null
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
      healthConditions: dog.healthConditions ? JSON.parse(dog.healthConditions).join(", ") : "",
      tcvmConstitution: dog.tcvmConstitution || "",
      tcvmFoodEnergetics: dog.tcvmFoodEnergetics || "neutral",
      ayurvedicDosha: dog.ayurvedicDosha || "",
      nutritionPhilosophy: dog.nutritionPhilosophy || "balanced",
      preferRawFood: dog.preferRawFood || false,
      conditionDiet: dog.conditionDiet || ""
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingDog ? "Edit Dog Profile" : "Add New Dog"}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="health">Health & Diet</TabsTrigger>
                      <TabsTrigger value="holistic">Holistic</TabsTrigger>
                    </TabsList>
                    
                    {/* Basic Info Tab */}
                    <TabsContent value="basic" className="space-y-4">
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
                    </TabsContent>
                    
                    {/* Health & Diet Tab */}
                    <TabsContent value="health" className="space-y-4">
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
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Condition-Specific Diet</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Select if your dog has a specific health condition requiring a specialized diet. Always consult your vet.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select
                          value={formData.conditionDiet}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, conditionDiet: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition diet (if any)" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITION_DIETS.map(diet => (
                              <SelectItem key={diet.value} value={diet.value}>
                                <div>
                                  <span className="font-medium">{diet.label}</span>
                                  <span className="text-xs text-muted-foreground ml-2">{diet.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                    
                    {/* Holistic Tab */}
                    <TabsContent value="holistic" className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <Leaf className="w-4 h-4 inline mr-1" />
                          These optional settings allow you to incorporate Traditional Chinese Veterinary Medicine (TCVM), 
                          Ayurvedic principles, and other holistic approaches into your dog's recipes.
                        </p>
                      </div>
                      
                      {/* Nutrition Philosophy */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Nutrition Philosophy</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Choose the overall approach to your dog's nutrition.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select
                          value={formData.nutritionPhilosophy}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, nutritionPhilosophy: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {NUTRITION_PHILOSOPHIES.map(phil => (
                              <SelectItem key={phil.value} value={phil.value}>
                                <div>
                                  <span className="font-medium">{phil.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          {NUTRITION_PHILOSOPHIES.find(p => p.value === formData.nutritionPhilosophy)?.description}
                        </p>
                      </div>
                      
                      {/* Raw Food Preference */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="preferRaw"
                          checked={formData.preferRawFood}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, preferRawFood: checked as boolean }))}
                        />
                        <label htmlFor="preferRaw" className="text-sm cursor-pointer">
                          Prefer raw/uncooked ingredients when possible
                        </label>
                      </div>
                      
                      {/* TCVM Constitution */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label>TCVM Constitution (Five Elements)</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Traditional Chinese Veterinary Medicine categorizes dogs into five constitutional types based on personality and physical traits.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select
                          value={formData.tcvmConstitution}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, tcvmConstitution: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select constitution (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Not sure / Skip</SelectItem>
                            {TCVM_CONSTITUTIONS.map(const_ => (
                              <SelectItem key={const_.value} value={const_.value}>
                                {const_.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.tcvmConstitution && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {TCVM_CONSTITUTIONS.find(c => c.value === formData.tcvmConstitution)?.description}
                          </p>
                        )}
                      </div>
                      
                      {/* TCVM Food Energetics */}
                      {formData.tcvmConstitution && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label>Food Energetics Preference</Label>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>In TCVM, foods have warming, cooling, or neutral properties that can balance your dog's constitution.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select
                            value={formData.tcvmFoodEnergetics}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, tcvmFoodEnergetics: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="warming">Warming (for cold/sluggish dogs)</SelectItem>
                              <SelectItem value="cooling">Cooling (for hot/inflamed dogs)</SelectItem>
                              <SelectItem value="neutral">Neutral (balanced)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {/* Ayurvedic Dosha */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label>Ayurvedic Dosha</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Ayurvedic medicine identifies three doshas (body types) that influence diet and health.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select
                          value={formData.ayurvedicDosha}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, ayurvedicDosha: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select dosha (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Not sure / Skip</SelectItem>
                            {AYURVEDIC_DOSHAS.map(dosha => (
                              <SelectItem key={dosha.value} value={dosha.value}>
                                {dosha.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.ayurvedicDosha && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {AYURVEDIC_DOSHAS.find(d => d.value === formData.ayurvedicDosha)?.description}
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <Button 
                    type="submit" 
                    className="w-full btn-doggo mt-6"
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
                    
                    {/* Nutrition Philosophy Badge */}
                    {dog.nutritionPhilosophy && dog.nutritionPhilosophy !== "balanced" && (
                      <div className="mb-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {NUTRITION_PHILOSOPHIES.find(p => p.value === dog.nutritionPhilosophy)?.label || dog.nutritionPhilosophy}
                        </span>
                      </div>
                    )}
                    
                    {/* TCVM/Ayurveda Badges */}
                    {(dog.tcvmConstitution || dog.ayurvedicDosha) && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {dog.tcvmConstitution && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            {TCVM_CONSTITUTIONS.find(c => c.value === dog.tcvmConstitution)?.label}
                          </span>
                        )}
                        {dog.ayurvedicDosha && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {dog.ayurvedicDosha.charAt(0).toUpperCase() + dog.ayurvedicDosha.slice(1)}
                          </span>
                        )}
                      </div>
                    )}
                    
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
