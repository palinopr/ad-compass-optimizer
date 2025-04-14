
export class ErrorUtils {
  public static isRateLimitError(error: any): boolean {
    if (!error) return false;
    
    const errorCode = error?.code || error?.error?.code || (error?.error?.error && error?.error?.error.code);
    if (errorCode === 4 || errorCode === 17 || errorCode === 32 || 
        (errorCode >= 80000 && errorCode <= 80014)) {
      return true;
    }
    
    const errorMessage = error?.message || error?.error?.message || 
                        (error?.error?.error && error?.error?.error.message);
    
    if (errorMessage && typeof errorMessage === 'string' && (
      errorMessage.includes('rate limit') || 
      errorMessage.includes('request limit') ||
      errorMessage.includes('too many calls')
    )) {
      return true;
    }
    
    return false;
  }

  public static handleRateLimitError(error: any): { retryAfter: number; code?: number; message?: string } {
    let retryAfter = 300;
    if (error.headers?.['retry-after']) {
      retryAfter = parseInt(error.headers['retry-after'], 10);
    } else if (error.retryAfter) {
      retryAfter = parseInt(error.retryAfter, 10);
    }
    
    const errorCode = error?.code || error?.error?.code || (error?.error?.error && error?.error?.error.code);
    const errorMessage = error?.message || error?.error?.message || 
                        (error?.error?.error && error?.error?.error.message);
    
    console.warn('Rate limit error details:', { 
      code: errorCode, 
      message: errorMessage, 
      retryAfter
    });

    return { retryAfter, code: errorCode, message: errorMessage };
  }
}
