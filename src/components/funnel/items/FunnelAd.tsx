
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Ad } from '@/services/api/types/funnelTypes';

interface FunnelAdProps {
  ad: Ad;
  renderMetrics: (item: any) => React.ReactNode;
}

const FunnelAd: React.FC<FunnelAdProps> = ({ ad, renderMetrics }) => {
  return (
    <div className="pl-16 py-2 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{ad.name}</span>
        </div>
        {renderMetrics(ad)}
      </div>
    </div>
  );
};

export default FunnelAd;
