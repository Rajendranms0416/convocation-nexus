
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-convocation-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Convocation Nexus</CardTitle>
          <CardDescription className="text-center">
            Welcome to the Convocation Management System
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-medium">Please select your device type:</h3>
            <p className="text-sm text-muted-foreground">
              This will optimize your experience based on the device you're using.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center border-2"
              onClick={() => {
                localStorage.setItem('devicePreference', 'desktop');
                window.location.href = '/login?device=desktop';
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
              Desktop Device
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center border-2"
              onClick={() => {
                localStorage.setItem('devicePreference', 'mobile');
                window.location.href = '/login?device=mobile';
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
              Mobile Device
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-muted-foreground w-full">
            Convocation Nexus helps manage the convocation ceremony efficiently
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
