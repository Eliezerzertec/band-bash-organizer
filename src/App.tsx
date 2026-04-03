import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";

// Pages (lazy loading por rota)
const Login = lazy(() => import("./pages/Login"));
const MusicianSignup = lazy(() => import("./pages/MusicianSignup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MemberDashboard = lazy(() => import("./pages/MemberDashboard"));
const Churches = lazy(() => import("./pages/Churches"));
const Ministries = lazy(() => import("./pages/Ministries"));
const Members = lazy(() => import("./pages/Members"));
const MemberSchedulesAdmin = lazy(() => import("./pages/MemberSchedulesAdmin"));
const Teams = lazy(() => import("./pages/Teams"));
const TeamForm = lazy(() => import("./pages/TeamForm"));
const Schedules = lazy(() => import("./pages/Schedules"));
const MySchedules = lazy(() => import("./pages/MySchedules"));
const Substitutions = lazy(() => import("./pages/Substitutions"));
const PeerEvaluations = lazy(() => import("./pages/PeerEvaluations"));
const Messages = lazy(() => import("./pages/Messages"));
const Reports = lazy(() => import("./pages/Reports"));
const DetailedReports = lazy(() => import("./pages/DetailedReports"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient();

function RouteLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !hasRole('admin')) {
    return <Navigate to="/member-dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirects to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={hasRole('admin') ? '/dashboard' : '/member-dashboard'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { hasRole, isAuthenticated } = useAuth();
  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (!isAuthenticated) return;

    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;

    if (connection?.saveData || (connection?.effectiveType ?? '').includes('2g')) {
      return;
    }

    const preloadRoutes = () => {
      void import('./pages/Messages');
      void import('./pages/Profile');

      if (isAdmin) {
        void import('./pages/Schedules');
        void import('./pages/Reports');
        void import('./pages/DetailedReports');
      } else {
        void import('./pages/MySchedules');
        void import('./pages/Substitutions');
      }
    };

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => preloadRoutes(), { timeout: 2000 });
    } else {
      timeoutId = setTimeout(preloadRoutes, 1200);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [isAuthenticated, isAdmin]);

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/cadastro-musico" element={
        <PublicRoute>
          <MusicianSignup />
        </PublicRoute>
      } />
      
      {/* Root redirect - condicional baseado no role */}
      <Route path="/" element={
        isAdmin ? <Navigate to="/dashboard" replace /> : <Navigate to="/member-dashboard" replace />
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute adminOnly>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/member-dashboard" element={
        <ProtectedRoute>
          <MemberDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/churches" element={
        <ProtectedRoute adminOnly>
          <Churches />
        </ProtectedRoute>
      } />
      
      <Route path="/ministries" element={
        <ProtectedRoute adminOnly>
          <Ministries />
        </ProtectedRoute>
      } />
      
      <Route path="/members" element={
        <ProtectedRoute adminOnly>
          <Members />
        </ProtectedRoute>
      } />

      <Route path="/members/:memberId/schedules" element={
        <ProtectedRoute adminOnly>
          <MemberSchedulesAdmin />
        </ProtectedRoute>
      } />
      
      <Route path="/teams" element={
        <ProtectedRoute adminOnly>
          <Teams />
        </ProtectedRoute>
      } />
      
      <Route path="/teams/new" element={
        <ProtectedRoute adminOnly>
          <TeamForm />
        </ProtectedRoute>
      } />

      <Route path="/teams/:teamId/edit" element={
        <ProtectedRoute adminOnly>
          <TeamForm />
        </ProtectedRoute>
      } />
      
      <Route path="/schedules" element={
        <ProtectedRoute>
          {isAdmin ? <Schedules /> : <MySchedules />}
        </ProtectedRoute>
      } />
      
      <Route path="/substitutions" element={
        <ProtectedRoute>
          <Substitutions />
        </ProtectedRoute>
      } />

      <Route path="/peer-evaluations" element={
        <ProtectedRoute>
          <PeerEvaluations />
        </ProtectedRoute>
      } />
      
      <Route path="/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute adminOnly>
          <Reports />
        </ProtectedRoute>
      } />

      <Route path="/reports/detailed" element={
        <ProtectedRoute adminOnly>
          <DetailedReports />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
