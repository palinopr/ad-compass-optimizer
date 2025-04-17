
import React from 'react';
import { Button } from '@/components/ui/button';

interface CampaignControlsProps {
  onResetDefault: () => void;
  onForceMaximum: () => void;
}

const CampaignControls: React.FC<CampaignControlsProps> = ({
  onResetDefault,
  onForceMaximum
}) => {
  return (
    <div className="mt-8 text-center">
      <button 
        onClick={onResetDefault}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
      >
        Reset & Refresh (Default Range)
      </button>
      
      <button 
        onClick={onForceMaximum}
        className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
      >
        Force Maximum Range
      </button>
    </div>
  );
};

export default CampaignControls;
