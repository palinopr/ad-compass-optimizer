
import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const BusinessIntegrationInfo: React.FC = () => {
  return (
    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
      <div className="flex items-start space-x-2">
        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="font-medium text-amber-800">Business Integration Required</h3>
          <p className="text-amber-700">
            Advanced ad permissions require a Business Integration approval from Meta. 
            During the connection process, you'll see a "Business Integrations" dialog 
            asking you to approve access to your business assets.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-blue-700 text-xs">
            <strong>Development Mode:</strong> Currently using basic permissions only. 
            Advanced permissions like ads_management, ads_read, business_management 
            require Meta App Review before they can be used in production.
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm font-medium text-amber-900">
                How to approve Business Integration
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-1 text-amber-700 pl-1">
                  <li>Click "Connect with Advanced Ad Permissions"</li>
                  <li>In the Facebook login dialog, accept the permissions</li>
                  <li>You'll see a "Business Integrations" screen</li>
                  <li>Click "Continue" to grant access to your business assets</li>
                  <li>Select the business(es) you want to connect with</li>
                  <li>Complete the Facebook flow to return to the app</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm font-medium text-amber-900">
                App Review Requirements
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-amber-700 mb-2">
                  Before your app can request advanced permissions in production, you must:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-amber-700 pl-1">
                  <li>Complete the Meta App Review process</li>
                  <li>Submit your app for review with detailed use cases</li>
                  <li>Explain why each permission is needed</li>
                  <li>Provide testing instructions for Meta's review team</li>
                  <li>Get approval for each requested permission</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div>
            <a 
              href="https://www.facebook.com/business/help/1710077379203657" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:underline"
            >
              Learn more about Business Integrations
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntegrationInfo;
