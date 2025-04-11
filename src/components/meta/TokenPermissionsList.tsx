
import React, { useState, useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const [permissions, setPermissions] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [permissionToggles, setPermissionToggles] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  const hasAdPerms = permissions.includes('ads_management') || permissions.includes('ads_read');

  useEffect(() => {
    // Load current permissions
    const currentPermissions = metaAuthService.getPermissions();
    setPermissions(currentPermissions);
    
    // Initialize toggle states based on current permissions
    const initialToggles: Record<string, boolean> = {};
    Object.keys(PERMISSION_CATEGORIES).forEach(perm => {
      initialToggles[perm] = currentPermissions.includes(perm);
    });
    setPermissionToggles(initialToggles);
  }, []);

  const togglePermission = (permission: string, enabled: boolean) => {
    setPermissionToggles(prev => ({
      ...prev,
      [permission]: enabled
    }));
  };

  const handleSavePermissions = () => {
    // Get all enabled permissions
    const newPermissions = Object.entries(permissionToggles)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([permission]) => permission);
    
    // Save the updated permissions
    metaAuthService.updatePermissions(newPermissions);
    setPermissions(newPermissions);
    setEditMode(false);
    
    toast({
      title: "Permissions Updated",
      description: "Your token permissions have been updated successfully."
    });
  };

  return (
    <div className="space-y-3">
      {!hasAdPerms && permissions.length > 0 && !editMode && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <ShieldAlert className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            You don't have ad management permissions. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Token Permissions</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Cancel" : "Edit Permissions"}
        </Button>
      </div>
      
      {editMode ? (
        <div className="space-y-3 border rounded-md p-3">
          {Object.entries(PERMISSION_CATEGORIES).map(([permission, info]) => (
            <div key={permission} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{info.label}</div>
                <div className="text-xs text-gray-500">{info.description}</div>
              </div>
              <Switch
                checked={permissionToggles[permission] || false}
                onCheckedChange={(checked) => togglePermission(permission, checked)}
                disabled={permission === 'public_profile' || permission === 'email'} // Basic permissions can't be disabled
              />
            </div>
          ))}
          
          <Button 
            className="mt-3 w-full"
            onClick={handleSavePermissions}
          >
            Save Permission Changes
          </Button>
        </div>
      ) : permissions.length === 0 ? (
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
