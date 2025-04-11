
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { ExternalLink, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MetaReviewGuide: React.FC = () => {
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Meta App Review Instructions</CardTitle>
        <CardDescription>
          Instructions for Meta review team to test our Facebook integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTitle className="flex items-center font-medium">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            App is ready for review
          </AlertTitle>
          <AlertDescription className="mt-2">
            This guide provides instructions for Meta reviewers to test our Facebook integration functionality.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Accessing the App</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>App URL:</strong>{' '}
              <a 
                href="https://ad-compass-optimizer.lovable.dev" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline flex items-center inline-flex"
              >
                https://ad-compass-optimizer.lovable.dev
                <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </li>
            <li>
              <strong>No login credentials are required</strong> to access the basic app interface.
            </li>
            <li>
              The app is accessible on desktop and mobile browsers without installation.
            </li>
          </ol>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Testing Facebook Integration</h3>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>On the homepage</strong>, locate the "Meta Business Integration" card.
            </li>
            <li>
              <strong>Click "Continue with Facebook"</strong> to test the basic authentication flow, or "Connect with Advanced Ad Permissions" to test the full scope of permissions.
            </li>
            <li>
              <strong>Complete the Facebook login process</strong> using your test account credentials.
            </li>
            <li>
              After successful authentication, you will be prompted to <strong>select a Business Manager</strong> from your Facebook account.
            </li>
            <li>
              Next, <strong>select ad accounts</strong> you wish to connect with the application.
            </li>
            <li>
              Upon successful connection, you will see a confirmation screen with your connected account details.
            </li>
            <li>
              You can test the <strong>logout functionality</strong> by clicking the "Disconnect" button.
            </li>
            <li>
              To test re-authentication, use the "Re-authenticate" button on the connected account screen.
            </li>
          </ol>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Data Deletion Instructions</h3>
          <p>
            We comply with Meta's data deletion requirements. Users can request deletion of their data via:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Navigating to the <Link to="/data-deletion" className="text-blue-600 hover:underline">Data Deletion</Link> page
            </li>
            <li>
              Using the "Request Data Deletion" button on the Profile page
            </li>
          </ol>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Contact Information for Support</h4>
          <p className="text-sm text-gray-600">
            If you encounter any issues during the review process, please contact our developer team at:
            <br />
            <a href="mailto:support@adcompass.example" className="text-blue-600 hover:underline">
              support@adcompass.example
            </a>
          </p>
          
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowRight className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaReviewGuide;
