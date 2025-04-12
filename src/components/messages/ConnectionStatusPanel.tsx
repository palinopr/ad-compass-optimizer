
import React from 'react';

interface ConnectionStatusPanelProps {
  isAuthenticated: boolean;
  adAccounts: any[];
}

const ConnectionStatusPanel: React.FC<ConnectionStatusPanelProps> = ({ 
  isAuthenticated, 
  adAccounts 
}) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
      <h3 className="text-sm font-medium mb-2">Connection Status</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Authentication:</div>
        <div className={isAuthenticated ? "text-green-600" : "text-red-600"}>
          {isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </div>
        
        <div>Ad Account:</div>
        <div className={adAccounts.length > 0 ? "text-green-600" : "text-red-600"}>
          {adAccounts.length > 0 ? `Selected (${adAccounts.length})` : "Not Selected"}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatusPanel;
