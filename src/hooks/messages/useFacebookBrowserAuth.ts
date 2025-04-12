
import { useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

export const useFacebookBrowserAuth = (checkAuth: () => void, checkAuthAndState: () => void) => {
  const { toast } = useToast();

  const handleConnectWithBrowser = useCallback(() => {
    console.log("Browser-based connection initiated");
    toast({
      title: "Connecting with Meta",
      description: "Opening Facebook login window..."
    });
    
    try {
      const FB = (window as any).FB;
      
      if (FB) {
        FB.login(
          (response: any) => {
            console.log("Facebook login response:", response);
            if (response.authResponse) {
              const accessToken = response.authResponse.accessToken;
              console.log("Got access token:", accessToken);
              
              metaAuthService.storeAccessToken(
                accessToken, 
                response.authResponse.userID,
                'facebook_login',
                ['email', 'public_profile', 'ads_management', 'ads_read']
              );
              
              toast({
                title: "Connection Successful",
                description: "Successfully connected with Meta via browser"
              });
              
              checkAuth();
              setTimeout(checkAuthAndState, 500);
            } else {
              console.log('User cancelled login or did not fully authorize.');
              toast({
                title: "Connection Cancelled",
                description: "Facebook login was cancelled or failed",
                variant: "destructive"
              });
            }
          },
          { scope: 'email,public_profile,ads_management,ads_read' }
        );
      } else {
        console.error("Facebook SDK not loaded");
        toast({
          title: "Connection Failed",
          description: "Facebook SDK not available. Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error in Facebook login:", error);
      toast({
        title: "Connection Error",
        description: "An error occurred during Meta connection",
        variant: "destructive"
      });
    }
  }, [toast, checkAuth, checkAuthAndState]);
  
  return { handleConnectWithBrowser };
};
