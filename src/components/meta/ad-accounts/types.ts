
export interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  business_name?: string;
  currency: string;
  account_status?: number;  // Added this property to fix TypeScript errors
}
