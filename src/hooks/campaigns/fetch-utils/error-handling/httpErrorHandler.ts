
export const enhanceHttpError = (errorMessage: string, errorDetails: any = {}) => {
  if (typeof errorMessage !== 'string') return { error: errorMessage, errorDetails };
  
  const errorCodeMatch = errorMessage.match(/(\d{3})/);
  if (!errorCodeMatch || !errorCodeMatch[0]) {
    return { error: errorMessage, errorDetails };
  }
  
  const errorCode = errorCodeMatch[0];
  let enhancedError = errorMessage;
  
  switch (errorCode) {
    case '400':
      enhancedError = 'Failed to fetch campaign data (Error 400). This usually indicates an invalid token format or expired token.';
      errorDetails.status = 400;
      break;
    case '401':
      enhancedError = 'Authentication failed (Error 401). Please reconnect your Meta account.';
      errorDetails.status = 401;
      break;
    case '403':
      enhancedError = 'Permission denied (Error 403). Your account may not have access to this ad account.';
      errorDetails.status = 403;
      break;
    case '500':
      enhancedError = 'Meta API server error (Error 500). Please try again later.';
      errorDetails.status = 500;
      break;
  }
  
  return { 
    error: enhancedError,
    errorDetails: {
      ...errorDetails,
      fullMessage: errorMessage
    }
  };
};
