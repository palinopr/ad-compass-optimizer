import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { MockApiService } from '@/services/api/mock/MockApiService';
import { mockFunnelData } from '@/services/api/mock/mockCampaignData';
import MockHeader from './mock-panel/MockHeader';
import DiagnosticItems, { DiagnosticItem, DiagnosticItemStatus } from './mock-panel/DiagnosticItems';
import MockApiCallsLog from './mock-panel/MockApiCallsLog';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowDownToLine, RefreshCw } from 'lucide-react';

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
  const [lastSyncAdAccount, setLastSyncAdAccount] = useState(localStorage.getItem('last_mock_sync_adaccount') || 'unknown');
  const [syncStatus, setSyncStatus] = useState<'synced'|'partial'|'not-synced'>('not-synced');
  
  const updateSyncStatus = useCallback(() => {
    if (!rawCampaignsCount) {
      setSyncStatus('not-synced');
      return;
    }
    
    if (rawCampaignsCount >= mockSourceData) {
      setSyncStatus('synced');
    } else if (rawCampaignsCount > 0) {
      setSyncStatus('partial');
    } else {
      setSyncStatus('not-synced');
    }
  }, [rawCampaignsCount, mockSourceData]);

  useEffect(() => {
    console.log('MockDiagnosticPanel: Updating verified count', {
      displayedCampaignsCount,
      rawCampaignsCount,
      filters,
      adAccountId
    });
    
    const timer = setTimeout(() => {
      setVerifiedCount(displayedCampaignsCount);
      setLastSyncAdAccount(localStorage.getItem('last_mock_sync_adaccount') || 'unknown');
      updateSyncStatus();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [displayedCampaignsCount, rawCampaignsCount, filters, adAccountId, updateSyncStatus]);
  
  if (!isMockMode && !isMetaMockMode) return null;

  const handleRefresh = () => {
    localStorage.setItem("FORCE_MOCK_REFRESH", "true");
    triggerCampaignRefresh(true);
  };
  
  const handleForceMockSync = () => {
    console.log("🎭 Manual force sync of mock campaigns to state requested");
    const mockCampaigns = MockApiService.getMockCampaigns();
    const syncEvent = new CustomEvent('sync-mock-campaigns', { 
      detail: { campaigns: mockCampaigns } 
    });
    window.dispatchEvent(syncEvent);
    setTimeout(() => triggerCampaignRefresh(false), 300);
  };

  const diagnosticItems: DiagnosticItem[] = [
    {
      label: 'Mock Mode Type',
      status: 'info' as DiagnosticItemStatus,
      details: isMetaMockMode ? 'Meta API Simulation' : 'Basic Mock Data'
    },
    ...(isMetaMockMode ? [
      {
        label: 'Mocked Services',
        status: 'success' as DiagnosticItemStatus,
        details: 'Campaigns, Ad Sets, Ads, Insights'
      },
      {
        label: 'Meta API Status',
        status: 'info' as DiagnosticItemStatus,
        details: 'Using simulated responses'
      }
    ] : []),
    {
      label: 'Campaign Flow',
      status: (rawCampaignsCount === 0 ? 'error' : 'info') as DiagnosticItemStatus,
      details: `${mockSourceData} in funnel → ${rawCampaignsCount ?? 0} in state → ${verifiedCount} filtered`
    },
    {
      label: 'Mock Source Data',
      status: 'info' as DiagnosticItemStatus,
      details: `${mockSourceData} campaigns in mockFunnelData`
    },
    {
      label: 'Raw Campaigns',
      status: (rawCampaignsCount === 0 ? 'error' : 'info') as DiagnosticItemStatus,
      details: `${rawCampaignsCount ?? 'unknown'} campaigns in state`
    },
    {
      label: 'Filtered Campaigns',
      status: (verifiedCount > 0 ? 'success' : 'error') as DiagnosticItemStatus,
      details: `${verifiedCount} campaigns displayed`
    },
    {
      label: 'Mock Data Sync',
      status: (syncStatus === 'synced' ? 'success' : 
               syncStatus === 'partial' ? 'warning' : 
               'error') as DiagnosticItemStatus,
      details: syncStatus === 'synced' ? 'Successfully synced' : 
               syncStatus === 'partial' ? 'Partially synced' : 
               'Not synced to state'
    },
    {
      label: 'Sync Ad Account',
      status: (adAccountId === lastSyncAdAccount ? 'success' : 'warning') as DiagnosticItemStatus,
      details: `Current: ${adAccountId || 'none'}, Last Sync: ${lastSyncAdAccount}`
    },
    ...(filters ? [{
      label: 'Active Filters',
      status: 'info' as DiagnosticItemStatus,
      details: `Status: ${filters.status || 'none'}, Date: ${filters.datePreset || 'none'}, Search: ${filters.search ? 'yes' : 'no'}`
    }] : []),
    ...(verifiedCount === 0 ? [
      {
        label: 'Possible Fix',
        status: 'warning' as DiagnosticItemStatus,
        details: 'Try clicking "Force UI Refresh" or reload the page'
      },
      ...(rawCampaignsCount === 0 ? [{
        label: 'Data Flow Issue',
        status: 'error' as DiagnosticItemStatus,
        details: 'Mock data not reaching state - check console logs'
      }] : []),
      {
        label: 'Fix Action',
        status: 'warning' as DiagnosticItemStatus,
        details: 'Click "Force Sync" below to manually sync mock data to state'
      }
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
        
        {syncStatus !== 'synced' && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <h3 className="text-sm font-medium text-amber-800">Sync Issue Detected</h3>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              The mock campaigns are not properly synchronized with the global state.
              This can cause inconsistencies between what's displayed and the diagnostic information.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceMockSync}
                className="flex items-center gap-1 bg-white border-amber-300"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Force Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-1 bg-white border-amber-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        )}
        
        <MockApiCallsLog calls={MockApiService.getRecentMockCalls()} />
      </div>
    </Card>
  );
};

export default MockDiagnosticPanel;
