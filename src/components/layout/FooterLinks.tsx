
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const FooterLinks: React.FC = () => {
  return (
    <footer className="mt-auto py-4 bg-gray-50 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
          <Link to="/terms-of-service" className="flex items-center hover:text-gray-900 transition-colors">
            <FileText className="w-4 h-4 mr-1" />
            Terms of Service
          </Link>
          
          <span className="hidden sm:inline">•</span>
          
          <Link to="/privacy-policy" className="flex items-center hover:text-gray-900 transition-colors">
            <Shield className="w-4 h-4 mr-1" />
            Privacy Policy
          </Link>
          
          <span className="hidden sm:inline">•</span>
          
          <Link to="/contact" className="flex items-center hover:text-gray-900 transition-colors">
            <MessageSquare className="w-4 h-4 mr-1" />
            Contact Us
          </Link>
        </div>
        
        <Separator className="my-3" />
        
        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AdCompass. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterLinks;
