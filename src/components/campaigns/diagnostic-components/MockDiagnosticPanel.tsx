
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Check, X, Brain } from 'lucide-react';
import { mockFunnelData } from '@/services/api/mock/mockCampaignData';

interface DiagnosticItem {
  label: string;
  status: 'success' | 'error' | 'info';
  details?: string;
}

interface MockDiagnosticPanelProps {
  displayedCampaignsCount: number;
  rawCampaignsCount?: number;
  filters?: {
    status: string | null;
    datePreset?: string;
    search?: string;
  };
  adAccountId?: string;
}

const MockDiagnosticPanel: React.FC<MockDiagnosticPanelProps> = ({ 
  displayedCampaignsCount,
  rawCampaignsCount,
  filters,
  adAccountId
}) => {
  const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
  const [verifiedCount, setVerifiedCount] = useState(displayedCampaignsCount);

  // Use effect to delay checking the count to allow UI to fully render
  useEffect(() => {
    console.log('MockDiagnosticPanel: Updating verified count', {
      displayedCampaignsCount,
      rawCampaignsCount,
      filters,
      adAccountId
    });
    
    const timer = setTimeout(() => {
      setVerifiedCount(displayedCampaignsCount);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [displayedCampaignsCount, rawCampaignsCount, filters, adAccountId]);
  
  if (!isMockMode) return null;

  const diagnosticItems: DiagnosticItem[] = [
    {
      label: 'Mock Mode',
      status: 'success',
      details: 'Active'
    },
    {
      label: 'Funnel Data Loaded',
      status: 'success',
      details: `${mockFunnelData.campaigns.length} campaigns`
    },
    {
      label: 'Raw Campaigns',
      status: 'info',
      details: `${rawCampaignsCount ?? 'unknown'} campaigns`
    },
    {
      label: 'Filtered Campaigns',
      status: verifiedCount > 0 ? 'success' : 'error',
      details: `${verifiedCount} campaigns`
    }
  ];

  // Add filter details
  if (filters) {
    diagnosticItems.push({
      label: 'Active Filters',
      status: 'info',
      details: `Status: ${filters.status || 'none'}, Date: ${filters.datePreset || 'none'}, Search: ${filters.search ? 'yes' : 'no'}`
    });
  }

  // Add ad account info
  if (adAccountId) {
    diagnosticItems.push({
      label: 'Ad Account',
      status: 'info',
      details: adAccountId
    });
  }

  // Add diagnostic message if no campaigns are displayed
  if (verifiedCount === 0) {
    diagnosticItems.push({
      label: 'Possible Fix',
      status: 'info',
      details: 'CampaignList not receiving props or filtering by real ad account'
    });
  }

  return (
    <Card className="mt-8 p-4">
      <h3 className="text-sm font-medium mb-4">Mock Diagnostic Panel</h3>
      <div className="space-y-2">
        {diagnosticItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            {item.status === 'success' && <Check className="w-4 h-4 text-green-500" />}
            {item.status === 'error' && <X className="w-4 h-4 text-red-500" />}
            {item.status === 'info' && <Brain className="w-4 h-4 text-blue-500" />}
            <span className="font-medium">{item.label}:</span>
            <span className="text-gray-600">{item.details}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MockDiagnosticPanel;
