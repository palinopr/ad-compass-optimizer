
import { useCallback } from 'react';

export const useNavigation = () => {
  const handleConnectClick = useCallback(() => {
    console.log("Connect button clicked, forcing connection dialog");
    
    localStorage.setItem('show_meta_connection', 'true');
    sessionStorage.setItem('show_meta_connection', 'true');
    
    setTimeout(() => {
      window.location.href = '/meta-integration?tab=accounts';
    }, 1000);
  }, []);
  
  const handleSelectAdAccount = useCallback(() => {
    window.location.href = '/meta-integration?tab=accounts';
  }, []);
  
  return {
    handleConnectClick,
    handleSelectAdAccount
  };
};
