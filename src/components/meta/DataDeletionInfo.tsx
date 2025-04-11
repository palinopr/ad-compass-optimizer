
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash, ExternalLink, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const DataDeletionInfo: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trash className="w-5 h-5 mr-2 text-red-500" />
          Meta User Data Deletion
        </CardTitle>
        <CardDescription>
          Information about how to delete your Meta user data from our application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          In compliance with Meta Platform Terms, we provide a way for users to delete their data 
          from our application. Your privacy is important to us.
        </p>
        
        <div className="rounded-md bg-gray-50 p-4">
          <h3 className="text-sm font-medium mb-2">How to request data deletion:</h3>
          <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
            <li>Visit our <Link to="/data-deletion" className="text-blue-600 hover:underline">Data Deletion</Link> page</li>
            <li>Submit a deletion request through the form</li>
            <li>Your Meta user data will be permanently removed from our systems</li>
          </ol>
        </div>
        
        <p className="text-sm flex items-center">
          <Mail className="h-4 w-4 mr-1.5" />
          For data deletion support, contact us at: 
          <a href="mailto:contact@outletmedia.net" className="text-blue-600 hover:underline ml-1">
            contact@outletmedia.net
          </a>
        </p>
        
        <div className="text-xs text-gray-500">
          <p>App ID: 1356517842213704</p>
          <p>This data deletion mechanism complies with Meta's Platform Terms.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataDeletionInfo;
