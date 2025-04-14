
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPermissionErrorMessage, isPermissionError } from '@/services/api/meta-accounts/permissionErrors';
import { getSubcodeDescription } from '@/services/api/meta-accounts/errorSubcodes';

interface AdAccountErrorProps {
  error: string | null;
  onReconnect: () => void;
}

const AdAccountError: React.FC<AdAccountErrorProps> = ({ error, onReconnect }) => {
  // Format the error message to be more user-friendly
  const getFormattedError = () => {
    if (!error) {
      console.log('[❌ AD ACCOUNT ERROR] No error detected');
      return null;
    }

    console.log('[🔍 AD ACCOUNT ERROR] Raw Error:', error);

    try {
      // Try to parse if the error is a stringified JSON
      const parsedError = typeof error === 'string' && error.startsWith('{') 
        ? JSON.parse(error) 
        : null;

      console.log('[🔍 AD ACCOUNT ERROR] Parsed Error:', parsedError);

      if (parsedError?.error) {
        // Log specific error details for debugging
        console.log('[🔍 AD ACCOUNT ERROR] Code:', parsedError.error.code);
        console.log('[🔍 AD ACCOUNT ERROR] Subcode:', parsedError.error.error_subcode);
        console.log('[🔍 AD ACCOUNT ERROR] Message:', parsedError.error.message);

        const formattedMessage = getPermissionErrorMessage(parsedError.error);
        const subcodeDescription = parsedError.error.error_subcode ? 
          getSubcodeDescription(parsedError.error.error_subcode) : undefined;

        console.log('[✅ AD ACCOUNT ERROR SHOWN] Message:', formattedMessage);
        return {
          message: formattedMessage,
          isPermissionError: isPermissionError(parsedError.error),
          hasKnownSubcode: !!subcodeDescription
        };
      }

      // If we have a string error that's not JSON, show it directly
      console.log('[✅ AD ACCOUNT ERROR SHOWN] Message:', error);
      return { 
        message: error, 
        isPermissionError: false,
        hasKnownSubcode: false
      };
    } catch (e) {
      console.error('[❌ AD ACCOUNT ERROR] Error parsing:', e);
      // If parsing fails, return a fallback
      const fallbackMessage = error || 'Failed to fetch ad accounts. See console for details.';
      console.log('[✅ AD ACCOUNT ERROR SHOWN] Fallback Message:', fallbackMessage);
      return { 
        message: fallbackMessage, 
        isPermissionError: false,
        hasKnownSubcode: false
      };
    }
  };

  const formattedError = getFormattedError();
  
  if (!formattedError) return null;

  return (
    <div className="space-y-3">
      <Alert variant="destructive">
        <AlertDescription className="text-sm whitespace-pre-wrap break-words">
          {formattedError.message}
        </AlertDescription>
      </Alert>
      
      {/* Show reconnect button for known subcodes or permission errors */}
      {(formattedError.hasKnownSubcode || formattedError.isPermissionError) && (
        <div className="space-y-2">
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={onReconnect}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconnect Meta Account
          </Button>
          
          <div className="mt-2 text-sm text-muted-foreground text-center">
            Still not working? <Link 
              to="/meta-integration#diagnostics" 
              className="underline hover:text-primary"
            >
              Run Meta Diagnostics
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdAccountError;

