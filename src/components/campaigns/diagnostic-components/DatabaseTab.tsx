
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, ExternalLink } from 'lucide-react';

export const DatabaseTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Database Connection</h3>
      
      <Alert className="bg-blue-50 border-blue-200">
        <Database className="h-4 w-4" />
        <AlertTitle>Database Integration</AlertTitle>
        <AlertDescription>
          <p>This application currently doesn't have a database connection.</p>
          <p className="mt-2">To enable advanced campaign storage and management features:</p>
          <ul className="list-disc pl-5 text-sm mt-1">
            <li>Click the green Supabase button in the top toolbar</li>
            <li>Connect your project to Supabase</li>
            <li>Create campaign tables to store campaign data</li>
            <li>Enable authentication to protect your campaign data</li>
          </ul>
          
          <div className="mt-3">
            <a 
              href="https://docs.lovable.dev/integrations/supabase/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center w-fit"
            >
              Learn about Supabase integration
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
