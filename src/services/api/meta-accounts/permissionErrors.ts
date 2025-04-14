
import { metaSubcodeDescriptions } from './errorSubcodes';

interface MetaApiError {
  code?: number;
  error_subcode?: number;
  message?: string;
}

export const isPermissionError = (error: MetaApiError): boolean => {
  return (
    error.code === 10 || // API permission error
    error.code === 200 || // Permission error
    error.error_subcode === 33 // Insufficient scope
  );
};

export const getPermissionErrorMessage = (error: MetaApiError): string => {
  // Log error details for debugging
  console.log('[🔍 META ERROR] Code:', error.code);
  console.log('[🔍 META ERROR] Subcode:', error.error_subcode);
  console.log('[🔍 META ERROR] Message:', error.message);

  const subcodeExplanation = error.error_subcode ? 
    metaSubcodeDescriptions[error.error_subcode] : undefined;

  if (isPermissionError(error)) {
    const subcodeInfo = error.error_subcode ? 
      ` (Subcode ${error.error_subcode}${subcodeExplanation ? ` - ${subcodeExplanation}` : ''})` : 
      '';
    return `Your Meta token may be missing ad account permissions${subcodeInfo}. Please reconnect your Meta account.`;
  }

  const subcodeInfo = error.error_subcode ? 
    ` (Subcode ${error.error_subcode}${subcodeExplanation ? ` - ${subcodeExplanation}` : ''})` : 
    '';
  return `Meta API Error ${error.code || ''}${subcodeInfo}: ${error.message || 'Unknown error'}`;
};
