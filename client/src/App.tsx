import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MyDogs from "./pages/MyDogs";
import Generate from "./pages/Generate";
import Recipe from "./pages/Recipe";
import Recipes from "./pages/Recipes";
import Disclaimer from "./pages/Disclaimer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-dogs" component={MyDogs} />
      <Route path="/generate" component={Generate} />
      <Route path="/recipe/:id" component={Recipe} />
      <Route path="/recipes" component={Recipes} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
