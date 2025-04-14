
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Check, X, Brain, Bug, RefreshCw } from 'lucide-react';
import { mockFunnelData } from '@/services/api/mock/mockCampaignData';
import { Button } from '@/components/ui/button';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { MockApiService } from '@/services/api/mock/MockApiService';

interface DiagnosticItem {
  label: string;
  status: 'success' | 'error' | 'info' | 'warning';
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
  const isMetaMockMode = MockApiService.isMockMetaApiMode();
  const [verifiedCount, setVerifiedCount] = useState(displayedCampaignsCount);
  const [mockSourceData, setMockSourceData] = useState(mockFunnelData.campaigns.length);

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

  const mockDiagnosticItems: DiagnosticItem[] = [
    {
      label: 'Mock Mode Type',
      status: 'info',
      details: isMetaMockMode ? 'Meta API Simulation' : 'Basic Mock Data'
    }
  ];

  if (isMetaMockMode) {
    mockDiagnosticItems.push(
      {
        label: 'Mocked Services',
        status: 'success',
        details: 'Campaigns, Ad Sets, Ads, Insights'
      },
      {
        label: 'Meta API Status',
        status: 'info',
        details: 'Using simulated responses'
      }
    );
  }

  const diagnosticItems: DiagnosticItem[] = [
    ...mockDiagnosticItems,
    {
      label: 'Campaign Flow',
      status: rawCampaignsCount === 0 ? 'error' : 'info',
      details: `${mockSourceData} in funnel → ${rawCampaignsCount ?? 0} in state → ${verifiedCount} filtered`
    },
    {
      label: 'Mock Source Data',
      status: 'info',
      details: `${mockSourceData} campaigns in mockFunnelData`
    },
    {
      label: 'Raw Campaigns',
      status: rawCampaignsCount === 0 ? 'error' : 'info',
      details: `${rawCampaignsCount ?? 'unknown'} campaigns in state`
    },
    {
      label: 'Filtered Campaigns',
      status: verifiedCount > 0 ? 'success' : 'error',
      details: `${verifiedCount} campaigns displayed`
    }
  ];

  diagnosticItems.push({
    label: 'Mock Data Sync',
    status: rawCampaignsCount === 0 ? 'error' : 'success',
    details: rawCampaignsCount === 0 ? 'Not synced to state' : 'Successfully synced'
  });

  if (filters) {
    diagnosticItems.push({
      label: 'Active Filters',
      status: 'info',
      details: `Status: ${filters.status || 'none'}, Date: ${filters.datePreset || 'none'}, Search: ${filters.search ? 'yes' : 'no'}`
    });
  }

  if (adAccountId) {
    diagnosticItems.push({
      label: 'Ad Account',
      status: 'info',
      details: adAccountId
    });
  }

  if (verifiedCount === 0) {
    diagnosticItems.push({
      label: 'Possible Fix',
      status: 'warning',
      details: 'Try clicking "Force UI Refresh" or reload the page'
    });
    
    if (rawCampaignsCount === 0) {
      diagnosticItems.push({
        label: 'Data Flow Issue',
        status: 'error',
        details: 'Mock data not reaching state - check console logs'
      });
    }
  }

  return (
    <Card className="mt-8 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium flex items-center">
          <Bug className="w-4 h-4 mr-2 text-amber-500" />
          {isMetaMockMode ? 'Meta API Simulation Panel' : 'Mock Diagnostic Panel'}
        </h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh Mock Data
        </Button>
      </div>
      
      <div className="space-y-2">
        {diagnosticItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            {item.status === 'success' && <Check className="w-4 h-4 text-green-500" />}
            {item.status === 'error' && <X className="w-4 h-4 text-red-500" />}
            {item.status === 'warning' && <Bug className="w-4 h-4 text-amber-500" />}
            {item.status === 'info' && <Brain className="w-4 h-4 text-blue-500" />}
            <span className="font-medium">{item.label}:</span>
            <span className={item.status === 'error' ? 'text-red-600' : 'text-gray-600'}>
              {item.details}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MockDiagnosticPanel;
