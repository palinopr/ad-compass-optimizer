
import React from 'react';
import { Info } from 'lucide-react';
import { FACEBOOK_AD_PERMISSIONS } from '@/config/socialAuth';

const FacebookPermissionsInfo: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      <div className="text-xs text-gray-600">
        <p className="font-medium mb-1">Permissions we request:</p>
        <ul className="list-disc pl-4 mb-3 space-y-0.5">
          <li>Public profile (name, profile picture)</li>
          <li>Email address</li>
        </ul>
        
        <p className="font-medium mb-1">For full ad management, these additional permissions are needed:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          {Object.entries(FACEBOOK_AD_PERMISSIONS.descriptions).map(([key, desc]) => (
            <li key={key}><span className="text-blue-600">{key}</span>: {desc}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FacebookPermissionsInfo;
