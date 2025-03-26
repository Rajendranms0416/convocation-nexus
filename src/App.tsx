import React, { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StudentProvider } from "@/contexts/StudentContext";
import DeviceSelectionPrompt from "@/components/common/DeviceSelectionPrompt";
import { useIsMobile } from "@/hooks/use-mobile";
import { setupDatabase } from "@/utils/databaseHelper";

// Initialize database on app load
setupDatabase().catch(console.error);

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MobileDashboard = lazy(() => import("./pages/MobileDashboard"));
const DeviceLogs = lazy(() => import("./pages/DeviceLogs"));
const RoleAssignment = lazy(() => import("./pages/RoleAssignment"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-pulse space-y-4 flex flex-col items-center">
      <div className="h-12 w-12 rounded-full bg-convocation-100"></div>
      <div className="h-4 w-48 rounded bg-convocation-100"></div>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5, // 5 minutes
      staleTime: 1000 * 60 * 2, // 2 minutes - added for performance
    },
  },
});

const DeviceSelection = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-convocation-50 px-4">
      <DeviceSelectionPrompt />
    </div>
  );
};

// Authentication guard component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Debug logs
    console.log("AuthGuard effect running");
    console.log("isLoading:", isLoading, "isAuthenticated:", isAuthenticated);
    console.log("Current user:", user);
    console.log("Current path:", location.pathname);
    
    if (!isLoading) {
      if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/') {
        console.log("Not authenticated, redirecting to login page");
        navigate('/login', { replace: true });
      } else if (isAuthenticated && user) {
        console.log("User is authenticated with role:", user.role);
        
        // Role-based redirects
        if (user.role === 'super-admin' && location.pathname === '/login') {
          navigate('/role-assignment', { replace: true });
        }
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, user]);
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  return <>{children}</>;
};

// Device route guard
const DeviceRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const devicePreference = localStorage.getItem('devicePreference');
  
  if (!devicePreference) {
    return <Navigate to="/" replace />;
  }
  
  if (devicePreference === 'mobile' && window.location.pathname === '/dashboard') {
    return <Navigate to="/mobile-dashboard" replace />;
  }
  
  if (devicePreference === 'desktop' && window.location.pathname === '/mobile-dashboard') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Super Admin route guard
const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.role !== 'super-admin') {
      console.log("User is not super-admin, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<DeviceSelection />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard>
                <DeviceRouteGuard>
                  <Dashboard />
                </DeviceRouteGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/mobile-dashboard" 
            element={
              <AuthGuard>
                <DeviceRouteGuard>
                  <MobileDashboard />
                </DeviceRouteGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/device-logs" 
            element={
              <AuthGuard>
                <DeviceLogs />
              </AuthGuard>
            } 
          />
          <Route 
            path="/role-assignment" 
            element={
              <AuthGuard>
                <SuperAdminGuard>
                  <RoleAssignment />
                </SuperAdminGuard>
              </AuthGuard>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StudentProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </StudentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
