
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

const CampaignsQuickAccess = () => {
  const { isAuthenticated } = useMetaConnection();
  
  return (
    <Card className="border-blue-200 hover:shadow-md transition-shadow">
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <CardTitle className="flex items-center">
          <Tag className="mr-2 h-5 w-5 text-blue-600" />
          Meta Campaigns
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600">
          {isAuthenticated 
            ? "View and manage your Meta advertising campaigns. Configure ad accounts and review performance metrics."
            : "Connect your Meta account to create and manage advertising campaigns for your events."
          }
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link to="/campaigns" className="w-full">
          <Button variant="outline" className="w-full flex items-center justify-between">
            <span>{isAuthenticated ? "Manage Campaigns" : "Connect & Manage"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CampaignsQuickAccess;
