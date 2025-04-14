export interface MockedRequest {
  endpoint: string;
  timestamp: string;
  response: any;
}

export class MockRequestLogger {
  private static recentMockCalls: MockedRequest[] = [];

  public static logRequest(endpoint: string, response: any) {
    console.log(`✅ Mocking Meta API call: ${endpoint}`);
    console.log('  → Using mocked response data');
    
    this.recentMockCalls.unshift({
      endpoint,
      timestamp: new Date().toISOString(),
      response
    });

    // Keep only last 10 calls
    if (this.recentMockCalls.length > 10) {
      this.recentMockCalls.pop();
    }
  }

  public static getRecentCalls(): MockedRequest[] {
    return this.recentMockCalls;
  }
}
