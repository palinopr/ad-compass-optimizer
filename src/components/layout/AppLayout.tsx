import React from 'react';
import { Sidebar } from './Sidebar';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useMetaConnection();
  const [showConnectDialog, setShowConnectDialog] = React.useState(false);

  React.useEffect(() => {
    // Check if we need to show connection dialog
    const needsConnection = localStorage.getItem('show_meta_connection') === 'true';
    if (needsConnection && !isAuthenticated) {
      setShowConnectDialog(true);
      localStorage.removeItem('show_meta_connection');
    }
  }, [isAuthenticated]);

  const handleConnectionSuccess = (userData: any) => {
    console.log('Connection successful:', userData);
    setShowConnectDialog(false);
  };

  const handleConnectionError = (errorMessage: string) => {
    console.error('Connection error:', errorMessage);
    // Keep dialog open on error
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
      
      {/* Meta Connection Dialog */}
      <MetaConnectionDialog
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        onSuccess={handleConnectionSuccess}
        onError={handleConnectionError}
      />
    </div>
  );
};

export default AppLayout;
