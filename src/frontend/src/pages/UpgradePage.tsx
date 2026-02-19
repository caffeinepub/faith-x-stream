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
        productDescription: 'Monthly premium subscription with unlimited access',
        priceInCents: BigInt(999),
        currency: 'usd',
        quantity: BigInt(1),
      };

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;

      const session = await createCheckout.mutateAsync({
        items: [premiumItem],
        successUrl,
        cancelUrl,
      });

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout process');
      setIsProcessing(false);
    }
  };

  if (configLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1a0000] to-black">
      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#cc0000] to-[#ff6666] bg-clip-text text-transparent">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-white/70">
            Unlock the full FAITH X-Stream experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="bg-gradient-to-br from-[#1a0000] to-[#330000] border-2 border-[#660000]">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                Free
              </CardTitle>
              <CardDescription className="text-white/70">
                Basic access to content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-white">$0<span className="text-lg text-white/70">/month</span></div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-[#cc0000] mt-0.5 flex-shrink-0" />
                  <span className="text-white/80">Limited content library</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-[#cc0000] mt-0.5 flex-shrink-0" />
                  <span className="text-white/80">Standard definition streaming</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-[#cc0000] mt-0.5 flex-shrink-0" />
                  <span className="text-white/80">Ad-supported viewing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="bg-gradient-to-br from-[#330000] to-[#660000] border-2 border-[#cc0000] relative overflow-hidden">
            <Badge className="absolute top-4 right-4 bg-[#cc0000] text-white">
              RECOMMENDED
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Crown className="h-6 w-6 text-[#cc0000]" />
                Premium
              </CardTitle>
              <CardDescription className="text-white/70">
                Full access to everything
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-3xl font-bold text-white">$9.99<span className="text-lg text-white/70">/month</span></div>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <feature.icon className="h-5 w-5 text-[#cc0000] mt-0.5 flex-shrink-0" />
                    <span className="text-white">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleUpgrade}
                disabled={isProcessing || !isStripeConfigured}
                className="w-full bg-gradient-to-r from-[#cc0000] to-[#ff0000] hover:from-[#990000] hover:to-[#cc0000] text-white font-bold py-6 text-lg transition-all duration-300"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Upgrade Now
                  </>
                )}
              </Button>
              {!isStripeConfigured && (
                <p className="text-sm text-center text-yellow-500">
                  Payment system is being configured. Please check back soon.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
