
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);

  const handleError = (err: any, accountId?: string) => {
    console.error('Campaign fetch error:', err);
    const errorMessage = err?.message || 'An unexpected error occurred';
    
    setError(errorMessage);
    setErrorDetails({
      error: {
        message: err?.message || 'Unexpected error',
        stack: err?.stack,
        accountId
      }
    });

    toast({
      title: "Error Loading Campaigns",
      description: "There was a problem loading your campaign data. Please check your connection.",
      variant: "destructive"
    });

    return { error: errorMessage, errorDetails };
  };

  const clearErrors = () => {
    setError(null);
    setErrorDetails(null);
  };

  return {
    error,
    errorDetails,
    handleError,
    clearErrors
  };
};
