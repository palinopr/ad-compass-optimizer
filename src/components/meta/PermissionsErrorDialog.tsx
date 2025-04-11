
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

interface PermissionsErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToToken: () => void;
}

const PermissionsErrorDialog: React.FC<PermissionsErrorDialogProps> = ({ 
  open,
  onOpenChange,
  onSwitchToToken
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permission Restrictions</DialogTitle>
          <DialogDescription>
            Your app is currently using limited permissions during development. 
            To access ad data, you have two options:
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
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsErrorDialog;
