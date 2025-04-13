
import React from 'react';
import { Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DataLoadingSectionProps {
  campaignCount: number;
  tokenAnalysis?: any;
}

const DataLoadingSection: React.FC<DataLoadingSectionProps> = ({
  campaignCount,
  tokenAnalysis
}) => {
  return (
    <>
      <Separator className="my-2" />
      <div className="flex items-start gap-1 mt-2">
        <Database className="h-3 w-3 text-blue-500 mt-0.5" />
        <div>
          <p className="font-semibold">Data Loading:</p>
          <div className="space-y-1">
            <p>Campaign count: {campaignCount}</p>
            <p>
              CORS issues: 
              {tokenAnalysis?.cors?.hasCorsIssues ? (
                <span className="text-amber-600 ml-1">Detected</span>
              ) : (
                <span className="text-green-600 ml-1">None</span>
              )}
            </p>
            <p>
              Selected ad account: 
              <span className="ml-1">{localStorage.getItem('selected_ad_account') || 'None'}</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataLoadingSection;
