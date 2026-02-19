import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import HomePage from './pages/HomePage';
import LivePage from './pages/LivePage';
import OriginalsPage from './pages/OriginalsPage';
import MoviesPage from './pages/MoviesPage';
import TVShowsPage from './pages/TVShowsPage';
import SeriesDetailPage from './pages/SeriesDetailPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import EpisodePlayerPage from './pages/EpisodePlayerPage';
import ClipsPage from './pages/ClipsPage';
import NetworksPage from './pages/NetworksPage';
import BrandDetailPage from './pages/BrandDetailPage';
import ProfilePage from './pages/ProfilePage';
import UpgradePage from './pages/UpgradePage';
import AdminPage from './pages/AdminPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import SearchResultsPage from './pages/SearchResultsPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './hooks/useAuth';

const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/live',
  component: LivePage,
});

const originalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/originals',
  component: OriginalsPage,
});

const moviesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/movies',
  component: MoviesPage,
});

const tvShowsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tv-shows',
  component: TVShowsPage,
});

const clipsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clips',
  component: ClipsPage,
});

const networksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/networks',
  component: NetworksPage,
});

const brandDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/networks/$brandId',
  component: BrandDetailPage,
});

const seriesDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/series/$seriesId',
  component: SeriesDetailPage,
});

const videoPlayerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/watch/$contentId',
  component: VideoPlayerPage,
});

const episodePlayerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/watch-episode/$seriesId/$seasonId/$episodeId',
  component: EpisodePlayerPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const upgradeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upgrade',
  component: UpgradePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchResultsPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
    };
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  liveRoute,
  originalsRoute,
  moviesRoute,
  tvShowsRoute,
  clipsRoute,
  networksRoute,
  brandDetailRoute,
  seriesDetailRoute,
  videoPlayerRoute,
  episodePlayerRoute,
  profileRoute,
  upgradeRoute,
  adminRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  searchRoute,
  loginRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
