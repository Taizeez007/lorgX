import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PaymentProvider from './PaymentProvider';

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  eventId: number;
  eventName?: string;
  onSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onOpenChange,
  amount,
  eventId,
  eventName,
  onSuccess,
}: PaymentModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Complete Your Booking</DialogTitle>
          {eventName && (
            <DialogDescription>
              You're booking: {eventName}
            </DialogDescription>
          )}
        </DialogHeader>
        <PaymentProvider 
          amount={amount}
          eventId={eventId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}