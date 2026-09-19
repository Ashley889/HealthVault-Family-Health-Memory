import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import DashboardPage from '@/pages/dashboard';
import TimelinePage from '@/pages/timeline';
import ProfilesPage from '@/pages/profiles';
import ProfileDetailPage from '@/pages/profile-detail';
import SummaryPage from '@/pages/summary';
import RemindersPage from '@/pages/reminders';
import { HealthVaultShell } from '@/components/HealthVaultShell';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <HealthVaultShell>
        <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/timeline" component={TimelinePage} />
        <Route path="/profiles" component={ProfilesPage} />
        <Route path="/profiles/:profileId" component={ProfileDetailPage} />
        <Route path="/summary/:profileId" component={SummaryPage} />
        <Route path="/reminders" component={RemindersPage} />
        <Route component={NotFound} />
        </Switch>
      </HealthVaultShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
