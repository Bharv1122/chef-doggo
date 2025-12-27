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
  tier?: 'standard' | 'critical';
  dogProfileId?: string;
  recipeId?: string;
  customMessage?: string;
}

export function DisclaimerModal({
  open,
  onClose,
  onAccept,
  tier = 'standard',
  dogProfileId,
  recipeId,
  customMessage,
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

  const standardDisclaimer = `IMPORTANT VETERINARY DISCLAIMER

The recipes and nutritional information provided by Chef Doggo are for informational and educational purposes only. They are NOT a substitute for professional veterinary advice, diagnosis, or treatment.

Before making any changes to your dog's diet:
• Consult with your veterinarian
• Discuss your dog's specific health needs
• Get approval for any dietary changes
• Monitor your dog closely during any transition

Chef Doggo does not assume any liability for your dog's health. Every dog is unique, and what works for one may not work for another.

By proceeding, you acknowledge that you understand these risks and will consult with a veterinarian.`;

  const criticalDisclaimer = customMessage ?? `CRITICAL WARNING - RECIPE CANNOT BE GENERATED

This recipe cannot be generated due to:
• Toxic ingredients detected, OR
• Dangerous combination of health conditions, OR
• AAFCO nutritional standards not met

Generating this recipe could pose serious health risks to your dog.

Please consult with your veterinarian for a custom dietary plan that meets your dog's specific needs.`;

  return (
    <Dialog open={open} onOpenChange={tier === 'critical' ? onClose : (open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-[#F97316]" />
            <DialogTitle className="text-xl">
              {tier === 'critical' ? 'Critical Warning' : 'Important Disclaimer'}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {tier === 'critical' ? 'Critical health warning' : 'Veterinary disclaimer'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-[#FDF6E9] p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-[#1C1917] font-sans">
              {tier === 'critical' ? criticalDisclaimer : standardDisclaimer}
            </pre>
          </div>

          {tier === 'standard' && (
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
                I understand and acknowledge this disclaimer. I will consult with my veterinarian before making
                any dietary changes.
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