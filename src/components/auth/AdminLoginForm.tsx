
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, InfoIcon, ShieldAlert } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SUPER_ADMIN_EMAIL } from '@/types/auth';

const AdminLoginForm: React.FC = () => {
  const [email, setEmail] = useState(SUPER_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const trimmedEmail = email.trim();
      console.log('Submitting admin login with email:', trimmedEmail);
      
      await login(trimmedEmail, password, 'desktop', 'admin');
    } catch (error) {
      console.error('Admin login failed', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg glass-card animate-fade-in">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <ShieldAlert className="h-6 w-6 mr-2 text-red-500" />
          <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
        </div>
        <CardDescription className="text-center">
          Sign in to manage teacher roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <InfoIcon className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700">Admin Access Only</AlertTitle>
          <AlertDescription className="text-amber-600 text-sm">
            This area is restricted to administrators who manage teacher roles and assignments.
            <br />
            <span className="text-xs italic mt-1 block">
              Default admin credentials will be provided by your system administrator
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
            <Label htmlFor="admin-email">Admin Email</Label>
            <Input 
              id="admin-email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="transition-normal"
              disabled
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="admin-password">Password</Label>
            </div>
            <Input 
              id="admin-password" 
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
            className="w-full transition-normal bg-amber-600 hover:bg-amber-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Access Admin Area'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-center text-muted-foreground">
          For administrator use only. All access attempts are logged.
        </p>
      </CardFooter>
    </Card>
  );
};

export default AdminLoginForm;
