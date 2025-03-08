
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import StudentTable from '@/components/student/StudentTable';
import StatsCards from '@/components/dashboard/StatsCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimeDisplay from '@/components/settings/TimeDisplay';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="animate-pulse space-y-4 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-convocation-100"></div>
          <div className="h-4 w-48 rounded bg-convocation-100"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-convocation-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <TimeDisplay className="hidden md:flex" />
        </div>
        
        <div className="space-y-6">
          <StatsCards />
          
          <div className="glass-card rounded-lg p-4 border border-convocation-100">
            {user.role === 'super-admin' ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="robes">Robes</TabsTrigger>
                  <TabsTrigger value="folders">Folders</TabsTrigger>
                  <TabsTrigger value="presenter">Presenter</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <StudentTable role="super-admin" />
                </TabsContent>
                <TabsContent value="robes" className="mt-4">
                  <StudentTable role="robe-in-charge" />
                </TabsContent>
                <TabsContent value="folders" className="mt-4">
                  <StudentTable role="folder-in-charge" />
                </TabsContent>
                <TabsContent value="presenter" className="mt-4">
                  <StudentTable role="presenter" />
                </TabsContent>
              </Tabs>
            ) : (
              <StudentTable role={user.role as any} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
