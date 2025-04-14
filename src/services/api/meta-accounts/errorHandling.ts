import { toast } from '@/hooks/use-toast';
import { isPermissionError, getPermissionErrorMessage } from './permissionErrors';

export const displayApiError = (errorMsg: string, errorDetails?: string) => {
  // Parse error details if available
  let parsedError;
  try {
    parsedError = errorDetails ? JSON.parse(errorDetails) : null;
  } catch (e) {
    console.error('Failed to parse error details:', e);
  }

  // Show main error toast with permission-specific message if applicable
  toast({
    title: "Meta API Error",
    description: parsedError?.error 
      ? getPermissionErrorMessage(parsedError.error)
      : `${errorMsg}\n\nCheck console for details`,
    variant: "destructive",
    duration: 10000,
    action: null
  });
  
  // Show error details in separate toast when needed
  if (errorDetails) {
    toast({
      title: "Error Details",
      description: errorDetails.substring(0, 500) + (errorDetails.length > 500 ? '...' : ''),
      variant: "destructive",
      duration: 15000
    });
  }
};

export const handleJsonParseError = (responseText: string) => {
  console.error('[AD ACCOUNT FETCH] ❌ Failed to parse JSON response');
  
  if (responseText) {
    console.error('[AD ACCOUNT FETCH] Unparseable response body:', responseText);
    toast({
      title: "Meta API Error",
      description: "Failed to parse API response. Check console for details.",
      variant: "destructive",
      duration: 10000
    });
    
    // Show raw response
    toast({
      title: "Raw Response",
      description: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
      variant: "destructive",
      duration: 15000
    });
  }
};
