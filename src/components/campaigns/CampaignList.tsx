
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/campaigns';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import CampaignTable from './CampaignTable';
import { LoadingState, ErrorState, EmptyState } from './CampaignListStates';
import { metaAuthService } from '@/services/MetaAuthService';
import { useAuthCheck } from '@/hooks/campaigns/useAuthCheck'; 

interface CampaignListProps {
  status: 'active' | 'draft' | 'archived';
}

const CampaignList: React.FC<CampaignListProps> = ({ status }) => {
  const { campaigns, isLoading, error, refetchCampaigns, errorDetails } = useCampaigns(status);
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  
  // Get the most reliable auth check by running a full validation
  const authResult = validateAuthentication();
  const effectiveIsAuthenticated = authResult.isValid;
  
  // Force check auth status when component mounts
  useEffect(() => {
    // Ensure our shared provider has the most accurate authentication state
    const authState = validateAuthentication();
    
    // If there's a state mismatch, trigger a refresh of the central auth state
    if (authState.isValid && !isAuthenticated) {
      console.log('Authentication state mismatch detected, refreshing auth state...');
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, validateAuthentication]);
  
  // Log additional debug information if there's an error
  useEffect(() => {
    if (error) {
      console.log(`Campaign loading error (${status} campaigns):`, error);
      console.log('Authentication status:', effectiveIsAuthenticated ? 'Authenticated' : 'Not authenticated');
      console.log('Context auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
      console.log('Auth check result:', authResult.isValid ? 'Valid' : 'Invalid');
      console.log('Error details:', errorDetails || 'No additional details');
      
      // Check ad account selection
      const selectedAdAccount = localStorage.getItem('selected_ad_account');
      const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
      console.log('Selected ad account:', selectedAdAccount);
      console.log('Selected ad accounts array:', selectedAdAccounts);
    }
  }, [error, isAuthenticated, effectiveIsAuthenticated, status, errorDetails, authResult]);
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <Card>
        <ErrorState 
          error={error} 
          isAuthenticated={effectiveIsAuthenticated}
          onRetry={refetchCampaigns}
          errorDetails={errorDetails}
        />
      </Card>
    );
  }
  
  // Handle empty state
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <EmptyState status={status} />
      </Card>
    );
  }
  
  // Handle data state
  return (
    <Card>
      <CampaignTable campaigns={campaigns} status={status} />
    </Card>
  );
};

export default CampaignList;
