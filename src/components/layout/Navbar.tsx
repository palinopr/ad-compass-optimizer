
import React from 'react';
import { Bell, HelpCircle, Search, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold flex items-center">
          <span className="text-meta-blue">Ad</span>
          <span className="text-gray-800">Compass</span>
        </h1>
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search campaigns, ad sets..." 
            className="pl-8 w-64 h-9"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="w-5 h-5 text-gray-600" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
