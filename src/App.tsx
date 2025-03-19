
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
    if (!isLoading && !isAuthenticated && location.pathname !== '/login' && location.pathname !== '/') {
      navigate('/login', { replace: true });
    }
    
    // Redirect to appropriate dashboard based on role
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'super-admin' && location.pathname === '/login') {
        navigate('/role-assignment', { replace: true });
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
                <RoleAssignment />
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
