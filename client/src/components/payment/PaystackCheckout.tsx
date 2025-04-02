import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

interface PaystackCheckoutProps {
  amount: number;
  eventId: number;
  currency?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaystackCheckout({
  amount,
  eventId,
  currency = 'NGN',
  onSuccess,
  onCancel
}: PaystackCheckoutProps) {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Prefill email if user is authenticated
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handlePayment = async () => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address to continue',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest(
        'POST',
        '/api/payments/paystack/initialize',
        { amount, eventId, email, currency }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      // Open Paystack checkout in a new window
      const newWindow = window.open(data.authorization_url, '_blank');
      
      if (!newWindow) {
        toast({
          title: 'Popup Blocked',
          description: 'Please allow popups to complete your payment',
          variant: 'destructive',
        });
        return;
      }

      // Start polling to verify payment
      verifyPayment(data.reference);
    } catch (error) {
      console.error('Paystack error:', error);
      toast({
        title: 'Payment Error',
        description: 'Could not initialize payment process',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    // Start checking the payment status
    setVerifying(true);
    
    try {
      // Poll every 3 seconds for up to 2 minutes (40 attempts)
      for (let i = 0; i < 40; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const response = await apiRequest(
          'GET',
          `/api/payments/paystack/verify/${reference}`
        );

        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
          toast({
            title: 'Payment Successful',
            description: 'Your booking has been confirmed',
          });
          setVerifying(false);
          onSuccess();
          return;
        }
      }
      
      // If we get here, payment couldn't be verified after 2 minutes
      toast({
        title: 'Verification Timeout',
        description: 'Please check your Paystack dashboard for payment status',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'Could not verify your payment status',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Pay with Paystack</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || verifying}
          />
        </div>
        <div className="text-sm">
          <span className="font-semibold">Amount:</span> {currency} {amount.toFixed(2)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between space-x-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading || verifying}
          className="w-1/2"
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading || verifying || !email}
          className="w-1/2"
        >
          {loading || verifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {loading ? 'Processing...' : 'Verifying...'}
            </>
          ) : (
            'Pay Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}