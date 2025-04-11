
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const PrivacyTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Privacy Settings
        </CardTitle>
        <CardDescription>Manage your privacy and data preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            Your data is handled in accordance with our 
            <a href="/privacy-policy" className="text-blue-600 hover:underline mx-1">Privacy Policy</a> 
            and 
            <a href="/terms-of-service" className="text-blue-600 hover:underline mx-1">Terms of Service</a>.
          </p>
          
          <p>
            To request deletion of your account data, please visit our 
            <a href="/data-deletion" className="text-blue-600 hover:underline mx-1">Data Deletion</a> 
            page or contact us at 
            <a href="mailto:contact@outletmedia.net" className="text-blue-600 hover:underline mx-1">contact@outletmedia.net</a>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyTab;
