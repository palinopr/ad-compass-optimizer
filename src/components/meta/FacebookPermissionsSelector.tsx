
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, ShieldCheck, Facebook, Users, Newspaper, BarChart3, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FACEBOOK_AD_PERMISSIONS } from '@/config/socialAuth';
import { Separator } from '@/components/ui/separator';

interface FacebookPermissionOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  scope: string;
  required?: boolean;
}

interface FacebookPermissionsSelectorProps {
  onPermissionsSelected: (permissions: string[]) => void;
  onCancel: () => void;
}

const FacebookPermissionsSelector: React.FC<FacebookPermissionsSelectorProps> = ({
  onPermissionsSelected,
  onCancel
}) => {
  const permissionOptions: FacebookPermissionOption[] = [
    // Note: Basic info is still required but won't be shown in the UI
    {
      id: 'basic_info',
      label: 'Basic Information',
      description: 'Your name, profile picture, and email',
      icon: <Shield className="h-4 w-4 text-blue-600" />,
      scope: 'public_profile,email',
      required: true,
      hidden: true // Mark as hidden to not display in UI
    },
    {
      id: 'ad_accounts',
      label: 'Ad Accounts',
      description: 'Access your ad accounts for campaign management',
      icon: <Building className="h-4 w-4 text-blue-600" />,
      scope: 'ads_management,ads_read',
      required: false
    },
    {
      id: 'pages',
      label: 'Facebook Pages',
      description: 'Manage your Facebook Pages and Page content',
      icon: <Facebook className="h-4 w-4 text-blue-600" />,
      scope: 'pages_manage_ads,pages_read_engagement',
      required: false
    },
    {
      id: 'instagram',
      label: 'Instagram Accounts',
      description: 'Access connected Instagram accounts',
      icon: <Users className="h-4 w-4 text-blue-600" />,
      scope: 'instagram_basic,instagram_manage_insights',
      required: false
    },
    {
      id: 'insights',
      label: 'Insights & Analytics',
      description: 'View analytics and insights data',
      icon: <BarChart3 className="h-4 w-4 text-blue-600" />,
      scope: 'read_insights,business_management',
      required: false
    }
  ];

  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({
    basic_info: true, // Basic info is required
    ad_accounts: true, // Ad accounts is selected by default
    pages: false,
    instagram: false,
    insights: false,
  });

  const handleCheckboxChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions({
      ...selectedPermissions,
      [permissionId]: checked
    });
  };

  const handleContinue = () => {
    // Collect all selected permission scopes
    const selectedScopes = permissionOptions
      .filter(option => selectedPermissions[option.id])
      .flatMap(option => option.scope.split(','));
    
    // Remove duplicates
    const uniqueScopes = Array.from(new Set(selectedScopes));
    
    onPermissionsSelected(uniqueScopes);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-center mb-4">
        <ShieldCheck className="h-8 w-8 text-meta-blue" />
        <h3 className="text-lg font-medium ml-2">Select Permissions</h3>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        Choose what information you want to allow this app to access. Basic information is required but won't be shown in permissions list.
      </p>
      
      <div className="space-y-4">
        {permissionOptions.filter(option => !option.hidden).map((option) => (
          <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-slate-50">
            <Checkbox 
              id={option.id} 
              checked={selectedPermissions[option.id]} 
              onCheckedChange={(checked) => handleCheckboxChange(option.id, checked === true)}
              disabled={option.required}
            />
            <div className="grid gap-1.5">
              <div className="flex items-center">
                {option.icon}
                <label
                  htmlFor={option.id}
                  className="text-sm font-medium leading-none ml-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label} {option.required && <span className="text-xs text-meta-blue">(Required)</span>}
                </label>
              </div>
              <p className="text-xs text-muted-foreground">{option.description}</p>
              <div className="text-xs text-gray-400 font-mono mt-1">
                Permissions: {option.scope.split(',').join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleContinue}>
          Continue with Selected Permissions
        </Button>
      </div>
    </div>
  );
};

export default FacebookPermissionsSelector;
