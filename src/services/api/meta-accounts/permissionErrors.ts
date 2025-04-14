
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
  if (isPermissionError(error)) {
    return "Your Meta token may be missing ad account permissions. Please reconnect your Meta account.";
  }
  return `Meta API Error ${error.code || ''}: ${error.message || 'Unknown error'}`;
};
