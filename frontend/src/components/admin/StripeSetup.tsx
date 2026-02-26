import { useState, useEffect } from 'react';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function StripeSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    try {
      const allowedCountries = countries.split(',').map((c) => c.trim());
      await setConfig.mutateAsync({ secretKey, allowedCountries });
      toast.success('Stripe configured successfully!');
      setSecretKey('');
    } catch (error) {
      toast.error('Failed to configure Stripe');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isConfigured ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Stripe Configured
            </CardTitle>
            <CardDescription>
              Your Stripe payment integration is active and ready to accept payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              To update your Stripe configuration, please enter your new credentials below.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configure Stripe</CardTitle>
            <CardDescription>
              Set up Stripe to enable premium subscriptions and payments
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stripe Configuration</CardTitle>
          <CardDescription>Enter your Stripe API credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretKey">Stripe Secret Key *</Label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_test_..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Find your secret key in your Stripe Dashboard
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="countries">Allowed Countries *</Label>
              <Input
                id="countries"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="US,CA,GB"
                required
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of country codes (e.g., US,CA,GB)
              </p>
            </div>

            <Button
              type="submit"
              disabled={setConfig.isPending}
              className="bg-[oklch(0.45_0.2_0)] hover:bg-[oklch(0.50_0.22_0)]"
            >
              {setConfig.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Configuring...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
