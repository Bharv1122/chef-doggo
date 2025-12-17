import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Camera, ChefHat, Heart, Leaf, Play, RefreshCw, Shield, Sparkles, Upload, UtensilsCrossed } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/chef-doggo-logo.png" alt="Chef Doggo" className="h-10 w-10 rounded-full" />
            <span className="font-bold text-xl hidden sm:inline">Chef Doggo</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/my-dogs">
                  <Button variant="ghost" size="sm">My Dogs</Button>
                </Link>
                <Link href="/recipes">
                  <Button variant="ghost" size="sm">Recipes</Button>
                </Link>
                <Link href="/generate">
                  <Button className="btn-doggo text-sm py-2 px-4">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Recipe
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="btn-doggo text-sm py-2 px-4">Get Started</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden paw-pattern">
        <div className="container py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Heart className="w-4 h-4" />
                Made with love for your furry friend
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Turn <span className="text-primary">Kibble</span> into{" "}
                <span className="text-secondary">Cuisine</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Transform your dog's processed food into fresh, homemade recipes tailored to their 
                breed, age, weight, and dietary needs. Powered by veterinary nutrition science.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link href="/generate">
                    <Button size="lg" className="btn-doggo w-full sm:w-auto">
                      <Camera className="w-5 h-5 mr-2" />
                      Scan Kibble Label
                    </Button>
                  </Link>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="btn-doggo w-full sm:w-auto">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Free
                    </Button>
                  </a>
                )}
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Learn How It Works
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  <span>Vet-Backed Science</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-secondary" />
                  <span>Fresh Ingredients</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="/chef-doggo-logo.png" 
                  alt="Chef Doggo mascot" 
                  className="w-full max-w-md mx-auto animate-bounce-gentle"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-card py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your dog's diet from processed to fresh
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-doggo text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Upload Kibble Label</h3>
                <p className="text-muted-foreground">
                  Take a photo of your dog food's ingredient label. Our AI reads and analyzes the ingredients.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-doggo text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Add Dog Profile</h3>
                <p className="text-muted-foreground">
                  Tell us about your dog - breed, age, weight, allergies. We customize recipes to their needs.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-doggo text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Get Fresh Recipes</h3>
                <p className="text-muted-foreground">
                  Receive personalized homemade recipes with ingredients, instructions, and supplement guidance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Nutrition Science Meets <span className="text-primary">Love</span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">AAFCO Standards</h3>
                    <p className="text-muted-foreground">
                      Every recipe follows AAFCO nutritional guidelines to ensure complete and balanced meals.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Allergy-Safe</h3>
                    <p className="text-muted-foreground">
                      Automatically excludes allergens like beef, dairy, chicken, or wheat based on your dog's profile.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <RefreshCw className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Endless Variety</h3>
                    <p className="text-muted-foreground">
                      Don't like a recipe? Hit refresh to generate new options with different proteins and vegetables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8">
              <div className="bg-card rounded-2xl shadow-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    🐕
                  </div>
                  <div>
                    <p className="font-bold">Recipe for Max</p>
                    <p className="text-sm text-muted-foreground">Golden Retriever • 3 years • 65 lbs</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-bold text-lg mb-2">Turkey & Sweet Potato Bowl</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-muted rounded-lg p-2">
                      <p className="font-bold text-primary">485</p>
                      <p className="text-muted-foreground">calories</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="font-bold text-secondary">32g</p>
                      <p className="text-muted-foreground">protein</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="font-bold text-accent">15g</p>
                      <p className="text-muted-foreground">fat</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Watch Chef Doggo in Action
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how easy it is to create delicious, nutritious meals for your furry friend
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video
                ref={videoRef}
                src="/videos/dog-cooking.mp4"
                className="w-full aspect-video"
                loop
                playsInline
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />
              
              {!isVideoPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity hover:bg-black/20"
                  onClick={toggleVideo}
                >
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </div>
                </div>
              )}
              
              {isVideoPlaying && (
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={toggleVideo}
                />
              )}
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              🎬 Chef Doggo demonstrating the art of canine cuisine
            </p>
          </div>
        </div>
      </section>

      {/* Warning Banner */}
      <section className="py-8 bg-amber-50 border-y border-amber-200">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 mb-1">Always Consult Your Veterinarian</h3>
              <p className="text-amber-700 text-sm">
                Chef Doggo provides educational information based on veterinary nutrition science. 
                Before making any changes to your dog's diet, please consult with a licensed veterinarian 
                or board-certified veterinary nutritionist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Cook for Your Best Friend?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Join thousands of pet parents who are giving their dogs the gift of fresh, 
            nutritious homemade meals.
          </p>
          {isAuthenticated ? (
            <Link href="/generate">
              <Button size="lg" className="btn-doggo">
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Your First Recipe
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="btn-doggo">
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/chef-doggo-logo.png" alt="Chef Doggo" className="h-8 w-8 rounded-full" />
                <span className="font-bold">Chef Doggo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Turn kibble into cuisine with AI-powered canine nutrition.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/generate" className="hover:text-primary">Recipe Generator</Link></li>
                <li><Link href="/my-dogs" className="hover:text-primary">Dog Profiles</Link></li>
                <li><Link href="/recipes" className="hover:text-primary">Saved Recipes</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/nutrition-guide" className="hover:text-primary">Nutrition Guide</Link></li>
                <li><Link href="/supplements" className="hover:text-primary">Supplements</Link></li>
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/disclaimer" className="hover:text-primary">Veterinary Disclaimer</Link></li>
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Chef Doggo. Not a substitute for veterinary advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
