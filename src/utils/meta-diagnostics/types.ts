
// Types for the Meta diagnostics utilities

export interface ApiTestResult {
  success: boolean;
  data?: any;
  error: string;
}

export interface CorsCheckResult {
  hasCorsIssues: boolean;
  corsHeaders?: {
    'access-control-allow-origin': string | null;
    'access-control-allow-methods': string | null;
    'access-control-allow-headers': string | null;
  };
  error: string;
}

export interface ProxyTestResult {
  success: boolean;
  proxyTested: boolean;
  proxyWorked: boolean;
  data?: any;
  error: string;
}

export interface BrowserCompatibilityResult {
  browser: {
    userAgent: string;
    isIE: boolean;
    isOldEdge: boolean;
    hasFetch: boolean;
    hasLocalStorage: boolean;
    hasCookies: boolean;
    hasPrivacyFeatures: boolean;
  };
  compatibility: {
    score: number;
    issues: string[];
  };
}

export interface TokenDiagnosticResult {
  hasToken: boolean;
  tokenLength: number;
  hasWhitespace: boolean;
  hasInvalidChars: boolean;
  permissions: string[];
  hasAdsManagement: boolean;
  hasAdsRead: boolean;
  tokenAge: number | null;
}

export interface TokenAnalysisResult {
  issues: string[];
  recommendations: string[];
  severity: 'ok' | 'medium' | 'high';
}

export interface DiagnosticSummary {
  overallStatus: string;
  issues: string[];
  recommendations: string[];
}

export interface ComprehensiveDiagnosticResult {
  timestamp: string;
  browser: {
    userAgent: string;
    platform: string;
    language: string;
  };
  token: TokenDiagnosticResult;
  tokenAnalysis: TokenAnalysisResult;
  api: ApiTestResult;
  cors: CorsCheckResult;
  compatibility: BrowserCompatibilityResult;
  proxy: {
    proxyTested: boolean;
    proxyWorked: boolean;
    error: string;
  };
  summary: DiagnosticSummary;
}
