
import { useTokenConnection } from './meta/useTokenConnection';

// Re-export the hook with the same interface for backward compatibility
export function useMetaTokenConnection(options: {
  onSuccess: (userData: any) => void;
  onError: (errorMessage: string) => void;
}) {
  return useTokenConnection(options);
}
