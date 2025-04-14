
export interface TokenAnalysisResult {
  isValid: boolean;
  message: string;
  severity: 'high' | 'medium' | 'low';
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
  token: {
    hasToken: boolean;
    tokenLength?: number;
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
}

