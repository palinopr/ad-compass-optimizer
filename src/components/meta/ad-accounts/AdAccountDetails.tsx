
import React from 'react';

interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  business_name?: string;
  currency: string;
}

interface AdAccountDetailsProps {
  account: AdAccount;
}

const AdAccountDetails: React.FC<AdAccountDetailsProps> = ({ account }) => {
  return (
    <div className="space-y-1">
      <p><span className="font-medium">Name:</span> {account.name || account.business_name}</p>
      <p><span className="font-medium">Account ID:</span> {account.account_id}</p>
      <p><span className="font-medium">Currency:</span> {account.currency}</p>
    </div>
  );
};

export default AdAccountDetails;
