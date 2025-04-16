
import { useState } from 'react';

export const useInsightsState = () => {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    insights,
    setInsights,
    isLoading,
    setIsLoading,
    error,
    setError
  };
};
