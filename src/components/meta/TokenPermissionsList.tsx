
import React from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface TokenPermissionsListProps {
  required?: string[];
}

const TokenPermissionsList: React.FC<TokenPermissionsListProps> = ({ 
  required = ['ads_management', 'ads_read'] 
}) => {
  const permissions = metaAuthService.getPermissions();
  
  // Check if all required permissions are granted
  const hasAllRequired = required.every(p => permissions.includes(p));
  
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {permissions.length > 0 ? (
          permissions.map(permission => (
            <Badge 
              key={permission} 
              variant={required.includes(permission) ? "default" : "outline"}
              className="px-2 py-1"
            >
              {permission}
            </Badge>
          ))
        ) : (
          <div className="text-gray-500 text-sm italic">No specific permissions stored</div>
        )}
      </div>
      
      {!hasAllRequired && required.length > 0 && permissions.length > 0 && (
        <div className="flex items-start space-x-2 text-amber-600 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            Missing some recommended permissions. Some features might be limited.
          </span>
        </div>
      )}
      
      {permissions.length === 0 && (
        <div className="flex items-start space-x-2 text-gray-500 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            No permission data available. This might be from an older connection method.
          </span>
        </div>
      )}
    </div>
  );
};

export default TokenPermissionsList;
