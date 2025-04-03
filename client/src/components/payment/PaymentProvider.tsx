import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StripeCheckout from './StripeCheckout';
import PaystackCheckout from './PaystackCheckout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiStripe } from 'react-icons/si';
import { FaMoneyBillWave } from 'react-icons/fa';

interface PaymentProviderProps {
  amount: number;
  eventId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentProvider({
  amount,
  eventId,
  onSuccess,
  onCancel
}: PaymentProviderProps) {
  // Default to Paystack since Stripe is disabled
  const [activeTab, setActiveTab] = useState<string>('paystack');

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Choose Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="paystack"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="stripe" className="flex items-center space-x-2">
              <SiStripe className="h-5 w-5" />
              <span>Stripe</span>
            </TabsTrigger>
            <TabsTrigger value="paystack" className="flex items-center space-x-2">
              <FaMoneyBillWave className="h-5 w-5" />
              <span>Paystack</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="stripe">
            <StripeCheckout
              amount={amount}
              eventId={eventId}
              currency="usd"
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </TabsContent>
          <TabsContent value="paystack">
            <PaystackCheckout
              amount={amount}
              eventId={eventId}
              currency="NGN"
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}