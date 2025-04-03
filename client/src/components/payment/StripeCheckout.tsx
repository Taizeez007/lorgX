// This component is a placeholder for Stripe integration
// Stripe functionality has been removed temporarily

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StripeCheckoutProps {
  amount: number;
  eventId: number;
  currency?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({ 
  amount, 
  eventId, 
  currency = 'usd',
  onSuccess,
  onCancel
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePaymentAttempt = async () => {
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      
      toast({
        title: "Stripe integration unavailable",
        description: "Please use Paystack for payments at this time.",
        variant: "destructive"
      });
      
      onCancel();
    }, 1500);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Stripe Payment</h2>
      
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Stripe integration is currently disabled</AlertTitle>
        <AlertDescription>
          Please use Paystack for payments at this time. Stripe integration will be available in the future.
        </AlertDescription>
      </Alert>
      
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount/100)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event ID:</span>
            <span className="font-medium">{eventId}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="w-1/2"
        >
          Cancel
        </Button>
        <Button 
          onClick={handlePaymentAttempt}
          disabled={loading}
          className="w-1/2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Try Payment
        </Button>
      </div>
    </div>
  );
}