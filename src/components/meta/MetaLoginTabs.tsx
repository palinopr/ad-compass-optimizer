
import React from 'react';
import FacebookLoginTab from './FacebookLoginTab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Facebook } from 'lucide-react';

interface MetaLoginTabsProps {
  onLoginSuccess: (userData: any) => void;
  onError: (errorMessage: string) => void;
}

const MetaLoginTabs: React.FC<MetaLoginTabsProps> = ({ onLoginSuccess, onError }) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Facebook className="mr-2 h-5 w-5 text-[#1877F2]" />
          Connect with Facebook
        </CardTitle>
        <CardDescription>
          Login with Facebook to bypass CORS restrictions and access your Meta Ads data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FacebookLoginTab onLoginSuccess={onLoginSuccess} />
      </CardContent>
    </Card>
  );
};

export default MetaLoginTabs;
