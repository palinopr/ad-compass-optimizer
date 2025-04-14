
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

  if (isPermissionError(error)) {
    const subcodeInfo = error.error_subcode ? ` (Subcode ${error.error_subcode})` : '';
    return `Your Meta token may be missing ad account permissions${subcodeInfo}. Please reconnect your Meta account.`;
  }
  return `Meta API Error ${error.code || ''}${error.error_subcode ? ` (Subcode ${error.error_subcode})` : ''}: ${error.message || 'Unknown error'}`;
};
