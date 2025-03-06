
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

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

  const demoAccounts = [
    { role: 'Robe In-charge', email: 'robe@example.com' },
    { role: 'Folder In-charge', email: 'folder@example.com' },
    { role: 'Super Admin', email: 'admin@example.com' },
    { role: 'Presenter', email: 'presenter@example.com' },
  ];

  const selectDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="your.email@example.com"
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
          For demonstration, use one of the following accounts:
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          {demoAccounts.map((account) => (
            <Button 
              key={account.email} 
              variant="outline" 
              size="sm"
              onClick={() => selectDemoAccount(account.email)}
              className="text-xs transition-normal hover:bg-convocation-100"
            >
              {account.role}
            </Button>
          ))}
        </div>
        <div className="text-xs text-center text-muted-foreground mt-2 w-full">
          All demo accounts use password: "password"
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
