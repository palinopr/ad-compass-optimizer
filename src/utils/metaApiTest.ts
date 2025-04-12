
// Main export file for Meta API diagnostics
// This file maintains backward compatibility by re-exporting from the new modular files

import { testMetaApi } from './meta-diagnostics/apiTest';
import { checkForCorsIssues, testProxyApproach } from './meta-diagnostics/corsCheck';
import { testBrowserCompatibility } from './meta-diagnostics/browserCheck';
import { runComprehensiveDiagnostic } from './meta-diagnostics/comprehensiveDiagnostic';

export {
  testMetaApi,
  checkForCorsIssues,
  testProxyApproach,
  testBrowserCompatibility,
  runComprehensiveDiagnostic
};
