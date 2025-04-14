
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

      const data = await this.processApiResponse(response, 'executeBatch');
      return data;
    } catch (error) {
      return this.handleApiError(error, 'executeBatch');
    }
  }

  public static parseBatchResponse(response: BatchResponse): any {
    try {
      return JSON.parse(response.body);
    } catch (error) {
      console.error('Error parsing batch response:', error);
      return null;
    }
  }
}
