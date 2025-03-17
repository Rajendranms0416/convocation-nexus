import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StudentProvider } from "@/contexts/StudentContext";
import DeviceSelectionPrompt from "@/components/common/DeviceSelectionPrompt";
import { useIsMobile } from "@/hooks/use-mobile";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MobileDashboard = lazy(() => import("./pages/MobileDashboard"));
const DeviceLogs = lazy(() => import("./pages/DeviceLogs"));
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StudentProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<DeviceSelection />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <DeviceRouteGuard>
                      <Dashboard />
                    </DeviceRouteGuard>
                  } 
                />
                <Route 
                  path="/mobile-dashboard" 
                  element={
                    <DeviceRouteGuard>
                      <MobileDashboard />
                    </DeviceRouteGuard>
                  } 
                />
                <Route path="/device-logs" element={<DeviceLogs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </StudentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
