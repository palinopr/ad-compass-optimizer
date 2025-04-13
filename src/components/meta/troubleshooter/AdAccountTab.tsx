
import React from 'react';
import { Briefcase } from 'lucide-react';
import AdAccountSelector from '../ad-accounts/AdAccountSelector';

const AdAccountTab: React.FC = () => {
  return (
    <div className="bg-white border rounded-md p-4">
      <h3 className="font-medium flex items-center mb-2">
        <Briefcase className="h-4 w-4 mr-2" />
        Ad Account Selection
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Make sure you've selected the correct ad account that contains your campaigns.
      </p>
      
      <AdAccountSelector />
    </div>
  );
};

export default AdAccountTab;
