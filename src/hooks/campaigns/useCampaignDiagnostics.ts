
import { useEffect, useState } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';

interface DiagnosticState {
  tokenInfo: {
    exists: boolean;
    value: string | null;
    type: 'Live' | 'Mock' | 'Expired' | 'None';
  };
  adAccounts: {
    raw: any[];
    count: number;
    selectedId: string | null;
  };
  apiResponses: {
    meAdAccounts: any;
    campaigns: any;
    lastError: string | null;
  };
}

export const useCampaignDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticState>({
    tokenInfo: {
      exists: false,
      value: null,
      type: 'None'
    },
    adAccounts: {
      raw: [],
      count: 0,
      selectedId: null
    },
    apiResponses: {
      meAdAccounts: null,
      campaigns: null,
      lastError: null
    }
  });

  useEffect(() => {
    // Force disable all mock modes
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('USE_MOCK_MODE');
      localStorage.removeItem('USE_MOCK_META_API');
      localStorage.removeItem('mockMeta');
    }

    const updateDiagnostics = async () => {
      const token = metaAuthService.getAccessToken();
      const selectedAccount = localStorage.getItem('selected_ad_account');

      // Get token info
      const tokenInfo = {
        exists: !!token,
        value: token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : null,
        type: token ? 'Live' as const : 'None' as const
      };

      try {
        // Fetch ad accounts
        let adAccountsData = { raw: [], count: 0 };
        if (token) {
          console.log('[DIAGNOSTICS] Fetching ad accounts...');
          const accounts = await MetaApiService.fetchAdAccounts(token);
          console.log('[DIAGNOSTICS] Ad accounts response:', accounts);
          adAccountsData = {
            raw: accounts,
            count: accounts.length
          };
        }

        setDiagnostics(prev => ({
          ...prev,
          tokenInfo,
          adAccounts: {
            ...adAccountsData,
            selectedId: selectedAccount
          }
        }));
      } catch (error: any) {
        console.error('[DIAGNOSTICS] Error:', error);
        setDiagnostics(prev => ({
          ...prev,
          tokenInfo,
          apiResponses: {
            ...prev.apiResponses,
            lastError: error?.message || 'Unknown error'
          }
        }));
      }
    };

    updateDiagnostics();

    // Listen for ad account changes
    const handleAccountChange = () => {
      updateDiagnostics();
    };

    window.addEventListener('ad-account-changed', handleAccountChange);
    return () => {
      window.removeEventListener('ad-account-changed', handleAccountChange);
    };
  }, []);

  return diagnostics;
};
