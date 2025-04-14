
import React from 'react';
import CampaignDisplayFix from '@/components/dashboard/CampaignDisplayFix';
import CampaignResetButton from '@/components/dashboard/campaign-reset';
import DiagnosticButton from '@/components/campaigns/DiagnosticButton';

interface DashboardTroubleSectionProps {
  hasDataButNotShowing: boolean;
  campaignCount: number;
}

const DashboardTroubleSection: React.FC<DashboardTroubleSectionProps> = ({ 
  hasDataButNotShowing, 
  campaignCount 
}) => {
  if (!hasDataButNotShowing) {
    return (
      <div className="space-y-4">
        <CampaignDisplayFix />
        <CampaignResetButton />
        <DiagnosticButton />
      </div>
    );
  }
  
  return (
    <div className="space-y-4 bg-amber-50 p-4 border border-amber-200 rounded-md">
      <div className="bg-white p-3 rounded shadow-sm border border-amber-100 text-amber-800">
        <h3 className="font-bold flex items-center gap-2">
          <span className="bg-amber-100 p-1 rounded">⚠️</span>
          Display Issue Detected
        </h3>
        <p className="text-sm mt-1">
          We've detected that your campaigns data has loaded ({campaignCount} campaigns) but isn't displaying correctly.
          Use the tools below to fix the display issues.
        </p>
      </div>
      
      <CampaignDisplayFix />
      <CampaignResetButton />
      <DiagnosticButton />
    </div>
  );
};

export default DashboardTroubleSection;
