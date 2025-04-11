
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash, Shield, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';

const DataDeletion = () => {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Pre-fill userId if user is logged in with Meta
  React.useEffect(() => {
    const metaUserId = metaAuthService.getUserId();
    if (metaUserId) {
      setUserId(metaUserId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // If the user is logged in with Meta, also log them out
      if (metaAuthService.isAuthenticated()) {
        metaAuthService.logout();
      }
      
      toast({
        title: "Request Submitted",
        description: "Your data deletion request has been received. We will process it within 30 days."
      });
      
      setIsSubmitting(false);
      setEmail('');
      setUserId('');
      setMessage('');
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-8">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Data Deletion Request</h1>
        <p className="text-muted-foreground mb-6">
          Request deletion of your user data from JO Media (App ID: 1356517842213704)
        </p>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                About Data Deletion
              </CardTitle>
              <CardDescription>
                Information about how we handle deletion of your Meta user data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                In compliance with Meta Platform Terms, we provide this dedicated method for users to delete their data 
                from our application. When you request deletion, we will:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Remove all your personal information associated with Facebook/Meta</li>
                <li>Delete any stored access tokens and authentication data</li>
                <li>Remove your user profile and associated ad account data</li>
                <li>Delete any analytics or insights data linked to your account</li>
              </ul>
              
              <p className="text-sm text-gray-600">
                Data deletion will be processed within 30 days of your request. 
                After processing, your data will be permanently deleted from our systems.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trash className="w-5 h-5 mr-2 text-red-500" />
                Request Data Deletion
              </CardTitle>
              <CardDescription>
                Fill out this form to request deletion of your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="userId" className="text-sm font-medium">
                    Meta User ID (if known)
                  </label>
                  <Input
                    id="userId"
                    placeholder="Your Meta User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    If you're currently logged in with Meta, this will be automatically filled.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Additional Information (optional)
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Any additional details about your deletion request"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Submit Deletion Request"}
                </Button>
                
                <p className="text-center text-xs text-gray-500 pt-3">
                  You can also email deletion requests to:{" "}
                  <a href="mailto:contact@outletmedia.net" className="text-blue-600 hover:underline">
                    contact@outletmedia.net
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DataDeletion;
