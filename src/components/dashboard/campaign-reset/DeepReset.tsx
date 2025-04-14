
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Cpu } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const DeepReset: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  
  // New function for a more aggressive deep fix
  const handleDeepReset = () => {
    setIsResetting(true);
    
    try {
      console.log("Performing deep system reset and full component rebuild");
      
      // Clear ALL localStorage items that could affect rendering
      for (const key of Object.keys(localStorage)) {
        if (key.includes('campaign') || 
            key.includes('meta') || 
            key.includes('fetch') || 
            key.includes('display') || 
            key.includes('cache') || 
            key.includes('fix') ||
            key.includes('data')) {
          console.log(`Clearing localStorage item: ${key}`);
          localStorage.removeItem(key);
        }
      }
      
      // Force clear React component cache by adding special URL parameters
      localStorage.setItem('force_rebuild_timestamp', Date.now().toString());
      
      toast({
        title: "Deep System Reset",
        description: "Performing full application state rebuild. Please wait...",
        duration: 5000,
      });
      
      // Step 1: Navigate to root first to completely unmount all components
      setTimeout(() => {
        window.location.href = '/?purge=true&ts=' + Date.now();
        
        // Step 2: After a brief delay, go to campaigns with special rebuild flags
        setTimeout(() => {
          window.location.href = '/campaigns?rebuild=true&force=true&ts=' + Date.now();
        }, 1000);
      }, 1500);
    } catch (e) {
      toast({
        title: "Deep Reset Failed",
        description: "Unable to complete system reset: " + (e instanceof Error ? e.message : String(e)),
        variant: "destructive"
      });
      setIsResetting(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      disabled={isResetting}
      onClick={handleDeepReset}
    >
      {isResetting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          Deep Resetting...
        </>
      ) : (
        <>
          <Cpu className="mr-2 h-4 w-4" />
          Deep System Reset
        </>
      )}
    </Button>
  );
};
