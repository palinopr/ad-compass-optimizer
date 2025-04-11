
import React, { useState, useEffect } from 'react';
import PermissionsErrorDialog from './PermissionsErrorDialog';

interface MetaConnectionErrorHandlerProps {
  errorMessage: string | null;
  onSwitchToToken: () => void;
}

const MetaConnectionErrorHandler: React.FC<MetaConnectionErrorHandlerProps> = ({
  errorMessage, 
  onSwitchToToken
}) => {
  const [showDialog, setShowDialog] = useState(false);
  
  useEffect(() => {
    if (errorMessage && 
      (errorMessage.includes("permission") || 
       errorMessage.includes("access token") ||
       errorMessage.includes("invalid"))) {
      setShowDialog(true);
    }
  }, [errorMessage]);

  return (
    <PermissionsErrorDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      onSwitchToToken={onSwitchToToken}
      errorMessage={errorMessage || undefined}
    />
  );
};

export default MetaConnectionErrorHandler;
