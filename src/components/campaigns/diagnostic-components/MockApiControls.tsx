
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MockApiControlsProps {
  onRefresh: () => void;
}

const MockApiControls: React.FC<MockApiControlsProps> = ({ onRefresh }) => {
  const [isMockApiEnabled, setIsMockApiEnabled] = React.useState(false);
  
  // Check if mock API mode is enabled
  React.useEffect(() => {
    const checkMockStatus = () => {
      const mockEnabled = localStorage.getItem("USE_MOCK_META_API") === "true";
      setIsMockApiEnabled(mockEnabled);
    };
    
    checkMockStatus();
    
    // Check when URL parameters might have changed
    window.addEventListener('popstate', checkMockStatus);
    return () => {
      window.removeEventListener('popstate', checkMockStatus);
    };
  }, []);

  // Toggle mock API mode
  const toggleMockApi = () => {
    if (isMockApiEnabled) {
      localStorage.removeItem("USE_MOCK_META_API");
      setIsMockApiEnabled(false);
      toast({
        title: "Mock API Disabled",
        description: "Switching to real Meta API requests"
      });
    } else {
      localStorage.setItem("USE_MOCK_META_API", "true");
      setIsMockApiEnabled(true);
      toast({
        title: "Mock API Enabled",
        description: "Using mock data for Meta API requests"
      });
    }
  };

  // Force regenerate mock data
  const regenerateMockData = async () => {
    try {
      const { regenerateMockData } = await import('@/services/api/mock/mockCampaignData');
      regenerateMockData();
      onRefresh();
      toast({
        title: "Mock Data Regenerated",
        description: "Fresh mock campaign data has been generated"
      });
    } catch (err) {
      console.error("Error regenerating mock data:", err);
      toast({
        title: "Error",
        description: "Failed to regenerate mock data",
        variant: "destructive"
      });
    }
  };

  if (!isMockApiEnabled) {
    return (
      <Card className="p-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Meta API Mock Mode</h3>
            <p className="text-sm text-gray-500">Test with realistic mock data without hitting API rate limits</p>
          </div>
          <Button variant="outline" onClick={toggleMockApi}>Enable Mock API</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mt-4 border-2 border-yellow-200 bg-yellow-50">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-yellow-600" />
            <h3 className="font-medium">Meta API Mock Mode</h3>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Active</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={toggleMockApi} className="border-yellow-500 hover:bg-yellow-100">
            Disable Mock API
          </Button>
        </div>
        
        <p className="text-sm text-yellow-700">
          Using mock data for campaign, ad sets, ads, and insights requests. 
          No Meta API rate limits will be applied.
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={onRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Refresh with Mock Data
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={regenerateMockData}
            className="flex items-center gap-1"
          >
            <Wrench className="h-3 w-3" /> Regenerate Mock Data
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MockApiControls;
