
import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl py-6">
        <Link to="/settings" className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-sm text-gray-500 mb-4">Last Updated: April 11, 2025</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using AdCompass services, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
            
            <h2>2. Description of Service</h2>
            <p>
              AdCompass provides a platform for creating, managing, and analyzing advertising campaigns 
              on Meta platforms. Our services include campaign creation, audience targeting, performance 
              analytics, and related advertising management tools.
            </p>
            
            <h2>3. User Accounts</h2>
            <p>
              To use our services, you must create an account and connect your Meta advertising accounts. 
              You are responsible for maintaining the confidentiality of your account information and for 
              all activities that occur under your account.
            </p>
            
            <h2>4. Data Usage and Privacy</h2>
            <p>
              Our collection and use of your information is governed by our 
              <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 px-1">Privacy Policy</Link>, 
              which is incorporated into these Terms of Service.
            </p>
            
            <h2>5. Meta Platform Policies</h2>
            <p>
              When using our services to create and manage advertisements on Meta platforms, you must comply 
              with all applicable Meta advertising policies, community standards, and terms of service.
            </p>
            
            <h2>6. Content Responsibilities</h2>
            <p>
              You are solely responsible for the content of your advertisements and any associated materials. 
              Your content must not violate any applicable laws or infringe on any third-party rights.
            </p>
            
            <h2>7. Limitation of Liability</h2>
            <p>
              AdCompass is not liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of or inability to use our services.
            </p>
            
            <h2>8. Service Modifications</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of our services at any time, 
              with or without notice. We will not be liable to you or any third party for any modification, 
              suspension, or discontinuation.
            </p>
            
            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your access to our services immediately, without prior notice, 
              for conduct that we believe violates these Terms of Service or is harmful to other users, 
              us, or third parties, or for any other reason.
            </p>
            
            <h2>10. Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of the United States without regard to its 
              conflict of law provisions.
            </p>
            
            <h2>11. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will notify you of any changes 
              by posting the new Terms on this page. Your continued use of our services after such changes 
              constitutes acceptance of the new Terms.
            </p>
            
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at 
              <a href="mailto:legal@adcompass.example.com" className="text-blue-600 hover:text-blue-800 px-1">
                legal@adcompass.example.com
              </a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TermsOfService;
