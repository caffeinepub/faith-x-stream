import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useGetStripeSessionStatus } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = useSearch({ from: '/payment-success' });
  const sessionId = (search as any)?.session_id || '';
  const { data: sessionStatus, isLoading } = useGetStripeSessionStatus(sessionId);

  useEffect(() => {
    if (sessionStatus) {
      if (sessionStatus.__kind__ === 'completed') {
        // Invalidate user profile to fetch updated premium status
        queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        toast.success('Welcome to Premium! Your subscription is now active.');
      } else if (sessionStatus.__kind__ === 'failed') {
        toast.error('Payment verification failed. Please contact support.');
      }
    }
  }, [sessionStatus, queryClient]);

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
          <Loader2 className="h-20 w-20 text-[oklch(0.45_0.2_0)] mx-auto animate-spin" />
          <h1 className="text-3xl font-bold">Verifying Payment...</h1>
          <p className="text-muted-foreground">
            Please wait while we confirm your subscription.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-8 py-12 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Payment Successful!</h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Thank you for subscribing to FAITH X-Stream Premium. You now have access to all premium
          content, ad-free viewing, HD & 4K quality, and priority support.
        </p>
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => navigate({ to: '/' })}
            className="w-full bg-gradient-to-r from-[oklch(0.55_0.2_40)] to-[oklch(0.45_0.2_0)] hover:from-[oklch(0.60_0.22_40)] hover:to-[oklch(0.50_0.22_0)] text-white"
          >
            Start Watching Premium Content
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/profile' })}
            className="w-full"
          >
            View My Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
