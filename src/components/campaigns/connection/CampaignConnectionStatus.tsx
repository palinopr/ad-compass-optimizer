import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useCampaignFetchState } from '@/hooks/campaigns/useCampaignFetchState';
import TokenBasicInfo from '@/components/campaigns/diagnostic-components/token-sections/TokenBasicInfo';
import ApiStatusSection from '@/components/campaigns/diagnostic-components/token-sections/ApiStatusSection';
import DataLoadingSection from '@/components/campaigns/diagnostic-components/token-sections/DataLoadingSection';
import CorsIssueSection from '@/components/campaigns/diagnostic-components/token-sections/CorsIssueSection';
import DataDisplaySection from '@/components/campaigns/diagnostic-components/token-sections/DataDisplaySection';
import TroubleshootingSection from '@/components/campaigns/diagnostic-components/token-sections/TroubleshootingSection';
import { format } from 'date-fns';
import { metaAuthService } from '@/services/MetaAuthService';

const CampaignConnectionStatus = () => {
  const [lastSource, setLastSource] = useState<string>('');
  const [lastFetchTime, setLastFetchTime] = useState<string>('');
  const token = metaAuthService.getAccessToken();
  const permissions = metaAuthService.getPermissions();
  const selectedAccount = localStorage.getItem('selected_ad_account');
  const isMockMode = localStorage.getItem('USE_MOCK_META_API') === 'true';
  const lastApiCall = localStorage.getItem('last_campaign_fetch_attempt');
  const lastApiSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  const lastFetchMetadata = useCampaignFetchState()?.lastFetchMetadata;

  useEffect(() => {
    const source = localStorage.getItem('last_campaign_source') || '';
    const fetchTime = localStorage.getItem('last_campaign_fetch_at') || '';
    setLastSource(source);
    setLastFetchTime(fetchTime);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Never';
    try {
      return format(new Date(timestamp), "h:mm a · MMM d");
    } catch (e) {
      return timestamp;
    }
  };

  const tokenInfo = {
    hasToken: !!token,
    tokenLength: token?.length,
    isValid: token?.length > 50,
    permissions,
    source: isMockMode ? 'Mock API' : 'Live API'
  };

  const handleFullPageRefresh = () => window.location.reload();
  const handleForceReload = () => window.location.href = window.location.href;
  const handleHardReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-sm font-medium">
          <Shield className="h-4 w-4 mr-2" />
          Connection Health Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Source and Last Sync Info */}
        {lastSource && (
          <div className="bg-gray-50 p-2 rounded-md text-xs space-y-1">
            <div className="flex items-center">
              {lastSource === 'Mock Data' ? '🎭' : '📦'} 
              <span className="ml-1">Source: {lastSource}</span>
            </div>
            {lastFetchTime && (
              <div className="text-gray-600">
                ⏱️ Last Sync: {formatTimestamp(lastFetchTime)}
              </div>
            )}
          </div>
        )}

        <TokenBasicInfo tokenInfo={tokenInfo} />
        
        <ApiStatusSection
          lastFetchAttempt={lastApiCall}
          lastFetchSuccess={lastApiSuccess}
          fetchError={null}
          formattedFetchTime={formatTimestamp(lastApiCall)}
          tokenAnalysis={null}
        />
        
        <DataLoadingSection
          campaignCount={lastFetchMetadata?.campaignCount || 0}
          tokenAnalysis={null}
        />
        
        <CorsIssueSection
          hasCorsIssues={false}
          handleFullPageRefresh={handleFullPageRefresh}
        />
        
        <DataDisplaySection
          campaignCount={lastFetchMetadata?.campaignCount || 0}
          hasUIDisplayIssue={false}
          hasDataInconsistency={false}
        />
        
        <TroubleshootingSection
          tokenAnalysis={null}
          hasDataInconsistency={false}
          hasUIDisplayIssue={false}
          campaignCount={lastFetchMetadata?.campaignCount || 0}
          fetchError={null}
          handleForceReload={handleForceReload}
          handleHardReset={handleHardReset}
          handleFullPageRefresh={handleFullPageRefresh}
        />
      </CardContent>
    </Card>
  );
};

export default CampaignConnectionStatus;
