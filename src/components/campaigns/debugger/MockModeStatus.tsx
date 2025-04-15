
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Code, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const MockModeStatus = () => {
  const [isMockMode, setIsMockMode] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if mock mode is enabled
    const checkMockMode = () => {
      const mockModeEnabled = localStorage.getItem("USE_MOCK_MODE") === "true";
      setIsMockMode(mockModeEnabled);
    };
    
    checkMockMode();
    
    // Listen for mock mode changes
    const handleMockModeChange = () => {
      checkMockMode();
    };
    
    window.addEventListener('mock-mode-change', handleMockModeChange);
    return () => {
      window.removeEventListener('mock-mode-change', handleMockModeChange);
    };
  }, []);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Code className="w-4 h-4 mr-2 text-blue-600" />
            Mock Mode Status
          </div>
          {isMockMode ? (
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
              Enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800">
              Disabled
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600">
          {isMockMode ? (
            "Mock mode is enabled. Campaign data is being simulated and not fetched from Meta API."
          ) : (
            "Mock mode is disabled. Campaign data is being fetched from the live Meta API."
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default MockModeStatus;
