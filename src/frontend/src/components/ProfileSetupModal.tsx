import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { isAuthenticated, authMethod } = useAuth();
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show modal for Internet Identity users who need to complete email
    if (isAuthenticated && isFetched && authMethod === 'internet-identity') {
      const needsEmail = userProfile && !userProfile.email;
      setIsOpen(!!needsEmail);
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, userProfile, profileLoading, isFetched, authMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!userProfile) return;

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        email: email.trim(),
      });
      toast.success('Profile updated successfully!');
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  // Only render for Internet Identity users
  if (!isAuthenticated || authMethod !== 'internet-identity') return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-[#1a0000] border-2 border-[#660000]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <img
              src="/assets/F.A.I.T.H.X-Stream(Transparent-White).png"
              alt="FAITH X-Stream"
              className="h-16 w-auto"
            />
          </div>
          <DialogTitle className="text-2xl text-white text-center">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-white/70 text-center">
            Please provide your email address to complete your profile setup
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#330000] border-[#660000] text-white placeholder:text-white/50 focus:border-[#cc0000]"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#cc0000] hover:bg-[#990000] text-white font-bold transition-all duration-300"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Saving...' : 'Complete Setup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
