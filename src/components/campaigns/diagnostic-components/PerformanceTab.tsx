
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, ExternalLink } from 'lucide-react';

export const PerformanceTab: React.FC = () => {
  const getSupabaseLink = () => {
    return (
      <a 
        href="https://docs.lovable.dev/integrations/supabase/" 
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline flex items-center inline-flex"
      >
        Supabase integration
        <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Performance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded p-3">
          <p className="text-xs font-medium">API Response Time</p>
          <p className="text-sm mt-1">Not measured</p>
        </div>
        
        <div className="border rounded p-3">
          <p className="text-xs font-medium">Page Load Performance</p>
          <p className="text-sm mt-1">Not measured</p>
        </div>
      </div>
      
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Performance Analysis</AlertTitle>
        <AlertDescription>
          Enable {getSupabaseLink()} to track and analyze campaign performance metrics.
        </AlertDescription>
      </Alert>
    </div>
  );
};
