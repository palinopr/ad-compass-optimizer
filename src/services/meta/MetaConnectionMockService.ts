
import { BaseMockService } from './BaseMockService';
import { MetaConnectionService, ConnectionTestResult } from '../api/MetaConnectionService';
import { MetaUserService } from '../api/MetaUserService';
import { MetaAdAccountService } from '../api/MetaAdAccountService';
import { MetaBusinessService } from '../api/MetaBusinessService';

export class MetaConnectionMockService extends BaseMockService {
  public static async fetchUserData(token: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock user data');
      return {
        id: 'mock_user_123',
        name: 'Mock User',
        email: 'mock@example.com',
        picture: 'https://via.placeholder.com/50x50'
      };
    }
    return BaseMockService.executeWithRateLimiting(() => 
      MetaUserService.fetchUserData(token)
    );
  }

  public static async fetchAdAccounts(token: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock ad accounts');
      return [{
        id: 'act_123456789',
        name: 'Mock Ad Account 1',
        account_id: '123456789',
        account_status: 1,
        currency: 'USD'
      }];
    }
    return BaseMockService.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccounts(token)
    );
  }

  public static async fetchAdAccountDetails(token: string, accountId: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock ad account details');
      return {
        id: accountId,
        name: 'Mock Ad Account 1',
        account_id: accountId.replace('act_', ''),
        account_status: 1,
        currency: 'USD'
      };
    }
    return BaseMockService.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccountDetails(token, accountId)
    );
  }

  public static async testConnection(token: string): Promise<ConnectionTestResult> {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock connection test');
      return {
        success: true,
        userId: 'mock_user_123',
        userName: 'Mock User',
        hasAdAccess: true
      };
    }
    return BaseMockService.executeWithRateLimiting(() => 
      MetaConnectionService.testConnection(token)
    , { bypassQueue: true });
  }

  public static async fetchBusinessManagers(token: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock business managers');
      return [{
        id: 'mock_business_123',
        name: 'Mock Business',
        verification_status: 'verified',
        created_time: '2023-01-01T00:00:00Z'
      }];
    }
    return BaseMockService.executeWithRateLimiting(() => 
      MetaBusinessService.fetchBusinessManagers(token)
    );
  }

  public static async fetchAdAccountsForBusiness(token: string, businessId: string) {
    if (this.isMockMode()) {
      console.log('🎭 Returning mock ad accounts for business');
      return [{
        id: 'act_123456789',
        name: 'Mock Ad Account 1',
        account_id: '123456789',
        account_status: 1,
        currency: 'USD'
      }];
    }
    return BaseMockService.executeWithRateLimiting(() => 
      MetaAdAccountService.fetchAdAccountsForBusiness(token, businessId)
    );
  }
}
