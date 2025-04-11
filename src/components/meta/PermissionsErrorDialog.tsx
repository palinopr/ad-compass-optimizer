
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface PermissionsErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToToken: () => void;
  errorMessage?: string;
}

const PermissionsErrorDialog: React.FC<PermissionsErrorDialogProps> = ({ 
  open,
  onOpenChange,
  onSwitchToToken,
  errorMessage
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            Connection Error
          </DialogTitle>
          <DialogDescription>
            {errorMessage ? (
              <div className="text-red-500 font-medium mb-4 mt-2">
                Error: {errorMessage}
              </div>
            ) : (
              "Your app is currently experiencing permission restrictions with Meta."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">The recommended solution: System User Token</h4>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h5 className="font-medium text-sm mb-2">How to get a System User Token:</h5>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 pl-1">
                <li>Go to <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">Meta Business Settings <ExternalLink className="h-3 w-3 ml-0.5" /></a></li>
                <li>Click on <strong>System Users</strong> in the left sidebar</li>
                <li>Create a new System User or select an existing one</li>
                <li>Click <strong>Generate New Token</strong></li>
                <li>Select your Ad Account and request these specific permissions:
                  <ul className="list-disc list-inside ml-4 mt-1 text-sm text-gray-600">
                    <li><strong>ads_management</strong></li>
                    <li><strong>ads_read</strong></li>
                  </ul>
                </li>
                <li>Set an expiration date (90 days recommended)</li>
                <li>Copy your token and paste it in our token input field</li>
              </ol>
            </div>
            
            <Button 
              className="w-full mt-2"
              onClick={onSwitchToToken}
            >
              Switch to Token Method
            </Button>
          </div>
          
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-semibold text-sm">Alternative: App Review (for production apps)</h4>
            <p className="text-sm text-gray-500">
              Submit your app for review by Meta to request extended permissions.
              This process can take several weeks and is required for production apps.
            </p>
            <a
              href="https://developers.facebook.com/docs/app-review"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center"
            >
              Learn about Meta App Review <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 text-xs border-t pt-4 text-gray-500">
            <p className="font-medium mb-1">Technical Details:</p>
            <p className="font-mono bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {errorMessage}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsErrorDialog;
