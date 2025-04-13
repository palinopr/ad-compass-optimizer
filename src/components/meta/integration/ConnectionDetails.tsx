
import React from 'react';
import { metaAuthService } from '@/services/MetaAuthService';

const ConnectionDetails: React.FC = () => {
  const userId = metaAuthService.getUserId() || 'Unknown';
  const tokenSource = metaAuthService.getTokenSource();
  
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="font-medium">User ID:</div>
        <div>{userId}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="font-medium">Connection Method:</div>
        <div className="capitalize">{tokenSource}</div>
      </div>
    </div>
  );
};

export default ConnectionDetails;
