
import { useCallback } from 'react';
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
      }
    }
  }, [availableAccounts, selectedAccount]);

  // Handle account change
  const handleAccountChange = useCallback((accountId: string) => {
    if (!accountId) return;

    try {
      const cleanAccountId = accountId.replace(/^act_/, '');
      console.log('[META] Changing account to:', cleanAccountId);
      
      // Update state and localStorage
      setSelectedAccount(cleanAccountId);
      localStorage.setItem('selected_ad_account', cleanAccountId);
      localStorage.setItem('selected_ad_accounts', JSON.stringify([cleanAccountId]));
      
      // Log the account change attempt
      console.log(`[CAMPAIGN FETCH] Started for act_${cleanAccountId}`);
      CampaignFetchLogger.logAttempt(cleanAccountId);
      
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
      
      // Force immediate campaign refresh
      triggerCampaignRefresh(true);
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
