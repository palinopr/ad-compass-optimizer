
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Database, ExternalLink } from 'lucide-react';

interface SystemStatusAlertProps {
  systemStatus: string;
}

export const SystemStatusAlert: React.FC<SystemStatusAlertProps> = ({ systemStatus }) => {
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
    <div className="mb-4">
      <Alert 
        className={
          systemStatus === 'healthy' ? "border-green-200 bg-green-50" : 
          systemStatus === 'no-database' ? "border-amber-200 bg-amber-50" :
          "border-red-200 bg-red-50"
        }
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>System Status: {systemStatus === 'healthy' ? 'Healthy' : 'Issues Detected'}</AlertTitle>
        <AlertDescription>
          {systemStatus === 'healthy' && "All systems operational. Your campaign system is working correctly."}
          {systemStatus === 'not-authenticated' && "You're not authenticated with Meta. Please connect your account."}
          {systemStatus === 'permission-issue' && "Your Meta account is missing required permissions."}
          {systemStatus === 'api-error' && "Unable to connect to Meta API. Check your connection settings."}
          {systemStatus === 'no-database' && (
            <div className="space-y-2">
              <p>No database connection detected. Some campaign features may be limited.</p>
              <div className="flex items-start gap-2 mt-2">
                <Database className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  To enable full functionality like campaign storage and user management, 
                  connect to {getSupabaseLink()} using the green button in the top toolbar.
                </span>
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
