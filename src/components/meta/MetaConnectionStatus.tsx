
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';
import { META_API_CONFIG } from '@/config/socialAuth';
import SystemUserTokenGuide from './SystemUserTokenGuide';

interface ConnectionStep {
  id: string;
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
}

const MetaConnectionStatus: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionSteps, setConnectionSteps] = useState<ConnectionStep[]>([
    { id: 'token', name: 'Token Validation', status: 'pending', message: 'Checking token...' },
    { id: 'permissions', name: 'Permission Check', status: 'pending', message: 'Checking permissions...' },
    { id: 'api', name: 'API Connection', status: 'pending', message: 'Testing API connection...' },
    { id: 'adaccounts', name: 'Ad Accounts Access', status: 'pending', message: 'Checking ad accounts access...' }
  ]);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error' | 'warning'>('pending');
  const [progressValue, setProgressValue] = useState(0);
  
  useEffect(() => {
    checkConnectionStatus();
  }, []);
  
  const checkConnectionStatus = async () => {
    setIsChecking(true);
    setProgressValue(0);
    
    // Reset all steps to pending
    setConnectionSteps(steps => steps.map(step => ({
      ...step,
      status: 'pending',
      message: `Checking ${step.name.toLowerCase()}...`
    })));
    
    // Step 1: Check if token exists and validate format
    await updateStep(0, async () => {
      const token = metaAuthService.getAccessToken();
      
      if (!token) {
        return { 
          status: 'error', 
          message: 'No token found. Please connect your Meta account.' 
        };
      }
      
      // Check token format
      if (token.length < 50) {
        return { 
          status: 'error', 
          message: 'Token is too short. Meta tokens are typically much longer.' 
        };
      }
      
      // Check token freshness
      const freshness = metaAuthService.checkTokenFreshness();
      if (!freshness.isFresh) {
        return { 
          status: 'warning', 
          message: `Token is ${freshness.age} days old and may be expired. Consider generating a new token.` 
        };
      }
      
      return { 
        status: 'success', 
        message: 'Token format appears valid.' 
      };
    });
    
    // Step 2: Check permissions
    await updateStep(1, async () => {
      const token = metaAuthService.getAccessToken();
      if (!token || connectionSteps[0].status === 'error') {
        return { 
          status: 'pending', 
          message: 'Cannot check permissions without a valid token.' 
        };
      }
      
      const permissions = metaAuthService.getPermissions();
      const requiredPermissions = META_API_CONFIG.adPermissions;
      
      const missingPermissions = requiredPermissions.filter(
        perm => !permissions.includes(perm)
      );
      
      if (missingPermissions.length > 0) {
        return { 
          status: 'error', 
          message: `Missing required permissions: ${missingPermissions.join(', ')}` 
        };
      }
      
      return { 
        status: 'success', 
        message: 'All required permissions are present.' 
      };
    });
    
    // Step 3: Test basic API connection
    await updateStep(2, async () => {
      const token = metaAuthService.getAccessToken();
      if (!token || connectionSteps[0].status === 'error') {
        return { 
          status: 'pending', 
          message: 'Cannot test API connection without a valid token.' 
        };
      }
      
      try {
        const response = await fetch(
          `https://graph.facebook.com/${META_API_CONFIG.apiVersion}/me?access_token=${token}`
        );
        
        const data = await response.json();
        
        if (data.error) {
          return { 
            status: 'error', 
            message: `API Error ${data.error.code}: ${data.error.message}` 
          };
        }
        
        return { 
          status: 'success', 
          message: `Connected as ${data.name || 'User'} (ID: ${data.id})` 
        };
      } catch (error) {
        return { 
          status: 'error', 
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }
    });
    
    // Step 4: Check ad accounts access
    await updateStep(3, async () => {
      const token = metaAuthService.getAccessToken();
      if (!token || connectionSteps[0].status === 'error' || connectionSteps[2].status === 'error') {
        return { 
          status: 'pending', 
          message: 'Cannot check ad accounts without API connection.' 
        };
      }
      
      try {
        const response = await fetch(
          `https://graph.facebook.com/${META_API_CONFIG.apiVersion}/me/adaccounts?fields=name,account_id&limit=5&access_token=${token}`
        );
        
        const data = await response.json();
        
        if (data.error) {
          return { 
            status: 'error', 
            message: `Ad Accounts Error ${data.error.code}: ${data.error.message}` 
          };
        }
        
        const adAccountCount = (data.data || []).length;
        
        if (adAccountCount === 0) {
          return { 
            status: 'warning', 
            message: 'No ad accounts found. Make sure your token has access to the correct ad accounts.' 
          };
        }
        
        return { 
          status: 'success', 
          message: `Found ${adAccountCount} ad account(s).` 
        };
      } catch (error) {
        return { 
          status: 'error', 
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }
    });
    
    // Get the updated steps after all checks are done
    const updatedSteps = [...connectionSteps];
    
    // Calculate overall status based on the final state of all steps
    const statuses = updatedSteps.map(step => step.status);
    
    if (statuses.includes('error')) {
      setOverallStatus('error');
    } else if (statuses.includes('warning')) {
      setOverallStatus('warning');
    } else if (statuses.includes('pending')) {
      setOverallStatus('pending');
    } else {
      // If no error, warning, or pending statuses, then everything is successful
      setOverallStatus('success');
    }
    
    setProgressValue(100);
    setIsChecking(false);
  };
  
  const updateStep = async (stepIndex: number, checkFn: () => Promise<{ status: ConnectionStep['status'], message: string }>) => {
    // Update progress
    setProgressValue(prev => Math.min(100, prev + 25));
    
    try {
      const result = await checkFn();
      
      setConnectionSteps(steps => steps.map((step, index) => 
        index === stepIndex ? { ...step, ...result } : step
      ));
      
      return result;
    } catch (error) {
      setConnectionSteps(steps => steps.map((step, index) => 
        index === stepIndex ? { 
          ...step, 
          status: 'error', 
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        } : step
      ));
      
      return { status: 'error', message: 'Check failed' };
    }
  };
  
  const getStatusBadge = (status: ConnectionStep['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge className="bg-gray-500">Pending</Badge>;
    }
  };
  
  const getStatusIcon = (status: ConnectionStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-200" />;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Meta Connection Status</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkConnectionStatus}
          disabled={isChecking}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Refresh Status'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Overall Connection Status</h3>
              <p className="text-sm text-gray-500">
                {overallStatus === 'success' 
                  ? 'Your Meta connection is working correctly' 
                  : 'There are issues with your Meta connection'}
              </p>
            </div>
            <div>
              {getStatusBadge(overallStatus)}
            </div>
          </div>
          
          {/* Progress */}
          <Progress value={progressValue} className="h-2" />
          
          {/* Steps */}
          <div className="space-y-4">
            {connectionSteps.map((step) => (
              <div key={step.id} className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{step.name}</h4>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.message}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Recommendations */}
          {overallStatus !== 'success' && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Recommendations</h3>
              
              {connectionSteps.some(step => step.status === 'error' || step.status === 'warning') && (
                <div className="space-y-4">
                  {connectionSteps[0].status === 'error' && (
                    <div className="p-3 bg-red-50 rounded-md">
                      <h4 className="font-medium text-red-800">Token Issues</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Your token appears to be invalid or missing. Please reconnect your Meta account.
                      </p>
                    </div>
                  )}
                  
                  {connectionSteps[1].status === 'error' && (
                    <div className="p-3 bg-red-50 rounded-md">
                      <h4 className="font-medium text-red-800">Permission Issues</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Your token is missing required permissions. Please generate a new System User Token with the correct permissions.
                      </p>
                    </div>
                  )}
                  
                  {(connectionSteps[2].status === 'error' || connectionSteps[3].status === 'error') && (
                    <div className="p-3 bg-red-50 rounded-md">
                      <h4 className="font-medium text-red-800">API Connection Issues</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Cannot connect to Meta API. Your token may be expired or invalid. Please generate a new System User Token.
                      </p>
                    </div>
                  )}
                  
                  <SystemUserTokenGuide />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaConnectionStatus;
