
import React from 'react';
import { Card } from '@/components/ui/card';
import { Check, X, Brain } from 'lucide-react';
import { mockFunnelData } from '@/services/api/mock/mockCampaignData';

interface DiagnosticItem {
  label: string;
  status: 'success' | 'error' | 'info';
  details?: string;
}

interface MockDiagnosticPanelProps {
  displayedCampaignsCount: number;
}

const MockDiagnosticPanel: React.FC<MockDiagnosticPanelProps> = ({ displayedCampaignsCount }) => {
  const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
  
  if (!isMockMode) return null;

  const diagnosticItems: DiagnosticItem[] = [
    {
      label: 'Mock Mode',
      status: 'success',
      details: 'Active'
    },
    {
      label: 'Funnel Data Loaded',
      status: 'success',
      details: `${mockFunnelData.campaigns.length} campaigns`
    },
    {
      label: 'Campaigns Displayed',
      status: displayedCampaignsCount > 0 ? 'success' : 'error',
      details: `${displayedCampaignsCount} campaigns`
    }
  ];

  // Add diagnostic message if no campaigns are displayed
  if (displayedCampaignsCount === 0) {
    diagnosticItems.push({
      label: 'Possible Fix',
      status: 'info',
      details: 'CampaignList not receiving props or filtering by real ad account'
    });
  }

  const getIcon = (status: 'success' | 'error' | 'info') => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Brain className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="mt-8 p-4">
      <h3 className="text-sm font-medium mb-4">Mock Diagnostic Panel</h3>
      <div className="space-y-2">
        {diagnosticItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            {getIcon(item.status)}
            <span className="font-medium">{item.label}:</span>
            <span className="text-gray-600">{item.details}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MockDiagnosticPanel;
