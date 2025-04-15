
import { ErrorDetails } from '../types/campaignLogTypes';

export const parseMetaError = (error: any): ErrorDetails => {
  const defaultError: ErrorDetails = {
    code: 'unknown',
    type: 'unknown',
    message: 'Unknown error',
    timestamp: new Date().toISOString()
  };

  if (!error) return defaultError;

  // Handle nested error objects from Meta API
  const metaError = error.error || error;
  
  return {
    code: metaError.code || error.status || defaultError.code,
    type: metaError.type || defaultError.type,
    message: metaError.message || String(error) || defaultError.message,
    subcode: metaError.error_subcode,
    fbtraceId: metaError.fbtrace_id,
    timestamp: new Date().toISOString()
  };
};
