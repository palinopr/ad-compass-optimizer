
import { useState, useEffect } from 'react';
import { MetaApiService } from '@/services/MetaApiService';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

export interface BusinessManager {
  id: string;
  name: string;
  verification_status?: string;
  created_time?: string;
}

export function useBusinessManagers() {
  const [businessManagers, setBusinessManagers] = useState<BusinessManager[]>([]);
  const [selectedBusinessManager, setSelectedBusinessManager] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBusinessManagers = async () => {
      try {
        const token = metaAuthService.getAccessToken();
        if (!token) {
          setError('Not authenticated with Meta');
          setIsLoading(false);
          return;
        }

        const businessManagersData = await MetaApiService.fetchBusinessManagers(token);
        setBusinessManagers(businessManagersData);
        
        // If there are business managers, select the first one by default
        if (businessManagersData.length > 0) {
          setSelectedBusinessManager(businessManagersData[0].id);
        }
      } catch (err) {
        setError('Failed to fetch Business Managers');
        toast({
          title: "Error",
          description: "Could not load Business Managers. Please try again.",
          variant: "destructive"
        });
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessManagers();
  }, [toast]);

  return {
    businessManagers,
    selectedBusinessManager,
    setSelectedBusinessManager,
    isLoading,
    error
  };
}
