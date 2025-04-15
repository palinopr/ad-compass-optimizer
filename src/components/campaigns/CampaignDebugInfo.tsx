
import React, { useState } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';

interface CampaignDebugInfoProps {
  campaigns: MetaCampaign[];
}

const CampaignDebugInfo = ({ campaigns }: CampaignDebugInfoProps) => {
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);
  
  // Only show in development environment
  if (process.env.NODE_ENV === 'production') return null;
  
  const showRawData = () => {
    try {
      const storedResponse = localStorage.getItem('raw_campaign_response');
      if (storedResponse) {
        try {
          const parsed = JSON.parse(storedResponse);
          setRawResponse(parsed);
        } catch (e) {
          // If it's not JSON, show as text
          setRawResponse({ text: storedResponse });
        }
        setShowRawResponse(true);
      } else {
        setRawResponse({ error: "No raw response data found" });
        setShowRawResponse(true);
      }
    } catch (e) {
      console.error('Error loading raw response:', e);
      setRawResponse({ error: String(e) });
      setShowRawResponse(true);
    }
  };

  return (
    <div className="mt-4 p-2 bg-gray-100 rounded">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs">
          Debug: {campaigns.length} campaigns loaded. 
          {campaigns.length > 0 && `First campaign ID: ${campaigns[0]?.id || 'unknown'}`}
        </span>
        <Button variant="outline" size="sm" onClick={showRawData} className="text-xs h-6 flex items-center">
          <Bug className="h-3 w-3 mr-1" />
          Show Raw API Data
        </Button>
      </div>
      
      {showRawResponse && (
        <div className="mt-2">
          <h4 className="text-xs font-bold mb-1">Raw API Response:</h4>
          <div className="bg-gray-900 text-gray-100 p-2 rounded overflow-auto max-h-96 text-xs">
            <pre className="whitespace-pre-wrap">
              {rawResponse?.error ? 
                `Error: ${rawResponse.error}` : 
                rawResponse?.text ? 
                  rawResponse.text : 
                  JSON.stringify(rawResponse, null, 2)
              }
            </pre>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowRawResponse(false)}
            className="mt-2 text-xs"
          >
            Hide Raw Data
          </Button>
        </div>
      )}
    </div>
  );
};

export default CampaignDebugInfo;
