
import { useState, useEffect } from 'react';
import { MetaApiService } from '@/services/MetaApiService';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

interface UseCampaignsResult {
  campaigns: MetaCampaign[];
  isLoading: boolean;
  error: string | null;
  refetchCampaigns: () => void;
}

export function useCampaigns(status?: string): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, hasPermissions, showConnectionDialog } = useMetaConnection();
  
  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting campaign fetch process...');
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log('User is not authenticated');
        setError('Not authenticated with Meta. Please connect your account.');
        setIsLoading(false);
        return;
      }
      
      // Check if user has the necessary permissions
      if (!hasPermissions) {
        console.log('User lacks required permissions');
        setError('Missing required ads permissions. Please update your token permissions to include ads_read or ads_management.');
        setIsLoading(false);
        return;
      }
      
      // Get authentication token
      const token = metaAuthService.getAccessToken();
      if (!token) {
        console.log('No access token found');
        setError('Not authenticated with Meta');
        setIsLoading(false);
        // Signal that connection dialog should be shown
        showConnectionDialog();
        return;
      }
      
      // First check for a directly selected ad account
      let adAccountId = localStorage.getItem('selected_ad_account');
      console.log('Direct ad account selection:', adAccountId);
      
      // If not found, try to get from selected_ad_accounts
      if (!adAccountId) {
        const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
        console.log('Selected ad accounts from storage:', selectedAdAccounts);
        
        if (selectedAdAccounts) {
          try {
            const accounts = JSON.parse(selectedAdAccounts);
            if (Array.isArray(accounts) && accounts.length > 0) {
              adAccountId = accounts[0]; // Use the first selected ad account
              console.log('Using first account from array:', adAccountId);
            }
          } catch (e) {
            console.error('Error parsing selected ad accounts:', e);
          }
        }
      }
      
      if (!adAccountId) {
        console.log('No ad account selected');
        setError('No ad account selected. Please select an ad account to view campaigns.');
        setIsLoading(false);
        return;
      }
      
      // Make sure the adAccountId is properly formatted (without 'act_' prefix for storage)
      // But we need to ensure it has the 'act_' prefix for the API call
      if (adAccountId.startsWith('act_')) {
        // For storage consistency, strip the prefix
        localStorage.setItem('selected_ad_account', adAccountId.substring(4));
      } else {
        // For API call, ensure it has the prefix
        adAccountId = `act_${adAccountId}`;
      }
      
      console.log(`Fetching campaigns for ad account: ${adAccountId}`);
      const campaignsData = await MetaApiService.fetchCampaigns(token, adAccountId);
      console.log('Campaigns data received:', campaignsData?.length || 0, 'campaigns');
      
      // Filter by status if provided
      let filteredCampaigns = campaignsData;
      if (status && campaignsData) {
        console.log(`Filtering campaigns by status: ${status}`);
        if (status === 'active') {
          filteredCampaigns = campaignsData.filter(c => c.status === 'ACTIVE');
        } else if (status === 'draft') {
          filteredCampaigns = campaignsData.filter(c => c.status === 'PAUSED');
        } else if (status === 'archived') {
          filteredCampaigns = campaignsData.filter(c => c.status === 'ARCHIVED' || c.status === 'DELETED');
        }
        console.log(`After filtering: ${filteredCampaigns?.length || 0} campaigns`);
      }
      
      setCampaigns(filteredCampaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaigns';
      console.error('Error message:', errorMessage);
      
      // Try to extract HTTP error code for more specific errors
      let enhancedError = errorMessage;
      if (typeof errorMessage === 'string') {
        // Extract error code if present
        const errorCodeMatch = errorMessage.match(/(\d{3})/);
        if (errorCodeMatch && errorCodeMatch[0]) {
          const errorCode = errorCodeMatch[0];
          
          if (errorCode === '400') {
            enhancedError = 'Failed to fetch campaign data (Error 400). This usually indicates an invalid token format or expired token.';
            // Trigger connection dialog
            showConnectionDialog();
          } else if (errorCode === '401') {
            enhancedError = 'Authentication failed (Error 401). Your Meta access token has expired.';
            // Trigger connection dialog
            showConnectionDialog();
          } else if (errorCode === '403') {
            enhancedError = 'Permission denied (Error 403). You don\'t have the required permissions to access this data.';
          }
        }
      }
      
      setError(enhancedError);
      
      // Show toast notification with more friendly error message
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('permission')) {
          toast({
            title: "Permission Error",
            description: "You don't have the required permissions to view campaign data. Please update your token permissions.",
            variant: "destructive"
          });
        } else if (errorMessage.includes('400') || errorMessage.includes('401')) {
          toast({
            title: "Authentication Error",
            description: "Your Meta access token appears to be invalid or expired. Please reconnect your account.",
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
  }, [status, isAuthenticated, hasPermissions]);
  
  return {
    campaigns,
    isLoading,
    error,
    refetchCampaigns: fetchCampaigns
  };
}
