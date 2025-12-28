'use client';

import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MEDICATION_INTERACTIONS, type MedicationInteraction } from '@/lib/medication-interactions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const COMMON_SUPPLEMENTS = [
  'Fish Oil (Omega-3)',
  'Glucosamine',
  'Chondroitin',
  'Probiotics',
  'Multivitamin',
  'Vitamin E',
  'Vitamin C',
  'Vitamin D',
  'Calcium',
  'Iron',
  'Zinc',
  'B-Complex',
  'Joint Support',
  'Hip & Joint',
  'Digestive Enzymes',
  'Turmeric/Curcumin',
  'CBD Oil',
  'Milk Thistle',
  'Cranberry',
  'Green-Lipped Mussel',
];

const ALL_MEDICATIONS = [
  ...new Set(MEDICATION_INTERACTIONS.map(m => m.medication))
].sort();

export default function SupplementCheckerPage() {
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const [customMedication, setCustomMedication] = useState('');
  const [customSupplement, setCustomSupplement] = useState('');
  const [showResults, setShowResults] = useState(false);

  const addMedication = (medication: string) => {
    if (medication && !selectedMedications.includes(medication)) {
      setSelectedMedications([...selectedMedications, medication]);
      setShowResults(false);
    }
    setCustomMedication('');
  };

  const removeMedication = (medication: string) => {
    setSelectedMedications(selectedMedications.filter(m => m !== medication));
    setShowResults(false);
  };

  const addSupplement = (supplement: string) => {
    if (supplement && !selectedSupplements.includes(supplement)) {
      setSelectedSupplements([...selectedSupplements, supplement]);
      setShowResults(false);
    }
    setCustomSupplement('');
  };

  const removeSupplement = (supplement: string) => {
    setSelectedSupplements(selectedSupplements.filter(s => s !== supplement));
    setShowResults(false);
  };

  const checkInteractions = () => {
    setShowResults(true);
  };

  const clearAll = () => {
    setSelectedMedications([]);
    setSelectedSupplements([]);
    setShowResults(false);
  };

  // Find interactions for selected medications
  const interactions = selectedMedications
    .map(med => MEDICATION_INTERACTIONS.filter(interaction => 
      interaction.medication.toLowerCase() === med.toLowerCase()
    ))
    .flat();

  // Check if any supplements contain affected ingredients
  const potentialIssues = interactions.filter(interaction => {
    return selectedSupplements.some(supp => {
      const suppLower = supp.toLowerCase();
      return interaction.affectedIngredients.some(ing => 
        suppLower.includes(ing.toLowerCase())
      );
    });
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
          <h1 className="text-4xl font-bold text-primary">Supplement & Medication Checker</h1>
        </div>
        <p className="text-muted-foreground">
          Check for potential interactions between medications and supplements
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Veterinary Consultation Required</AlertTitle>
        <AlertDescription className="text-blue-700">
          This tool provides general information only. <strong>Always consult your veterinarian</strong> before adding or changing supplements,
          especially if your dog is on medication. Some interactions can be serious.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Medications Section */}
        <Card>
          <CardHeader>
            <CardTitle>Current Medications</CardTitle>
            <CardDescription>
              Select all medications your dog is currently taking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="medication-select">Select Medication</Label>
              <Select onValueChange={(value) => addMedication(value)}>
                <SelectTrigger id="medication-select">
                  <SelectValue placeholder="Choose a medication" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ALL_MEDICATIONS.map(med => (
                    <SelectItem key={med} value={med}>
                      {med}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom-medication">Or Add Custom</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-medication"
                  placeholder="Enter medication name"
                  value={customMedication}
                  onChange={(e) => setCustomMedication(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addMedication(customMedication);
                    }
                  }}
                />
                <Button
                  onClick={() => addMedication(customMedication)}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {selectedMedications.length > 0 && (
              <div>
                <Label className="mb-2 block">Selected Medications ({selectedMedications.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedMedications.map(med => (
                    <Badge
                      key={med}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      {med}
                      <button
                        onClick={() => removeMedication(med)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supplements Section */}
        <Card>
          <CardHeader>
            <CardTitle>Current Supplements</CardTitle>
            <CardDescription>
              Select all supplements your dog is currently taking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="supplement-select">Select Supplement</Label>
              <Select onValueChange={(value) => addSupplement(value)}>
                <SelectTrigger id="supplement-select">
                  <SelectValue placeholder="Choose a supplement" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COMMON_SUPPLEMENTS.map(supp => (
                    <SelectItem key={supp} value={supp}>
                      {supp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom-supplement">Or Add Custom</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-supplement"
                  placeholder="Enter supplement name"
                  value={customSupplement}
                  onChange={(e) => setCustomSupplement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSupplement(customSupplement);
                    }
                  }}
                />
                <Button
                  onClick={() => addSupplement(customSupplement)}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {selectedSupplements.length > 0 && (
              <div>
                <Label className="mb-2 block">Selected Supplements ({selectedSupplements.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedSupplements.map(supp => (
                    <Badge
                      key={supp}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      {supp}
                      <button
                        onClick={() => removeSupplement(supp)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={checkInteractions}
          disabled={selectedMedications.length === 0 && selectedSupplements.length === 0}
          size="lg"
          className="flex-1"
        >
          <Search className="h-4 w-4 mr-2" />
          Check for Interactions
        </Button>
        <Button
          onClick={clearAll}
          variant="outline"
          size="lg"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Results */}
      {showResults && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {potentialIssues.length === 0 ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span>No Known Interactions Detected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                    <span>{potentialIssues.length} Potential Interaction{potentialIssues.length !== 1 ? 's' : ''} Found</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {potentialIssues.length === 0 ? (
                <div className="text-muted-foreground">
                  <p className="mb-4">
                    Based on the medications and supplements you've selected, we didn't find any known interactions in our database.
                  </p>
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-700">
                      <strong>Important:</strong> This doesn't guarantee safety. Always consult your veterinarian before adding supplements,
                      especially if your dog is on medication.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-4">
                  {potentialIssues.map((interaction, idx) => (
                    <Alert key={idx} className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertTitle className="text-orange-800 flex items-center gap-2">
                        {interaction.medication}
                        <Badge className={getSeverityColor(interaction.severity)}>
                          {interaction.severity.toUpperCase()}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="text-orange-700 space-y-2">
                        <p><strong>Warning:</strong> {interaction.warning}</p>
                        <p><strong>Affected Ingredients:</strong> {interaction.affectedIngredients.join(', ')}</p>
                        <p><strong>Recommendation:</strong> {interaction.recommendation}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Medication Info */}
          {interactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Complete Medication Information</CardTitle>
                <CardDescription>
                  Detailed interaction information for all selected medications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {interactions.map((interaction, idx) => (
                  <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{interaction.medication}</h4>
                      <Badge className={getSeverityColor(interaction.severity)}>
                        {interaction.severity}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Affected Ingredients:</strong> {interaction.affectedIngredients.join(', ')}</p>
                      <p><strong>Warning:</strong> {interaction.warning}</p>
                      <p><strong>Recommendation:</strong> {interaction.recommendation}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!showResults && (selectedMedications.length > 0 || selectedSupplements.length > 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Check</h3>
            <p className="text-muted-foreground mb-4">
              Click "Check for Interactions" to see potential issues
            </p>
          </CardContent>
        </Card>
      )}

      {selectedMedications.length === 0 && selectedSupplements.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Items Selected</h3>
            <p className="text-muted-foreground">
              Add medications and supplements above to check for interactions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
