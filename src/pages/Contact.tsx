
import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Send } from 'lucide-react';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would be connected to an actual form submission service
    alert('Thank you for your message. We will get back to you soon!');
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl py-6">
        <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Have questions about AdCompass? We're here to help. Fill out the form below, and our team will get back to you as soon as possible.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input id="subject" placeholder="How can we help?" required />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Please provide details about your inquiry..."
                  required
                  rows={5}
                />
              </div>
              
              <Button type="submit" className="w-full sm:w-auto">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Contact;
