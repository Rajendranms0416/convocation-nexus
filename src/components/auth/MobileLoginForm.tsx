
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Smartphone } from 'lucide-react';

const MobileLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
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
        <div className="text-sm text-muted-foreground text-center w-full">
          Demo accounts (password: "password"):
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
