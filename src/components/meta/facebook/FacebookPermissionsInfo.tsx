
import React from 'react';
import { Info } from 'lucide-react';

const FacebookPermissionsInfo: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      <div className="text-xs text-gray-600">
        <p className="font-medium mb-1">Permissions we request:</p>
        <ul className="list-disc pl-4 mb-3 space-y-0.5">
          <li>Public profile (name, profile picture)</li>
          <li>Email address</li>
        </ul>
        
        <p className="text-sm mt-2">
          Your Meta App is configured with the following use cases:
        </p>
        <ul className="list-disc pl-4 space-y-0.5 mt-1">
          <li>Authenticate and request data from users with Facebook Login</li>
          <li>Create & manage app ads with Meta Ads Manager</li>
        </ul>
      </div>
    </div>
  );
};

export default FacebookPermissionsInfo;
