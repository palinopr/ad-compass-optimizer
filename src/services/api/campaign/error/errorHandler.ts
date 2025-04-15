
export class ErrorHandler {
  static async handleErrorResponse(response: Response): Promise<never> {
    const errorData = await response.json();
    console.error('[GRAPH API ERROR] Response:', {
      status: response.status,
      data: errorData,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const error = errorData?.error || {};
    console.error('[GRAPH API ERROR] Details:', {
      message: error.message || 'Unknown error',
      type: error.type || 'Unknown type',
      code: error.code || 'Unknown code',
      subcode: error.error_subcode
    });
    
    throw {
      message: error.message || `HTTP error! status: ${response.status}`,
      code: error.code,
      type: error.type,
      subcode: error.error_subcode,
      status: response.status,
      response: {
        data: errorData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      }
    };
  }
}
