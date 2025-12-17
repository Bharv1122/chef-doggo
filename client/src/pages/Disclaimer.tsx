import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Disclaimer() {
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
              <h1 className="text-2xl font-bold">Veterinary Disclaimer</h1>
              <p className="text-sm text-muted-foreground">Important information about using Chef Doggo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-3xl mx-auto prose prose-slate">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-amber-600" />
              <h2 className="text-xl font-bold text-amber-800 m-0">Important Notice</h2>
            </div>
            <p className="text-amber-700 m-0">
              Chef Doggo is an educational tool that provides general information about canine nutrition. 
              It is not a substitute for professional veterinary advice, diagnosis, or treatment.
            </p>
          </div>

          <h2>General Disclaimer</h2>
          <p>
            The information provided by Chef Doggo ("we," "us," or "our") on this application is for 
            general informational and educational purposes only. All information on the application is 
            provided in good faith; however, we make no representation or warranty of any kind, express 
            or implied, regarding the accuracy, adequacy, validity, reliability, availability, or 
            completeness of any information on the application.
          </p>

          <h2>Not Veterinary Advice</h2>
          <p>
            The application does not provide veterinary advice. The content is not intended to be a 
            substitute for professional veterinary advice, diagnosis, or treatment. Always seek the 
            advice of your veterinarian or other qualified animal health provider with any questions 
            you may have regarding your pet's medical condition or dietary needs.
          </p>
          <p>
            Never disregard professional veterinary advice or delay in seeking it because of something 
            you have read on this application. If you think your pet may have a medical emergency, 
            call your veterinarian or animal emergency service immediately.
          </p>

          <h2>Homemade Diet Risks</h2>
          <p>
            Research has shown that the majority of homemade pet food recipes available online and in 
            books are nutritionally inadequate. According to a study published in the Journal of the 
            American Veterinary Medical Association, 94% of homemade dog food recipes were deficient 
            in at least one essential nutrient.
          </p>
          <p>
            While Chef Doggo strives to provide recipes based on AAFCO (Association of American Feed 
            Control Officials) nutritional guidelines, we cannot guarantee that any recipe will meet 
            your individual pet's nutritional requirements. Factors such as:
          </p>
          <ul>
            <li>Individual health conditions</li>
            <li>Metabolic differences</li>
            <li>Life stage requirements</li>
            <li>Activity level variations</li>
            <li>Ingredient quality and preparation methods</li>
          </ul>
          <p>
            can all affect whether a diet is appropriate for your specific pet.
          </p>

          <h2>Supplementation Requirements</h2>
          <p>
            Homemade diets almost always require supplementation to be nutritionally complete. The 
            most critical supplement is calcium, as meat-based diets without proper calcium 
            supplementation can lead to serious health problems including:
          </p>
          <ul>
            <li>Nutritional secondary hyperparathyroidism</li>
            <li>Bone abnormalities</li>
            <li>Fractures</li>
            <li>Dental problems</li>
          </ul>
          <p>
            Always follow supplement recommendations and consult with your veterinarian about 
            appropriate supplementation for your pet.
          </p>

          <h2>Toxic Foods Warning</h2>
          <p>
            While Chef Doggo attempts to exclude known toxic foods from recipes, we cannot guarantee 
            that all potentially harmful ingredients have been identified or excluded. Foods that are 
            toxic to dogs include, but are not limited to:
          </p>
          <ul>
            <li><strong>Xylitol</strong> - Extremely toxic, found in sugar-free products</li>
            <li><strong>Chocolate</strong> - Contains theobromine</li>
            <li><strong>Grapes and raisins</strong> - Can cause kidney failure</li>
            <li><strong>Onions and garlic</strong> - Can cause anemia</li>
            <li><strong>Macadamia nuts</strong> - Toxic to dogs</li>
            <li><strong>Alcohol</strong> - Toxic in any amount</li>
            <li><strong>Caffeine</strong> - Toxic to dogs</li>
          </ul>

          <h2>Allergies and Sensitivities</h2>
          <p>
            While Chef Doggo allows you to specify known allergies, we cannot guarantee that recipes 
            will be free of all potential allergens or cross-reactive ingredients. Always carefully 
            review all ingredients before preparing any recipe for your pet.
          </p>

          <h2>Transition Period</h2>
          <p>
            Any dietary changes should be made gradually over a period of 7-10 days to minimize 
            digestive upset. Rapid diet changes can cause:
          </p>
          <ul>
            <li>Vomiting</li>
            <li>Diarrhea</li>
            <li>Loss of appetite</li>
            <li>Gastrointestinal distress</li>
          </ul>

          <h2>Monitoring Your Pet</h2>
          <p>
            When feeding a homemade diet, it is essential to monitor your pet closely for:
          </p>
          <ul>
            <li>Changes in weight</li>
            <li>Changes in coat quality</li>
            <li>Changes in energy level</li>
            <li>Digestive issues</li>
            <li>Any signs of illness</li>
          </ul>
          <p>
            Regular veterinary check-ups, including blood work, are recommended to ensure your pet 
            is receiving adequate nutrition.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            Under no circumstances shall Chef Doggo or its creators be liable for any direct, indirect, 
            incidental, consequential, special, or exemplary damages arising out of or in connection 
            with your use of the application or the information provided therein, including but not 
            limited to:
          </p>
          <ul>
            <li>Injury or illness to your pet</li>
            <li>Veterinary expenses</li>
            <li>Loss of your pet</li>
            <li>Any other damages whatsoever</li>
          </ul>

          <h2>Consult a Professional</h2>
          <p>
            We strongly recommend consulting with a board-certified veterinary nutritionist (DACVN) 
            before switching your pet to a homemade diet. These specialists can:
          </p>
          <ul>
            <li>Evaluate your pet's individual nutritional needs</li>
            <li>Formulate a balanced diet specific to your pet</li>
            <li>Recommend appropriate supplements</li>
            <li>Monitor your pet's health on the new diet</li>
          </ul>

          <h2>Acknowledgment</h2>
          <p>
            By using Chef Doggo, you acknowledge that you have read, understood, and agree to be 
            bound by this disclaimer. You acknowledge that the information provided is for educational 
            purposes only and that you will consult with a qualified veterinarian before making any 
            changes to your pet's diet.
          </p>

          <div className="bg-muted rounded-lg p-6 mt-8">
            <p className="text-sm text-muted-foreground m-0">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground m-0 mt-2">
              If you have any questions about this disclaimer, please contact us.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
