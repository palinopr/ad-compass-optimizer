
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';

interface ConnectionStatusCardsProps {
  diagnosticResults: any;
}

export const ConnectionStatusCards: React.FC<ConnectionStatusCardsProps> = ({ diagnosticResults }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Auth Status */}
      <div className={`border rounded p-3 ${diagnosticResults.token.hasToken ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <p className="text-xs font-medium">Authentication</p>
        <p className="text-sm mt-1">
          {diagnosticResults.token.hasToken 
            ? `Using ${metaAuthService.getTokenSource() || 'unknown'} auth`
            : "Not authenticated"}
        </p>
      </div>
      
      <div className={`border rounded p-3 ${(diagnosticResults.token.hasAdsRead || diagnosticResults.token.hasAdsManagement) ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <p className="text-xs font-medium">Permissions</p>
        <p className="text-sm mt-1">
          {(diagnosticResults.token.hasAdsRead || diagnosticResults.token.hasAdsManagement) 
            ? "Required permissions present" 
            : "Missing required permissions"}
        </p>
      </div>
      
      <div className={`border rounded p-3 ${diagnosticResults.api.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <p className="text-xs font-medium">API Connection</p>
        <p className="text-sm mt-1">
          {diagnosticResults.api.success 
            ? "API connection successful" 
            : "API connection failed"}
        </p>
      </div>
    </div>
  );
};
