
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import AdAccountSelector from '@/components/meta/AdAccountSelector';

interface AdAccountSectionProps {
  isAuthenticated: boolean;
}

const AdAccountSection: React.FC<AdAccountSectionProps> = ({ isAuthenticated }) => {
  if (!isAuthenticated) return null;
  
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-blue-800">
          <Briefcase className="mr-2 h-5 w-5" />
          Ad Account Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-blue-700 mb-4">
          Select an ad account to use with your Meta campaigns and ads. 
          This account will be used for all campaign operations.
        </p>
        <AdAccountSelector />
      </CardContent>
    </Card>
  );
};

export default AdAccountSection;
