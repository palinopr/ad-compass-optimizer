
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
      // Check if user has the necessary permissions
      const permissions = metaAuthService.getPermissions();
      const hasAdsPermission = permissions.some(p => 
        p === 'ads_management' || p === 'ads_read'
      );
      
      if (!hasAdsPermission) {
        setError('Missing required ads permissions. Please update your token permissions to include ads_read or ads_management.');
        setIsLoading(false);
        return;
      }
      
      // Get authentication token
      const token = metaAuthService.getAccessToken();
      if (!token) {
        setError('Not authenticated with Meta');
        setIsLoading(false);
        return;
      }
      
      // First check for a directly selected ad account
      let adAccountId = localStorage.getItem('selected_ad_account');
      
      // If not found, try to get from selected_ad_accounts
      if (!adAccountId) {
        const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
        
        if (selectedAdAccounts) {
          const accounts = JSON.parse(selectedAdAccounts);
          if (accounts.length > 0) {
            adAccountId = accounts[0]; // Use the first selected ad account
          }
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaigns';
      setError(errorMessage);
      
      // Provide more specific error message based on common issues
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('permission')) {
          toast({
            title: "Permission Error",
            description: "You don't have the required permissions to view campaign data. Please update your token permissions.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load campaign data. Please check your Meta connection and ad account selection.",
            variant: "destructive"
          });
        }
      }
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
