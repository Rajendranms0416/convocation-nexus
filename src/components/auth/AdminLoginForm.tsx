
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminLoginForm = () => {
  const [email, setEmail] = useState('admin@example.com'); // Default to admin email for convenience
  const [password, setPassword] = useState('password123');
  const { login, isLoading, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      console.log('Attempting admin login...');
      await login(email, password, 'desktop', 'admin');
      console.log('Admin login complete');
      
      // Short delay to allow state to update
      setTimeout(() => {
        if (localStorage.getItem('convocation_user')) {
          const userObj = JSON.parse(localStorage.getItem('convocation_user') || '{}');
          if (userObj?.role === 'super-admin') {
            console.log('Redirecting admin to role assignment page');
            navigate('/role-assignment');
          }
        }
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-xl shadow-lg">
      <div className="space-y-2 text-center mb-6">
        <h1 className="text-2xl font-bold">Role Management Login</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the role management system
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            placeholder="admin@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-convocation-700 hover:bg-convocation-800"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          'Sign In to Manage Roles'
        )}
      </Button>
      
      <div className="mt-4 text-center text-sm">
        <p className="text-muted-foreground">
          Access to role management is restricted to super administrators.
        </p>
      </div>
    </form>
  );
};

export default AdminLoginForm;
