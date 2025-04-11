
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBusinessManagers } from '@/hooks/useBusinessManagers';
import BusinessManagerLoading from './business/BusinessManagerLoading';
import BusinessManagerError from './business/BusinessManagerError';
import NoBusinessManagers from './business/NoBusinessManagers';
import BusinessManagerDetails from './business/BusinessManagerDetails';

interface BusinessManagerSelectorProps {
  onSelect: (businessManagerId: string) => void;
}

const BusinessManagerSelector: React.FC<BusinessManagerSelectorProps> = ({ onSelect }) => {
  const { 
    businessManagers, 
    selectedBusinessManager, 
    setSelectedBusinessManager, 
    isLoading, 
    error 
  } = useBusinessManagers();
  const { toast } = useToast();

  const handleContinue = () => {
    if (selectedBusinessManager) {
      onSelect(selectedBusinessManager);
      toast({
        title: "Business Manager Selected",
        description: "Business Manager selection successful. Loading ad accounts..."
      });
    }
  };

  if (isLoading) {
    return <BusinessManagerLoading />;
  }

  if (error) {
    return <BusinessManagerError error={error} />;
  }

  if (businessManagers.length === 0) {
    return <NoBusinessManagers />;
  }

  // Find the selected business manager object
  const selectedBM = businessManagers.find(bm => bm.id === selectedBusinessManager);

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-lg font-medium flex items-center">
        <Building className="mr-2 h-5 w-5" />
        Select Business Manager
      </h3>
      
      <p className="text-sm text-gray-500">
        Choose which Business Manager you want to use for campaign management.
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
      
      {selectedBusinessManager && selectedBM && (
        <BusinessManagerDetails businessManager={selectedBM} />
      )}
      
      <Button 
        onClick={handleContinue} 
        disabled={!selectedBusinessManager}
        className="w-full bg-meta-blue hover:bg-meta-dark"
      >
        Continue with Selected Business Manager
      </Button>
    </div>
  );
};

export default BusinessManagerSelector;
