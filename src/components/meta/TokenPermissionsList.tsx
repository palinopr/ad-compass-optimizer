
import React from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PERMISSION_CATEGORIES: Record<string, { label: string; description: string }> = {
  'ads_read': { 
    label: 'Read Ads', 
    description: 'View ad accounts, campaigns, and insights' 
  },
  'ads_management': { 
    label: 'Manage Ads', 
    description: 'Create and edit ad campaigns and assets' 
  },
  'public_profile': { 
    label: 'Basic Profile', 
    description: 'Access to name and profile picture' 
  },
  'email': { 
    label: 'Email', 
    description: 'Access to your email address' 
  },
  'pages_read_engagement': { 
    label: 'Page Insights', 
    description: 'View page engagement metrics' 
  },
  'pages_manage_ads': { 
    label: 'Page Ads', 
    description: 'Manage ads for your pages' 
  },
  'instagram_basic': { 
    label: 'Instagram Basic', 
    description: 'Access basic Instagram account information' 
  },
  'instagram_manage_insights': { 
    label: 'Instagram Insights', 
    description: 'View Instagram metrics and analytics' 
  },
  'read_insights': { 
    label: 'Read Insights', 
    description: 'Access to insights data across platforms' 
  },
  'business_management': { 
    label: 'Business Management', 
    description: 'Manage business assets and settings' 
  }
};

const TokenPermissionsList: React.FC = () => {
  const permissions = metaAuthService.getPermissions();
  const hasAdPerms = permissions.includes('ads_management') || permissions.includes('ads_read');

  return (
    <div className="space-y-3">
      {!hasAdPerms && permissions.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <ShieldAlert className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            You don't have ad management permissions. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}
      
      {permissions.length === 0 ? (
        <p className="text-sm text-gray-500">No specific permissions granted</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {permissions.map((permission) => {
            const permInfo = PERMISSION_CATEGORIES[permission] || { 
              label: permission, 
              description: 'Custom permission' 
            };
            
            return (
              <Badge 
                key={permission} 
                variant={permission.startsWith('ads_') ? "default" : "outline"}
                className="flex items-center gap-1 px-2 py-1"
              >
                <ShieldCheck className="h-3 w-3" />
                <span title={permInfo.description}>{permInfo.label}</span>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TokenPermissionsList;
