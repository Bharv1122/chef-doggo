'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  tier?: 'standard' | 'therapeutic' | 'critical' | 'medication' | 'holistic';
  dogProfileId?: string;
  recipeId?: string;
  customMessage?: string;
  medicationWarnings?: string[];
}

export function DisclaimerModal({
  open,
  onClose,
  onAccept,
  tier = 'standard',
  dogProfileId,
  recipeId,
  customMessage,
  medicationWarnings = [],
}: DisclaimerModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    if (tier === 'critical') {
      // Critical tier cannot be overridden
      onClose();
      return;
    }

    if (!accepted) {
      toast.error('Please check the box to acknowledge the disclaimer');
      return;
    }

    setLoading(true);

    try {
      // Record disclaimer acknowledgment
      await fetch('/api/disclaimers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dogProfileId,
          recipeId,
          disclaimerTier: tier,
        }),
      });

      onAccept();
    } catch (error) {
      toast.error('Failed to record acknowledgment');
    } finally {
      setLoading(false);
    }
  }

  const disclaimerMessages = {
    standard: `IMPORTANT VETERINARY DISCLAIMER

The recipes and nutritional information provided by Chef Doggo are for informational and educational purposes only. They are NOT a substitute for professional veterinary advice, diagnosis, or treatment.

Before making any changes to your dog's diet:
• Consult with your veterinarian
• Discuss your dog's specific health needs
• Get approval for any dietary changes
• Monitor your dog closely during any transition

Chef Doggo does not assume any liability for your dog's health. Every dog is unique, and what works for one may not work for another.

By proceeding, you acknowledge that you understand these risks and will consult with a veterinarian.`,

    therapeutic: customMessage ?? `ENHANCED WARNING - CONDITION-SPECIFIC DIET

⚠️ Your dog has health condition(s) that require special dietary considerations.

This recipe has been adjusted for therapeutic needs, but:
• It is NOT a replacement for veterinary-prescribed diets
• Health conditions require ongoing veterinary supervision
• Incorrect nutrition can worsen medical conditions
• Regular monitoring and blood work may be necessary

CRITICAL: You MUST consult with your veterinarian before using this recipe. Your vet may need to:
• Adjust the recipe further based on lab results
• Monitor your dog's response to the diet
• Modify supplement recommendations
• Coordinate with any medications

Do not proceed without veterinary approval.`,

    critical: customMessage ?? `CRITICAL WARNING - RECIPE CANNOT BE GENERATED

This recipe cannot be generated due to:
• Toxic ingredients detected, OR
• Dangerous combination of health conditions, OR
• AAFCO nutritional standards not met, OR
• Severe medication contraindications

Generating this recipe could pose serious health risks to your dog.

Please consult with your veterinarian for a custom dietary plan that meets your dog's specific needs.`,

    medication: `MEDICATION INTERACTION WARNING

⚠️ Potential medication-food interactions detected:

${medicationWarnings.join('\\n\\n')}

IMPORTANT:
• These interactions can affect medication effectiveness
• Some combinations may cause adverse effects
• Timing of meals relative to medication matters
• Your veterinarian may need to adjust dosages

OPTIONS:
1. Modify the recipe to avoid problematic ingredients
2. Adjust medication timing (give meds separate from meals)
3. Consult your vet about alternative medications

Do you want to proceed with caution, understanding these risks?`,

    holistic: `HOLISTIC SYSTEM CONFLICT NOTICE

ℹ️ We detected different recommendations between Traditional Chinese Veterinary Medicine (TCVM) and Ayurvedic principles for your dog.

This is informational only and does not affect recipe safety.

• TCVM and Ayurveda are complementary systems with different philosophies
• Conflicts are common and usually minor
• Both systems have value, but may suggest different approaches
• Western veterinary nutrition takes priority for safety

The recipe has been balanced to meet AAFCO standards while considering your preferences. You may consult with a holistic veterinarian for personalized guidance.`,
  };

  const currentDisclaimer = disclaimerMessages[tier];

  return (
    <Dialog open={open} onOpenChange={tier === 'critical' ? onClose : (open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-6 h-6 ${
              tier === 'critical' ? 'text-red-600' : 
              tier === 'therapeutic' || tier === 'medication' ? 'text-orange-600' : 
              'text-[#F97316]'
            }`} />
            <DialogTitle className="text-xl">
              {tier === 'critical' && 'Critical Warning'}
              {tier === 'therapeutic' && 'Enhanced Warning'}
              {tier === 'medication' && 'Medication Warning'}
              {tier === 'holistic' && 'Holistic Notice'}
              {tier === 'standard' && 'Important Disclaimer'}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Disclaimer tier: {tier}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className={`p-4 rounded-lg ${
            tier === 'critical' ? 'bg-red-50' : 
            tier === 'therapeutic' || tier === 'medication' ? 'bg-orange-50' : 
            'bg-[#FDF6E9]'
          }`}>
            <pre className="whitespace-pre-wrap text-sm text-[#1C1917] font-sans">
              {currentDisclaimer}
            </pre>
          </div>

          {(tier === 'standard' || tier === 'medication' || tier === 'holistic') && (
            <div className="flex items-start gap-3 mt-6">
              <Checkbox
                id="disclaimer-accept"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
              />
              <label
                htmlFor="disclaimer-accept"
                className="text-sm text-[#1C1917] cursor-pointer leading-relaxed"
              >
                I understand and acknowledge {tier === 'medication' ? 'these medication warnings' : tier === 'holistic' ? 'this information' : 'this disclaimer'}. I will consult with my veterinarian before making any dietary changes.
              </label>
            </div>
          )}

          {tier === 'therapeutic' && (
            <div className="flex items-start gap-3 mt-6">
              <Checkbox
                id="disclaimer-accept"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
              />
              <label
                htmlFor="disclaimer-accept"
                className="text-sm text-[#1C1917] cursor-pointer leading-relaxed font-semibold"
              >
                I confirm that I will consult with my veterinarian BEFORE using this therapeutic recipe. I understand this is not a substitute for veterinary-prescribed diets.
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          {tier === 'critical' ? (
            <Button onClick={onClose} className="bg-[#F97316] hover:bg-[#ea580c]">
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!accepted || loading}
                className="bg-[#F97316] hover:bg-[#ea580c]"
              >
                {loading ? 'Processing...' : 'I Understand, Continue'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}