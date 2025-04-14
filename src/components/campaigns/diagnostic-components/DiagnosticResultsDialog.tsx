import React, { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, RefreshCw, Loader2, ExternalLink, Copy, ClipboardCheck } from 'lucide-react';
import DiagnosticResults from './DiagnosticResults';
import TokenDetails from './TokenDetails';
import { toast } from '@/hooks/use-toast';

interface DiagnosticResultsDialogProps {
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  diagnosticResults: any;
  hasIssues: boolean;
  isRunningDiagnostic: boolean;
  runDiagnostics: () => void;
}

const DiagnosticResultsDialog: React.FC<DiagnosticResultsDialogProps> = ({
  showResults,
  setShowResults,
  diagnosticResults,
  hasIssues,
  isRunningDiagnostic,
  runDiagnostics
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const formatDiagnosticResults = () => {
    if (!diagnosticResults) return '';
    
    const sections = [
      '# Campaign Loading Diagnostic Results',
      '',
      '## Issues Detected:',
      ...(diagnosticResults.summary?.issues || []).map(issue => `• ${issue}`),
      '',
      '## Recommended Solutions:',
      ...(diagnosticResults.summary?.recommendations || []).map(rec => `• ${rec}`),
      '',
      '## Token Details:',
      `- Has Token: ${diagnosticResults.token?.hasToken}`,
      `- Token Length: ${diagnosticResults.token?.tokenLength} characters`,
      `- Token Age: ${diagnosticResults.token?.age || 'Unknown'} days`,
      `- Token Source: ${diagnosticResults.token?.source}`,
      `- Permissions: ${diagnosticResults.token?.permissions?.join(', ')}`,
      '',
      '## API Status:',
      `- Last Check: ${new Date().toLocaleString()}`,
      `- Success: ${diagnosticResults.api?.success}`,
      '',
      '## Data Loading:',
      `- Campaign Count: ${localStorage.getItem('last_campaign_count') || '0'}`,
      `- Selected Ad Account: ${localStorage.getItem('selected_ad_account') || 'None'}`,
      '',
      '## Troubleshooting Notes:',
      '- Check browser console for detailed network errors',
      '- Verify Meta API permissions',
      '- Consider Facebook authentication to bypass CORS issues'
    ];
    
    return sections.join('\n');
  };

  const handleCopyDiagnostics = () => {
    const diagnosticText = formatDiagnosticResults();
    
    navigator.clipboard.writeText(diagnosticText).then(() => {
      setIsCopied(true);
      toast({
        title: "Diagnostic Information Copied",
        description: "Diagnostic details have been copied to clipboard",
        variant: "default"
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy diagnostic information', err);
      toast({
        title: "Copy Failed",
        description: "Unable to copy diagnostic information",
        variant: "destructive"
      });
    });
  };

  return (
    <AlertDialog open={showResults} onOpenChange={setShowResults}>
      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {hasIssues ? (
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              )}
              Campaign Loading Diagnostic Results
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyDiagnostics}
              className="flex items-center gap-2"
            >
              {isCopied ? (
                <ClipboardCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {isCopied ? "Copied" : "Copy Diagnostics"}
            </Button>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasIssues
              ? "We've found some issues that might be affecting your campaign data loading"
              : "All systems look good, but here are some details about your connection"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isRunningDiagnostic ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
            <p>Running comprehensive diagnostics...</p>
          </div>
        ) : diagnosticResults ? (
          <div className="space-y-4">
            <DiagnosticResults 
              diagnosticResults={diagnosticResults} 
              hasIssues={hasIssues} 
            />
            
            {diagnosticResults.token && (
              <TokenDetails tokenInfo={diagnosticResults.token} tokenAnalysis={diagnosticResults.tokenAnalysis} />
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">
            No diagnostic information available
          </div>
        )}

        <AlertDialogFooter className="flex flex-row justify-between items-center">
          <Button
            variant="outline"
            onClick={runDiagnostics}
            disabled={isRunningDiagnostic}
            className="flex items-center gap-2"
          >
            {isRunningDiagnostic ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRunningDiagnostic ? "Running..." : "Run New Diagnostic"}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowResults(false)}
            >
              Close
            </Button>
            
            <a 
              href="https://developers.facebook.com/docs/marketing-api/overview"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Meta API Docs
              </Button>
            </a>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DiagnosticResultsDialog;
