
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ProfileQuickAccess = () => {
  return (
    <Card className="border-green-200 hover:shadow-md transition-shadow">
      <CardHeader className="bg-green-50 border-b border-green-100">
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5 text-green-600" />
          Account Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600">
          View and manage your account settings, Meta connections, and privacy preferences.
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link to="/profile" className="w-full">
          <Button variant="outline" className="w-full flex items-center justify-between">
            <span>Manage Profile</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProfileQuickAccess;
