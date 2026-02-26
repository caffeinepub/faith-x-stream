import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container px-4 md:px-8 py-12 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md">
        <XCircle className="h-20 w-20 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold">Payment Failed</h1>
        <p className="text-muted-foreground">
          We couldn't process your payment. Please try again or contact support if the problem
          persists.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate({ to: '/' })}>
            Go Home
          </Button>
          <Button
            onClick={() => navigate({ to: '/admin' })}
            className="bg-[oklch(0.45_0.2_0)] hover:bg-[oklch(0.50_0.22_0)]"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
