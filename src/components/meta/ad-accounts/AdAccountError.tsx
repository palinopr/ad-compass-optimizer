
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { getPermissionErrorMessage, isPermissionError } from '@/services/api/meta-accounts/permissionErrors';

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
        console.log('[✅ AD ACCOUNT ERROR SHOWN] Message:', formattedMessage);
        return {
          message: formattedMessage,
          isPermissionError: isPermissionError(parsedError.error)
        };
      }

      // If we have a string error that's not JSON, show it directly
      console.log('[✅ AD ACCOUNT ERROR SHOWN] Message:', error);
      return { message: error, isPermissionError: false };
    } catch (e) {
      console.error('[❌ AD ACCOUNT ERROR] Error parsing:', e);
      // If parsing fails, return a fallback
      const fallbackMessage = error || 'Failed to fetch ad accounts. See console for details.';
      console.log('[✅ AD ACCOUNT ERROR SHOWN] Fallback Message:', fallbackMessage);
      return { message: fallbackMessage, isPermissionError: false };
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
      
      {formattedError.isPermissionError && (
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={onReconnect}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reconnect Meta Account
        </Button>
      )}
    </div>
  );
};

export default AdAccountError;
