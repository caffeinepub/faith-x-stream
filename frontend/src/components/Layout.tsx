import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import ProfileSetupModal from './ProfileSetupModal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuth } from '../hooks/useAuth';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function Layout() {
  const { identity } = useInternetIdentity();
  const { isAuthenticated } = useAuth();
  const isIIUser = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  // Show profile setup modal only for II-authenticated users who haven't set up their profile yet
  // Wait until we know for sure: actor is ready, query has completed, and profile is null
  const showProfileSetup = isIIUser && isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {showProfileSetup && (
        <ProfileSetupModal
          open={showProfileSetup}
          onClose={() => {
            // Modal will close after successful profile save via query invalidation
          }}
        />
      )}
    </div>
  );
}
