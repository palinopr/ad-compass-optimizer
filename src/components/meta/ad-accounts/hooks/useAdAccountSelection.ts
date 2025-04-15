
import { useState, useEffect, useCallback } from 'react';
import { MetaApiService } from '@/services/MetaApiService';
import { metaAuthService } from '@/services/MetaAuthService';
import { toast } from '@/hooks/use-toast';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import CampaignFetchLogger from '@/utils/debugging/campaignFetchLogger';

export const useAdAccountSelection = (availableAccounts: any[] = []) => {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Load the initially selected account from localStorage
  useEffect(() => {
    try {
      const storedAccount = localStorage.getItem('selected_ad_account');
      if (storedAccount) {
        setSelectedAccount(storedAccount);
        console.log('[META] Loaded selected account from storage:', storedAccount);
      } else {
        console.log('[META] No selected account in storage');
        
        // If no account is selected but we have available accounts, select the first one
        if (Array.isArray(availableAccounts) && availableAccounts.length > 0) {
          const firstAccount = availableAccounts[0];
          if (firstAccount && firstAccount.id) {
            const accountId = firstAccount.id.replace(/^act_/, '');
            console.log('[META] Setting account to first available:', accountId);
            setSelectedAccount(accountId);
            localStorage.setItem('selected_ad_account', accountId);
            
            // Force a campaign fetch for the auto-selected account
            setTimeout(() => {
              console.log('[META] Triggering initial campaign fetch for auto-selected account');
              triggerCampaignRefresh(true, accountId, true);
            }, 500);
          }
        }
      }
    } catch (e) {
      console.error('[META] Error loading selected account:', e);
    }
  }, []);

  // Update selected account when accounts load
  useEffect(() => {
    if (Array.isArray(availableAccounts) && availableAccounts.length > 0 && !selectedAccount) {
      // If we have accounts but no selection, use the first one as default
      const firstAccount = availableAccounts[0];
      if (firstAccount && firstAccount.id) {
        const accountId = firstAccount.id.replace(/^act_/, '');
        console.log('[META] Setting default selected account:', accountId);
        setSelectedAccount(accountId);
        localStorage.setItem('selected_ad_account', accountId);
        
        // Clear any mock data to ensure we're using live API
        localStorage.removeItem('USE_MOCK_MODE');
        localStorage.removeItem('mock_campaigns_data');
        localStorage.removeItem('mock_account_data');
        
        // Trigger initial campaign fetch with insights for the default account
        setTimeout(() => {
          console.log(`[CAMPAIGN FETCH] 🚀 Started for default account: act_${accountId}`);
          CampaignFetchLogger.logAttempt(`act_${accountId}`);
          triggerCampaignRefresh(true, accountId, true); 
        }, 500);
      }
    }
  }, [availableAccounts, selectedAccount]);

  // Handle account change
  const handleAccountChange = useCallback((accountId: string) => {
    if (!accountId) return;

    try {
      const cleanAccountId = accountId.replace(/^act_/, '');
      console.log('[META] 🔄 Changing account to:', cleanAccountId);
      
      // Remove any cached data
      localStorage.removeItem('mock_campaigns_data');
      localStorage.removeItem('mock_account_data');
      localStorage.removeItem('campaigns_cache');
      localStorage.removeItem('USE_MOCK_MODE');
      
      // Update state and localStorage
      setSelectedAccount(cleanAccountId);
      localStorage.setItem('selected_ad_account', cleanAccountId);
      localStorage.setItem('selected_ad_accounts', JSON.stringify([cleanAccountId]));
      
      // Format with act_ prefix for logging
      const formattedId = `act_${cleanAccountId}`;
      
      // Log the account change attempt
      console.log(`[CAMPAIGN FETCH] 🔄 Account changed to ${formattedId} - initiating fetch`);
      CampaignFetchLogger.logAttempt(formattedId);
      
      // Notify about account change
      toast({
        title: "Ad Account Changed",
        description: `Now using account ${cleanAccountId}`,
        duration: 3000
      });
      
      // Dispatch event for other components to react
      const event = new CustomEvent('ad-account-changed', {
        detail: { accountId: cleanAccountId }
      });
      window.dispatchEvent(event);
      
      // Force immediate campaign refresh with insights data
      // Use a small timeout to ensure localStorage is updated
      setTimeout(() => {
        console.log(`[CAMPAIGN FETCH] 🚀 Forcing refresh for new account: ${formattedId}`);
        triggerCampaignRefresh(true, cleanAccountId, true);
      }, 200);
    } catch (e) {
      console.error('[META] Error changing account:', e);
      toast({
        title: "Error",
        description: "Failed to change ad account",
        variant: "destructive"
      });
    }
  }, []);

  return {
    selectedAccount,
    handleAccountChange
  };
};
