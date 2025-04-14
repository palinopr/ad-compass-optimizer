
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { MockApiService } from '@/services/api/mock/MockApiService';
import { mockFunnelData } from '@/services/api/mock/mockCampaignData';
import MockHeader from './mock-panel/MockHeader';
import DiagnosticItems from './mock-panel/DiagnosticItems';
import MockApiCallsLog from './mock-panel/MockApiCallsLog';

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
  const isMetaMockMode = MockApiService.isMockMetaApiMode();
  const [verifiedCount, setVerifiedCount] = useState(displayedCampaignsCount);
  const [mockSourceData] = useState(mockFunnelData.campaigns.length);

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
  
  if (!isMockMode && !isMetaMockMode) return null;

  const handleRefresh = () => {
    localStorage.setItem("FORCE_MOCK_REFRESH", "true");
    triggerCampaignRefresh(true);
  };

  const diagnosticItems = [
    {
      label: 'Mock Mode Type',
      status: 'info' as const,
      details: isMetaMockMode ? 'Meta API Simulation' : 'Basic Mock Data'
    },
    ...(isMetaMockMode ? [
      {
        label: 'Mocked Services',
        status: 'success' as const,
        details: 'Campaigns, Ad Sets, Ads, Insights'
      },
      {
        label: 'Meta API Status',
        status: 'info' as const,
        details: 'Using simulated responses'
      }
    ] : []),
    {
      label: 'Campaign Flow',
      status: (rawCampaignsCount === 0 ? 'error' : 'info') as const,
      details: `${mockSourceData} in funnel → ${rawCampaignsCount ?? 0} in state → ${verifiedCount} filtered`
    },
    {
      label: 'Mock Source Data',
      status: 'info' as const,
      details: `${mockSourceData} campaigns in mockFunnelData`
    },
    {
      label: 'Raw Campaigns',
      status: (rawCampaignsCount === 0 ? 'error' : 'info') as const,
      details: `${rawCampaignsCount ?? 'unknown'} campaigns in state`
    },
    {
      label: 'Filtered Campaigns',
      status: (verifiedCount > 0 ? 'success' : 'error') as const,
      details: `${verifiedCount} campaigns displayed`
    },
    {
      label: 'Mock Data Sync',
      status: (rawCampaignsCount === 0 ? 'error' : 'success') as const,
      details: rawCampaignsCount === 0 ? 'Not synced to state' : 'Successfully synced'
    },
    ...(filters ? [{
      label: 'Active Filters',
      status: 'info' as const,
      details: `Status: ${filters.status || 'none'}, Date: ${filters.datePreset || 'none'}, Search: ${filters.search ? 'yes' : 'no'}`
    }] : []),
    ...(adAccountId ? [{
      label: 'Ad Account',
      status: 'info' as const,
      details: adAccountId
    }] : []),
    ...(verifiedCount === 0 ? [
      {
        label: 'Possible Fix',
        status: 'warning' as const,
        details: 'Try clicking "Force UI Refresh" or reload the page'
      },
      ...(rawCampaignsCount === 0 ? [{
        label: 'Data Flow Issue',
        status: 'error' as const,
        details: 'Mock data not reaching state - check console logs'
      }] : [])
    ] : [])
  ];

  return (
    <Card className="mt-8 p-4">
      <MockHeader 
        isMetaMockMode={isMetaMockMode}
        onRefresh={handleRefresh}
      />
      
      <div className="space-y-4">
        <DiagnosticItems items={diagnosticItems} />
        <MockApiCallsLog calls={MockApiService.getRecentMockCalls()} />
      </div>
    </Card>
  );
};

export default MockDiagnosticPanel;
