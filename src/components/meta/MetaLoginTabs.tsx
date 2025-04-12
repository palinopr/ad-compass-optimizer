
import React from 'react';
import FacebookLoginTab from './FacebookLoginTab';

interface MetaLoginTabsProps {
  onLoginSuccess: (userData: any) => void;
  onError: (errorMessage: string) => void;
}

const MetaLoginTabs: React.FC<MetaLoginTabsProps> = ({ onLoginSuccess, onError }) => {
  return (
    <div className="space-y-6">
      <FacebookLoginTab onLoginSuccess={onLoginSuccess} />
    </div>
  );
};

export default MetaLoginTabs;
