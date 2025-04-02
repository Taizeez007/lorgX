import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Initialize Stripe.js with the publishable key
// Using dummy key until real one is provided
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy_key');

interface PaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm = ({ onSuccess, onCancel }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        // Show error message
        toast({
          title: 'Payment failed',
          description: result.error.message || 'An error occurred during payment',
          variant: 'destructive',
        });
      } else {
        // The payment succeeded
        toast({
          title: 'Payment successful',
          description: 'Your booking has been confirmed',
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment failed',
        description: 'An unexpected error occurred during payment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 min-w-[300px]">
      <PaymentElement />
      <div className="flex justify-between space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="w-1/2"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isLoading} 
          className="w-1/2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Pay Now
        </Button>
      </div>
    </form>
  );
};

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
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(
          'POST', 
          '/api/payments/stripe/create-payment-intent', 
          { amount, eventId, currency }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to initialize payment');
        }
        
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Payment intent error:', error);
        setError('Failed to initialize payment. Please try again.');
        toast({
          title: 'Payment Error',
          description: 'Could not initialize payment process',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, eventId, currency, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={onCancel} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Complete your payment</h2>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
      )}
    </div>
  );
}