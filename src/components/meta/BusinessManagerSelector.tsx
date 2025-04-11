
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Building } from 'lucide-react';
import { MetaApiService } from '@/services/MetaApiService';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

interface BusinessManager {
  id: string;
  name: string;
  verification_status?: string;
  created_time?: string;
}

interface BusinessManagerSelectorProps {
  onSelect: (businessManagerId: string) => void;
}

const BusinessManagerSelector: React.FC<BusinessManagerSelectorProps> = ({ onSelect }) => {
  const [businessManagers, setBusinessManagers] = useState<BusinessManager[]>([]);
  const [selectedBusinessManager, setSelectedBusinessManager] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBusinessManagers = async () => {
      try {
        const token = metaAuthService.getAccessToken();
        if (!token) {
          setError('Not authenticated with Meta');
          setIsLoading(false);
          return;
        }

        const businessManagersData = await MetaApiService.fetchBusinessManagers(token);
        setBusinessManagers(businessManagersData);
        
        // If there are business managers, select the first one by default
        if (businessManagersData.length > 0) {
          setSelectedBusinessManager(businessManagersData[0].id);
        }
      } catch (err) {
        setError('Failed to fetch Business Managers');
        toast({
          title: "Error",
          description: "Could not load Business Managers. Please try again.",
          variant: "destructive"
        });
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessManagers();
  }, [toast]);

  const handleContinue = () => {
    if (selectedBusinessManager) {
      onSelect(selectedBusinessManager);
      toast({
        title: "Business Manager Selected",
        description: "Business Manager selection successful."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-gray-500">Loading Business Managers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-4">
        <p className="font-medium">{error}</p>
        <p className="text-sm mt-2">Please try reconnecting your Facebook account.</p>
      </div>
    );
  }

  if (businessManagers.length === 0) {
    return (
      <div className="py-4">
        <p className="text-amber-600 font-medium">No Business Managers found for your account.</p>
        <p className="text-sm text-gray-500 mt-2">
          You need access to a Business Manager to connect ad accounts.
          Please create a Business Manager in Meta Business Suite first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-lg font-medium flex items-center">
        <Building className="mr-2 h-5 w-5" />
        Select Business Manager
      </h3>
      
      <p className="text-sm text-gray-500">
        Choose which Business Manager you want to use for accessing ad accounts.
      </p>
      
      <Select 
        value={selectedBusinessManager || ''} 
        onValueChange={setSelectedBusinessManager}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Business Manager" />
        </SelectTrigger>
        <SelectContent>
          {businessManagers.map((bm) => (
            <SelectItem key={bm.id} value={bm.id}>
              {bm.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedBusinessManager && (
        <div className="bg-gray-50 p-3 rounded-md border text-sm">
          <p className="font-medium">Selected Business Manager Details:</p>
          {businessManagers
            .filter(bm => bm.id === selectedBusinessManager)
            .map(bm => (
              <div key={bm.id} className="mt-1">
                <p><span className="text-gray-600">Name:</span> {bm.name}</p>
                <p><span className="text-gray-600">ID:</span> {bm.id}</p>
                {bm.verification_status && (
                  <p><span className="text-gray-600">Status:</span> {bm.verification_status}</p>
                )}
              </div>
            ))
          }
        </div>
      )}
      
      <Button 
        onClick={handleContinue} 
        disabled={!selectedBusinessManager}
        className="w-full"
      >
        Continue with Selected Business Manager
      </Button>
    </div>
  );
};

export default BusinessManagerSelector;
