
import { BaseApiService } from '../BaseApiService';

export interface BatchRequest {
  method: 'GET' | 'POST';
  relative_url: string;
  name?: string;
}

export interface BatchResponse {
  code: number;
  body: string;
}

export class MetaBatchService extends BaseApiService {
  public static async executeBatch(
    token: string, 
    requests: BatchRequest[]
  ): Promise<BatchResponse[]> {
    try {
      console.log('[META BATCH] Executing batch request with', requests.length, 'items');
      requests.forEach((req, i) => {
        console.log(`[META BATCH] Request ${i + 1}:`, {
          method: req.method,
          url: req.relative_url,
          name: req.name
        });
      });
      
      // Use proper formatted batch request
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: token,
            batch: requests,
            include_headers: true
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[META BATCH] Error response:', errorData);
        throw new Error(`Batch request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate the response format
      if (!Array.isArray(data)) {
        console.error('[META BATCH] Invalid response format:', data);
        throw new Error('Invalid batch response format');
      }
      
      console.log('[META BATCH] Successful response with', data.length, 'items');
      return data;
    } catch (error) {
      return this.handleApiError(error, 'executeBatch');
    }
  }

  public static parseBatchResponse(response: BatchResponse): any {
    try {
      return JSON.parse(response.body);
    } catch (error) {
      console.error('[META BATCH] Error parsing batch response:', error);
      return null;
    }
  }
}
