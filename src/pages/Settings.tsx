
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from '@/components/layout/Navbar';
import AppSidebar from '@/components/layout/Sidebar';

const Settings = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 bg-gray-50 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium mb-4">Account Settings</h2>
                  <div className="divide-y">
                    <div className="py-4">
                      <h3 className="text-sm font-medium">Profile Information</h3>
                      <p className="text-sm text-gray-500 mt-1">Update your account profile details</p>
                    </div>
                    <div className="py-4">
                      <h3 className="text-sm font-medium">Password</h3>
                      <p className="text-sm text-gray-500 mt-1">Change your password</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium mb-4">API Connections</h2>
                  <div className="divide-y">
                    <div className="py-4">
                      <h3 className="text-sm font-medium">Meta Ads API</h3>
                      <p className="text-sm text-gray-500 mt-1">Configure your Meta Marketing API connection</p>
                    </div>
                    <div className="py-4">
                      <h3 className="text-sm font-medium">Google Ads API</h3>
                      <p className="text-sm text-gray-500 mt-1">Configure your Google Ads API connection</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium mb-4">Appearance</h2>
                  <div className="divide-y">
                    <div className="py-4">
                      <h3 className="text-sm font-medium">Theme</h3>
                      <p className="text-sm text-gray-500 mt-1">Select your preferred interface theme</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
