
import React from 'react';
import MetaConnectCard from '@/components/meta/MetaConnectCard';
import AdAccountSelector from '@/components/meta/AdAccountSelector';

interface AccountsTabProps {
  isAuthenticated: boolean;
}

const AccountsTab: React.FC<AccountsTabProps> = ({ isAuthenticated }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetaConnectCard />
      {isAuthenticated && <AdAccountSelector />}
    </div>
  );
};

export default AccountsTab;
