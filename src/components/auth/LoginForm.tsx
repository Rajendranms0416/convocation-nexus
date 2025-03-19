
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, InfoIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting login with email:', email);
      
      // Verify if the email is in the Teacher's List table first
      const { data: teacherData, error: teacherError } = await supabase
        .from('Teacher\'s List')
        .select('*')
        .or(`"Robe Email ID".eq.${email},"Folder Email ID".eq.${email}`);
      
      if (teacherError) {
        console.error('Error checking teacher list:', teacherError);
        throw new Error('Error verifying teacher credentials. Please try again.');
      }
      
      // If email is found in the teacher list, proceed with login
      if (teacherData && teacherData.length > 0) {
        console.log('Teacher found in database:', teacherData[0]);
        // Pass 'desktop' as the third argument for device type
        await login(email, password, 'desktop');
      } else {
        console.error('Email not found in teacher list');
        throw new Error('Email not recognized. Please check if you are using the correct email address.');
      }
    } catch (error) {
      console.error('Login failed', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg glass-card animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Convocation Nexus</CardTitle>
        <CardDescription className="text-center">
          Sign in to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Authentication Info</AlertTitle>
          <AlertDescription className="text-blue-600 text-sm">
            Your email is your name (lowercase with dots): <span className="font-medium">firstname.lastname@convocation.edu</span>
            <br />
            Default password: <span className="font-medium">password123</span>
            <br />
            <span className="text-xs italic mt-1 block">
              Note: First-time users will be automatically registered
            </span>
          </AlertDescription>
        </Alert>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="firstname.lastname@convocation.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="transition-normal"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="transition-normal"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full transition-normal"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground text-center w-full">
          First time? Don't worry, your account will be created automatically
        </div>
        <div className="text-xs text-center text-muted-foreground mt-2 w-full">
          Accompanying Teachers: <span className="font-medium">Robe In-charge</span> role
          <br />
          Folder in Charge: <span className="font-medium">Folder In-charge</span> role
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
