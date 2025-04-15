
import { useState, useEffect, useRef } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { AdAccount } from '../types';
import { fetchAllAccounts } from '../utils/fetchUtils';
import { useAdAccountsError } from './useAdAccountsError';
import { toast } from '@/hooks/use-toast';

export function useAdAccountsFetching() {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const { handleFetchError } = useAdAccountsError();
  
  const fetchAdAccounts = async () => {
    const accessToken = metaAuthService.getAccessToken();
    if (!accessToken) {
      setError('Not authenticated with Meta');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[AD ACCOUNT FETCH] Starting fetch operation...');
      const fetchedAccounts = await fetchAllAccounts(accessToken);
      
      if (fetchedAccounts.length === 0) {
        const errorMessage = 'No ad accounts found. Please check Meta permissions and token scopes.';
        setError(errorMessage);
        toast({
          title: "No Ad Accounts Found",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        // Auto-select first account if none is selected
        const currentSelected = localStorage.getItem('selected_ad_account');
        if (!currentSelected && fetchedAccounts.length > 0) {
          const firstAccount = fetchedAccounts[0];
          const accountId = firstAccount.id.replace(/^act_/, '');
          localStorage.setItem('selected_ad_account', accountId);
          
          // Trigger campaign refresh with new account
          window.dispatchEvent(new CustomEvent('ad-account-changed', { 
            detail: { accountId } 
          }));
        }
      }
      
      setAdAccounts(fetchedAccounts);
      
    } catch (err) {
      const { error: errorMessage } = handleFetchError(err);
      setError(errorMessage);
      
      // Auto-scroll to error when it occurs
      setTimeout(() => {
        if (errorRef.current) {
          errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch accounts on mount
  useEffect(() => {
    fetchAdAccounts();
  }, []);

  return {
    adAccounts,
    isLoading,
    error,
    errorRef,
    fetchAdAccounts,
    setAdAccounts
  };
}
