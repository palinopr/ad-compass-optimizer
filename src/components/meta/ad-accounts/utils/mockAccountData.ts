
import { AdAccount } from '../types';

export const getMockAdAccount = (): AdAccount => ({
  id: 'act_mock_123',
  name: 'Mock Ad Account (Demo)',
  account_id: 'mock_123',
  account_status: 1,
  currency: 'USD'
});
