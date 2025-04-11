
import React from 'react';
import { Info } from 'lucide-react';
import { FACEBOOK_AD_PERMISSIONS } from '@/config/socialAuth';

const FacebookPermissionsInfo: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      <div className="text-xs text-gray-600">
        <p className="font-medium mb-1">Basic permissions we request:</p>
        <ul className="list-disc pl-4 mb-3 space-y-0.5">
          <li>Public profile (name, profile picture)</li>
          <li>Email address</li>
        </ul>
        
        <p className="font-medium mb-1">Advanced permissions (requires Business Integration):</p>
        <ul className="list-disc pl-4 mb-3 space-y-0.5">
          {Object.entries(FACEBOOK_AD_PERMISSIONS.descriptions).map(([permission, description]) => (
            <li key={permission}>
              <span className="font-mono text-xs bg-gray-100 px-1 rounded">{permission}</span>: {description}
            </li>
          ))}
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
