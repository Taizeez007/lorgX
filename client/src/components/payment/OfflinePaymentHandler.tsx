import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useOfflineBooking } from '@/hooks/use-offline-booking';

interface OfflinePaymentHandlerProps {
  event: any;
  bookingData: any;
  paymentAmount: number;
  onComplete: () => void;
  paymentMethod?: string;
}

export function OfflinePaymentHandler({
  event,
  bookingData,
  paymentAmount,
  onComplete,
  paymentMethod = 'card'
}: OfflinePaymentHandlerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { saveOfflinePayment, syncAllPendingData, isOnline } = useOfflineBooking();

  const handleSaveOfflinePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create payment data
      const paymentData = {
        eventId: event.id,
        bookingId: bookingData.id,
        paymentMethod,
        amount: paymentAmount,
        currency: 'USD',
        status: 'pending',
        paymentReference: `offline-${Date.now()}`,
        metadata: {
          eventTitle: event.title,
          bookingType: bookingData.isGuestBooking ? 'guest' : 'user',
          bookedAt: new Date().toISOString(),
          attendeeInfo: bookingData.isGuestBooking 
            ? { name: bookingData.guestName, email: bookingData.guestEmail }
            : { userId: bookingData.userId }
        }
      };
      
      // Save payment data to IndexedDB
      await saveOfflinePayment(paymentData);
      
      // Update UI state
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Error creating offline payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Offline Payment</CardTitle>
            <CardDescription>
              Your payment will be processed when you're back online
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1.5"
          >
            <WifiOff className="h-3 w-3" />
            Offline Mode
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>You are currently offline</AlertTitle>
          <AlertDescription>
            Your payment information will be saved locally and processed once you reconnect to the internet.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Event:</span>
            <span className="text-sm font-medium">{event.title}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date:</span>
            <span className="text-sm">{formatDate(new Date(event.startDate))}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Payment Method:</span>
            <span className="text-sm font-medium capitalize">{paymentMethod}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Amount:</span>
            <span className="text-sm font-medium">${paymentAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Status:</span>
            <span className="text-sm font-medium flex items-center">
              {isComplete ? (
                <>
                  <Clock className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  <span className="text-amber-600">Pending Sync</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 mr-1 text-red-500" />
                  <span className="text-red-600">Not Processed</span>
                </>
              )}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="text-sm font-medium mb-2">What happens next:</h4>
          <ol className="text-sm text-gray-600 space-y-1.5 list-decimal pl-4">
            <li>Your booking and payment will be saved locally on your device</li>
            <li>When you regain internet connectivity, the payment will be processed automatically</li>
            <li>You'll receive a confirmation email once the payment is successful</li>
            <li>If payment fails, you'll need to complete it manually</li>
          </ol>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        {isComplete ? (
          <Button 
            className="w-full sm:w-auto flex items-center gap-1.5"
            variant="outline"
            onClick={() => syncAllPendingData()}
            disabled={!isOnline}
          >
            <RefreshCw className="h-4 w-4" />
            {isOnline ? 'Sync Now' : 'Waiting for Connection'}
          </Button>
        ) : (
          <>
            <Button
              className="w-full sm:w-auto"
              onClick={handleSaveOfflinePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Save Payment for Later
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={onComplete}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}