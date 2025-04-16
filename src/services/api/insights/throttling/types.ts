
export interface IUsageData {
  appUsage?: string;
  businessUsage?: string;
  timestamp?: string;
}

export interface IRateLimitInfo {
  limitType?: string;
  code?: number;
  message?: string;
}

export interface IThrottleInfo {
  expiryTime: number;
}
