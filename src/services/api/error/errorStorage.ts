
export class ErrorStorage {
  static storeRawErrorResponse(errorData: any): void {
    try {
      localStorage.setItem('raw_campaign_error_response', JSON.stringify(errorData));
    } catch (e) {
      console.error('[CAMPAIGN FETCH] Error storing raw error response:', e);
    }
  }

  static storeRawSuccessResponse(data: any): void {
    try {
      localStorage.setItem('raw_campaign_response', JSON.stringify(data));
      console.log('[CAMPAIGN FETCH] Full response stored for debugging');
    } catch (e) {
      console.error('[CAMPAIGN FETCH] Error storing raw response:', e);
    }
  }
}
