
import { toast } from '@/hooks/use-toast';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';

export const handleSuccessfulFetch = (
  campaigns: any[],
  mountedRef: React.MutableRefObject<boolean>,
  increaseCooldown: () => void
) => {
  if (!mountedRef.current) return;

  localStorage.setItem('last_campaign_count', campaigns.length.toString());
  localStorage.setItem('last_campaign_fetch_success', 'true');
  
  if (campaigns.length > 0) {
    toast({
      title: "Campaign Data Loaded Successfully",
      description: `Found ${campaigns.length} campaigns.`,
      variant: "default",
    });
  }
};

export const logFetchDetails = (
  adAccountId: string | null,
  token: string | null,
  error?: any
) => {
  if (!adAccountId) {
    console.error('[CAMPAIGNS] Invalid or missing ad account ID:', adAccountId);
    throw new Error('🔴 Please select a valid ad account to load campaigns.');
  }

  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  console.log('[CAMPAIGNS] Using formatted account ID:', formattedAccountId);

  if (error) {
    console.error('[CAMPAIGNS] Fetch error details:', {
      error: {
        message: error?.message,
        code: error?.error?.code || error?.code,
        type: error?.error?.type || error?.type,
      },
      adAccountId,
      timestamp: new Date().toISOString()
    });
    return;
  }
};

export const prepareFetchRequest = async (
  token: string,
  adAccountId: string
) => {
  if (!token) {
    return { error: '🔴 Please authenticate with Meta to load campaigns.' };
  }

  if (!adAccountId) {
    return { error: '🔴 Please select a valid ad account to load campaigns.' };
  }

  return { error: null };
};
