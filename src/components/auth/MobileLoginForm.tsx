
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Smartphone, InfoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MobileLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password, 'mobile');
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg glass-card animate-fade-in">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <Smartphone className="h-6 w-6 mr-2 text-convocation-accent" />
          <CardTitle className="text-xl font-bold">Mobile Login</CardTitle>
        </div>
        <CardDescription className="text-center">
          Optimized for quick attendance tracking
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
            <Label htmlFor="password">Password</Label>
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
      <CardFooter className="flex flex-col space-y-3">
        <div className="text-xs text-center text-muted-foreground mt-2 w-full">
          Accompanying Teachers: <span className="font-medium">Robe In-charge</span> role
          <br />
          Folder in Charge: <span className="font-medium">Folder In-charge</span> role
        </div>
        <Button
          variant="link" 
          size="sm" 
          className="text-xs text-muted-foreground mt-2"
          onClick={() => {
            localStorage.removeItem('devicePreference');
            window.location.href = '/';
          }}
        >
          Switch to desktop view
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MobileLoginForm;
