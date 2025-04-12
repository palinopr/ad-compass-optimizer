
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PermissionsStatusProps {
  hasAdPermissions: boolean;
  permissions: string[];
}

const PermissionsStatus: React.FC<PermissionsStatusProps> = ({ hasAdPermissions, permissions }) => {
  return (
    <>
      <div>Permissions:</div>
      <div className="flex items-center">
        {hasAdPermissions ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">Ad Permissions Granted</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-amber-600 mr-1" />
            <span className="text-amber-600">Missing Required Permissions</span>
          </>
        )}
      </div>
      
      <div>Permission Count:</div>
      <div className="flex items-center">
        <span>{permissions.length} permissions</span>
        {permissions.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="ml-1">
                <AlertCircle className="h-3 w-3 text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-[200px]">
                  <p className="mb-1 font-medium">Granted permissions:</p>
                  <ul className="list-disc pl-4 text-xs">
                    {permissions.map(p => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </>
  );
};

export default PermissionsStatus;
