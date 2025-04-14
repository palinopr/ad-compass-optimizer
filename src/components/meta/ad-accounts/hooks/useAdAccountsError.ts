import { useToast } from '@/hooks/use-toast';

export const useAdAccountsError = () => {
  const { toast } = useToast();

  const handleFetchError = (err: any) => {
    // Don't show error toasts in mock mode
    if (localStorage.getItem("USE_MOCK_MODE") === "true") {
      return {
        error: null,
        shouldReconnect: false
      };
    }

    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Ad account fetch error:', errorMessage);
    
    if (errorMessage.includes('token') || 
        errorMessage.includes('400') || 
        errorMessage.includes('401')) {
      return {
        error: 'Your Meta access token appears to be invalid or expired. Please reconnect your account.',
        shouldReconnect: true
      };
    }
    
    toast({
      title: "Error",
      description: "Failed to load Meta ad accounts",
      variant: "destructive"
    });
    
    return {
      error: 'Failed to fetch ad accounts',
      shouldReconnect: false
    };
  };

  return { handleFetchError };
};
