
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon, Shield, Trash2, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings.</p>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              Application Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Settings management interface will be implemented here.</p>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy Policy
              </CardTitle>
              <CardDescription>
                Review our privacy policy and data handling practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Our privacy policy explains how we collect, use, and protect your personal information
                when you use our application.
              </p>
              <Link 
                to="/privacy-policy" 
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View Privacy Policy
                <ExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Terms of Service
              </CardTitle>
              <CardDescription>
                Review our terms of service agreement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Our terms of service outline the rules and guidelines for using our application
                and your rights and responsibilities as a user.
              </p>
              <Link 
                to="/terms-of-service" 
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View Terms of Service
                <ExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                Data Deletion
              </CardTitle>
              <CardDescription>
                Request deletion of your personal data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                You can request permanent deletion of all your personal data that we have collected
                through our application.
              </p>
              <Link 
                to="/data-deletion" 
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Request Data Deletion
                <ExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
