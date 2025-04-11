
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <AppLayout>
      <div className="space-y-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: April 2025</p>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <section>
              <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
              <p className="leading-relaxed">
                AdCompass ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                Please read this Privacy Policy carefully. By accessing or using the application, you acknowledge that you have read, understood, and agree to be bound by all the terms outlined in this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>
              <p className="leading-relaxed mb-2">
                We may collect the following types of information when you use our application:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and authentication credentials.</li>
                <li><strong>Meta Ads Data:</strong> With your authorization, we access your Meta advertising account data through the Meta Marketing API.</li>
                <li><strong>Usage Data:</strong> We collect information on how you interact with our application, including actions taken and features used.</li>
                <li><strong>Device Information:</strong> We may collect information about your device, including IP address, browser type, and operating system.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-2">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Providing and maintaining our application</li>
                <li>Analyzing your advertising performance and providing insights</li>
                <li>Creating and optimizing advertising campaigns</li>
                <li>Improving our application and user experience</li>
                <li>Communicating with you about updates and features</li>
                <li>Responding to your requests and customer support needs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">4. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-2">
                We may share your information in the following situations:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>Third-Party Service Providers:</strong> We may share your information with service providers who perform services on our behalf.</li>
                <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale, your information may be transferred.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information when required by law or in response to valid legal requests.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">5. Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate security measures to protect your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">6. Your Data Rights</h2>
              <p className="leading-relaxed mb-2">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to request deletion of your information</li>
                <li>The right to restrict or object to processing</li>
                <li>The right to data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">7. Data Deletion</h2>
              <p className="leading-relaxed">
                To request deletion of your personal data, please visit our <a href="/data-deletion" className="text-blue-600 hover:underline">Data Deletion</a> page or contact us at privacy@adcompass-example.com.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">8. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">9. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at privacy@adcompass-example.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PrivacyPolicy;
