
import { useState, useEffect, useRef } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { useToast } from '@/hooks/use-toast';
import { AdAccount } from '../types';
import { fetchAllAccounts } from '../utils/fetchUtils';

export function useAdAccountsFetching() {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const errorRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const fetchAttemptedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchAdAccounts = async () => {
    try {
      if (!isMountedRef.current) return;
      
      setIsLoading(true);
      setError(null);
      fetchAttemptedRef.current = true;

      const token = metaAuthService.getAccessToken();
      if (!token) {
        setError('Not authenticated with Meta');
        setIsLoading(false);
        return;
      }

      console.log('[META] Fetching ad accounts...');
      const accounts = await fetchAllAccounts(token);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        console.log('[META AD ACCOUNTS] Response processed:', accounts);
        
        if (!Array.isArray(accounts)) {
          setError('Invalid response from API');
          setAdAccounts([]);
          return;
        }
        
        if (accounts.length === 0) {
          setError('No ad accounts found. Please check your Meta permissions.');
          toast({
            title: "No Ad Accounts Found",
            description: "You don't have access to any Meta ad accounts. Please check your permissions.",
            variant: "destructive"
          });
        }

        // Log each account before updating state
        accounts.forEach((account, idx) => {
          console.log(`[META AD ACCOUNTS] Account ${idx + 1}:`, {
            id: account.id,
            name: account.name,
          });
        });

        setAdAccounts(accounts);
      }
    } catch (err: any) {
      console.error('[META] Error fetching ad accounts:', err);
      const errorMessage = err?.message || 'Failed to fetch ad accounts';
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(errorMessage);
        
        if (errorMessage.includes('permission')) {
          toast({
            title: "Permission Error",
            description: "Missing required Meta permissions. Please reconnect your account.",
            variant: "destructive"
          });
        }
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Fetch accounts on mount
  useEffect(() => {
    if (!fetchAttemptedRef.current) {
      fetchAdAccounts();
    }
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
