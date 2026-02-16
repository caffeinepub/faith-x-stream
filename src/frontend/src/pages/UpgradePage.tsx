import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Crown, Check, ArrowLeft, Sparkles, Zap, Shield, Star, Loader2 } from 'lucide-react';
import { useCreateCheckoutSession, useIsStripeConfigured, useIsCallerAdmin } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { ShoppingItem } from '../backend';

export default function UpgradePage() {
  const navigate = useNavigate();
  const { data: isStripeConfigured, isLoading: configLoading } = useIsStripeConfigured();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const createCheckout = useCreateCheckoutSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdminWithPremium = !!isAdmin;

  // Redirect admin users away from upgrade page
  useEffect(() => {
    if (isAdminWithPremium && !adminLoading) {
      toast.info('Admin users have automatic premium access');
      navigate({ to: '/' });
    }
  }, [isAdminWithPremium, adminLoading, navigate]);

  const features = [
    { icon: Crown, text: 'Unlimited access to all premium content' },
    { icon: Zap, text: 'Ad-free viewing experience' },
    { icon: Star, text: 'Exclusive originals and early releases' },
    { icon: Shield, text: 'HD and 4K streaming quality' },
    { icon: Sparkles, text: 'Priority customer support' },
  ];

  const handleUpgrade = async () => {
    if (!isStripeConfigured) {
      toast.error('Payment system is not configured yet. Please contact support.');
      return;
    }

    setIsProcessing(true);
    try {
      const premiumItem: ShoppingItem = {
        productName: 'FAITH X-Stream Premium',
        productDescription: 'Monthly premium subscription with unlimited access to all content, ad-free viewing, HD/4K quality, and priority support',
        priceInCents: BigInt(999), // $9.99
        currency: 'USD',
        quantity: BigInt(1),
      };

      const session = await createCheckout.mutateAsync([premiumItem]);
      
      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  // Show loading while checking admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-[oklch(0.15_0.05_0)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.45_0.2_0)]" />
      </div>
    );
  }

  // Don't render if admin (will redirect)
  if (isAdminWithPremium) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-[oklch(0.15_0.05_0)]">
      <div className="container px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-6 hover:bg-accent transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-8 md:mb-12 space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[oklch(0.55_0.2_40)] to-[oklch(0.45_0.2_0)] mb-4 animate-scale-in">
            <Crown className="h-10 w-10 md:h-12 md:w-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[oklch(0.55_0.2_40)] via-[oklch(0.50_0.22_20)] to-[oklch(0.45_0.2_0)] bg-clip-text text-transparent">
            Upgrade to Premium
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock the full FAITH X‑Stream experience with unlimited access to all content
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2 mb-8 md:mb-12">
          {/* Free Plan */}
          <Card className="border-border/50 hover:border-border transition-all duration-300 animate-slide-in-left">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Free</CardTitle>
              <CardDescription>Basic access to selected content</CardDescription>
              <div className="pt-4">
                <span className="text-3xl md:text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Limited content library</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Standard definition streaming</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Ad-supported viewing</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-[oklch(0.45_0.2_0)] bg-gradient-to-br from-card to-[oklch(0.15_0.05_0)] shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-in-right relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-[oklch(0.55_0.2_40)] to-[oklch(0.45_0.2_0)] text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
              RECOMMENDED
            </div>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Crown className="h-6 w-6 text-[oklch(0.45_0.2_0)]" />
                Premium
              </CardTitle>
              <CardDescription>Full access to everything</CardDescription>
              <div className="pt-4">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[oklch(0.55_0.2_40)] to-[oklch(0.45_0.2_0)] bg-clip-text text-transparent">
                  $9.99
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-[oklch(0.45_0.2_0)] mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-gradient-to-r from-[oklch(0.55_0.2_40)] to-[oklch(0.45_0.2_0)] hover:from-[oklch(0.60_0.22_40)] hover:to-[oklch(0.50_0.22_0)] text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={handleUpgrade}
                disabled={isProcessing || configLoading || !isStripeConfigured}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </>
                )}
              </Button>
              {!isStripeConfigured && !configLoading && (
                <p className="text-xs text-center text-muted-foreground">
                  Payment system configuration in progress
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-8 md:mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">What You'll Get with Premium</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-border/50 hover:border-[oklch(0.45_0.2_0)] transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[oklch(0.55_0.2_40)] to-[oklch(0.45_0.2_0)] mb-4">
                    <feature.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  </div>
                  <p className="text-sm font-medium">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
