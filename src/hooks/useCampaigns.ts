
import { useState, useEffect } from 'react';
import { MetaApiService } from '@/services/MetaApiService';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';
import { MetaCampaign } from '@/services/api/MetaCampaignService';

interface UseCampaignsResult {
  campaigns: MetaCampaign[];
  isLoading: boolean;
  error: string | null;
  refetchCampaigns: () => void;
}

export function useCampaigns(status?: string): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get authentication token
      const token = metaAuthService.getAccessToken();
      if (!token) {
        setError('Not authenticated with Meta');
        setIsLoading(false);
        return;
      }
      
      // Get selected ad account
      const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
      let adAccountId = null;
      
      if (selectedAdAccounts) {
        const accounts = JSON.parse(selectedAdAccounts);
        if (accounts.length > 0) {
          adAccountId = accounts[0]; // Use the first selected ad account
        }
      }
      
      if (!adAccountId) {
        setError('No ad account selected');
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching campaigns for ad account: ${adAccountId}`);
      const campaignsData = await MetaApiService.fetchCampaigns(token, adAccountId);
      
      // Filter by status if provided
      let filteredCampaigns = campaignsData;
      if (status) {
        if (status === 'active') {
          filteredCampaigns = campaignsData.filter(c => c.status === 'ACTIVE');
        } else if (status === 'draft') {
          filteredCampaigns = campaignsData.filter(c => c.status === 'PAUSED');
        } else if (status === 'archived') {
          filteredCampaigns = campaignsData.filter(c => c.status === 'ARCHIVED' || c.status === 'DELETED');
        }
      }
      
      setCampaigns(filteredCampaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to fetch campaigns');
      toast({
        title: 'Error',
        description: 'Failed to load campaign data. Please check your permissions.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCampaigns();
  }, [status]);
  
  return {
    campaigns,
    isLoading,
    error,
    refetchCampaigns: fetchCampaigns
  };
}
