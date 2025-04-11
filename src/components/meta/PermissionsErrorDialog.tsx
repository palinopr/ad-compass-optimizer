
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
import { AlertCircle } from 'lucide-react';

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
      <DialogContent>
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

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Option 1: System User Token</h4>
            <p className="text-sm text-gray-500">
              For development, use a System User Token from Meta Business Settings
              with the appropriate permissions (ads_read, ads_management).
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Option 2: App Review</h4>
            <p className="text-sm text-gray-500">
              Submit your app for review by Meta to request the extended permissions.
              This is required for production apps using these permissions.
            </p>
          </div>

          <Button 
            className="w-full"
            onClick={onSwitchToToken}
          >
            Switch to Token Method
          </Button>
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
