
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, InfoIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Pass 'desktop' as the third argument for device type
      await login(email, password, 'desktop');
    } catch (error) {
      console.error('Login failed', error);
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
          </AlertDescription>
        </Alert>
        
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
          If you're listed in the Teacher's List, an account has been created for you
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
