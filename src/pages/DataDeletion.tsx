
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const DataDeletion = () => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to process deletion request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setEmail('');
      setReason('');
      
      toast({
        title: "Request submitted successfully",
        description: "We'll process your data deletion request within 30 days."
      });
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="space-y-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">Data Deletion Request</h1>
        <p className="text-muted-foreground">
          Request deletion of your personal data in accordance with our Privacy Policy.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Data Deletion Request Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important Information</AlertTitle>
              <AlertDescription>
                Submitting this form will initiate the process to delete your personal data from our systems.
                This action cannot be undone. We will process your request within 30 days as required by 
                applicable privacy regulations.
              </AlertDescription>
            </Alert>
            
            {submitted ? (
              <div className="space-y-4 py-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-lg">Request Received</h3>
                    <p className="text-gray-600">
                      Your data deletion request has been submitted successfully. Our team will process your request 
                      and permanently delete your personal data from our systems within 30 days.
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">
                    If you have any questions regarding your deletion request, please contact us at{" "}
                    <a href="mailto:privacy@adcompass-example.com" className="text-blue-600 hover:underline">
                      privacy@adcompass-example.com
                    </a>
                  </p>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="mt-4"
                >
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter the email associated with your account"
                    required
                    autoComplete="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reason" className="text-sm font-medium">
                    Reason for Deletion (Optional)
                  </label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please let us know why you're requesting data deletion"
                    rows={4}
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!email || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></span>
                        Processing...
                      </>
                    ) : (
                      'Submit Deletion Request'
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  By submitting this form, you confirm that you want AdCompass to delete all personal data
                  associated with the provided email address. This process may take up to 30 days to complete.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              If you have any questions about the data deletion process or need assistance with your request, 
              please contact our privacy team at{" "}
              <a href="mailto:privacy@adcompass-example.com" className="text-blue-600 hover:underline">
                privacy@adcompass-example.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DataDeletion;
