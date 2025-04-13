
import React from 'react';

interface PermissionErrorProps {
  isPermissionError: boolean;
}

const PermissionError: React.FC<PermissionErrorProps> = ({ isPermissionError }) => {
  if (!isPermissionError) {
    return null;
  }
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3">
      <p className="text-sm text-red-700 font-medium">Permission Error Detected</p>
      <p className="text-sm text-red-600 mt-1">
        Your account doesn't have permission to access this ad account's data. 
        Try selecting a different ad account or log in with a Facebook account that has admin access to your ads.
      </p>
    </div>
  );
};

export default PermissionError;
