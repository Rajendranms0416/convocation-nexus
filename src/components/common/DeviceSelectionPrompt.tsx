
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Laptop, Smartphone } from 'lucide-react';

interface DeviceSelectionPromptProps {
  onSelect?: (device: 'desktop' | 'mobile') => void;
}

const DeviceSelectionPrompt: React.FC<DeviceSelectionPromptProps> = ({ onSelect }) => {
  const navigate = useNavigate();
  const [hasSelected, setHasSelected] = useState(false);

  useEffect(() => {
    // Check if user has already made a device selection
    const devicePreference = localStorage.getItem('devicePreference');
    if (devicePreference) {
      // If preference exists, set hasSelected to true
      setHasSelected(true);
      // Redirect to login with device preference param
      navigate(`/login?device=${devicePreference}`, { replace: true });
    }
  }, [navigate]);

  const handleDeviceSelection = (device: 'desktop' | 'mobile') => {
    console.log('Device selected:', device);
    // Save preference to localStorage
    localStorage.setItem('devicePreference', device);
    // Set hasSelected to prevent re-rendering
    setHasSelected(true);
    // Call the onSelect prop if provided
    if (onSelect) {
      onSelect(device);
    }
    // Navigate to login with device preference and force a reload
    navigate(`/login?device=${device}`, { replace: true });
  };

  // If user has already selected, don't render the prompt
  if (hasSelected) return null;

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome to Convocation Nexus</CardTitle>
        <CardDescription className="text-center">
          Choose your preferred interface
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 pt-6">
        <Button 
          variant="outline" 
          className="h-32 flex flex-col items-center justify-center gap-3 hover:border-convocation-accent hover:bg-convocation-50"
          onClick={() => handleDeviceSelection('desktop')}
        >
          <Laptop className="h-10 w-10" />
          <span className="font-medium">Desktop View</span>
        </Button>
        <Button 
          variant="outline"
          className="h-32 flex flex-col items-center justify-center gap-3 hover:border-convocation-accent hover:bg-convocation-50"
          onClick={() => handleDeviceSelection('mobile')}
        >
          <Smartphone className="h-10 w-10" />
          <span className="font-medium">Mobile View</span>
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <p className="text-xs text-center text-muted-foreground">
          You can change this preference later in settings
        </p>
      </CardFooter>
    </Card>
  );
};

export default DeviceSelectionPrompt;
