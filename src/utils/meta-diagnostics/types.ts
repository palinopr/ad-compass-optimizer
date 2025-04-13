
// Add or update the `ComprehensiveDiagnosticResult` interface to include `dataCheck`
export interface ComprehensiveDiagnosticResult {
  timestamp: string;
  browser: {
    userAgent: string;
    platform: string;
    language: string;
  };
  token: {
    hasToken: boolean;
    tokenLength: number;
    hasAdsRead: boolean;
    hasAdsManagement: boolean;
  };
  tokenAnalysis: TokenAnalysisResult;
  api: {
    success: boolean;
    error?: string;
  };
  cors: {
    hasCorsIssues: boolean;
    error?: string;
  };
  compatibility: {
    isCompatible: boolean;
    issues: string[];
  };
  proxy: {
    proxyTested: boolean;
    proxyWorked: boolean;
    error?: string;
  };
  summary: {
    overallStatus: 'high' | 'medium' | 'low' | 'none';
    issues: string[];
    recommendations: string[];
  };
  dataCheck?: {
    adAccountSelected: boolean;
    lastCampaignFetchAttempt?: string;
    lastCampaignFetchSuccess?: string;
    lastCampaignCount?: string;
  };
}

export interface TokenAnalysisResult {
  isValid: boolean;
  message: string;
  likelyIssue?: string;
  ageInDays?: number;
  daysUntilExpiry?: number;
}
