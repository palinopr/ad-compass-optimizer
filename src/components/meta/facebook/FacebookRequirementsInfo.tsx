
import React from 'react';
import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { FACEBOOK_LOGIN_REQUIREMENTS } from '@/config/socialAuth';

const FacebookRequirementsInfo: React.FC = () => {
  return (
    <div className="w-full space-y-3 text-xs">
      <div className="flex items-center text-gray-800">
        <Info className="h-4 w-4 mr-1.5 text-blue-600" />
        <span className="font-medium">Required Facebook App Settings:</span>
      </div>
      
      <ul className="list-disc pl-5 space-y-1 text-gray-600">
        {FACEBOOK_LOGIN_REQUIREMENTS.requiredSettings.map((setting, index) => (
          <li key={index}>{setting}</li>
        ))}
      </ul>
      
      <div className="flex flex-wrap gap-2 mt-2">
        <Link 
          to="/privacy-policy"
          className="text-blue-600 hover:underline flex items-center"
        >
          Privacy Policy
          <ExternalLink className="h-3 w-3 ml-0.5" />
        </Link>
        
        <Link 
          to="/terms-of-service"
          className="text-blue-600 hover:underline flex items-center"
        >
          Terms of Service
          <ExternalLink className="h-3 w-3 ml-0.5" />
        </Link>
      </div>
    </div>
  );
};

export default FacebookRequirementsInfo;
