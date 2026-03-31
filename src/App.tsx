import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";

// Pages
import Login from "./pages/Login";
import MusicianSignup from "./pages/MusicianSignup";
import Dashboard from "./pages/Dashboard";
import MemberDashboard from "./pages/MemberDashboard";
import Churches from "./pages/Churches";
import Ministries from "./pages/Ministries";
import Members from "./pages/Members";
import MemberSchedulesAdmin from "./pages/MemberSchedulesAdmin";
import Teams from "./pages/Teams";
import TeamForm from "./pages/TeamForm";
import Schedules from "./pages/Schedules";
import MySchedules from "./pages/MySchedules";
import Substitutions from "./pages/Substitutions";
import Messages from "./pages/Messages";
import Reports from "./pages/Reports";
import DetailedReports from "./pages/DetailedReports";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={hasRole('admin') ? '/dashboard' : '/member-dashboard'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  return (
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
