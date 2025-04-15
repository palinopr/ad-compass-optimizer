
import { useState, useEffect, useRef } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { AdAccount } from '../types';
import { fetchAllAccounts } from '../utils/fetchUtils';
import { useAdAccountsError } from './useAdAccountsError';

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
        setError('No ad accounts found. Please check Meta permissions and token scopes.');
      } else {
        // Auto-select first account if none is selected
        const currentSelected = localStorage.getItem('selected_ad_account');
        if (!currentSelected && fetchedAccounts.length > 0) {
          const firstAccount = fetchedAccounts[0];
          localStorage.setItem('selected_ad_account', firstAccount.id.replace(/^act_/, ''));
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
