
/**
 * Meta API Types
 */

export namespace Meta {
  export interface User {
    id: string;
    name?: string;
    email?: string;
    picture?: string;
  }

  export interface AdAccount {
    id: string;
    account_id: string;
    name: string;
    account_status: number;
    currency?: string;
    timezone_name?: string;
  }

  export interface BusinessManager {
    id: string;
    name: string;
    verification_status?: string;
    created_time?: string;
  }
}
