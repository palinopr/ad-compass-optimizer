
import React from 'react';

interface FunnelApiResponseProps {
  rawApiResponse: any;
}

const FunnelApiResponse: React.FC<FunnelApiResponseProps> = ({ rawApiResponse }) => {
  if (!rawApiResponse) return null;

  return (
    <div className="mt-4 border-t pt-4">
      <p className="font-medium mb-2">API Response Debug:</p>
      <div className="text-xs p-2 bg-gray-100 rounded overflow-auto max-h-96">
        <pre className="whitespace-pre-wrap">
          {rawApiResponse.text ?
            rawApiResponse.text :
            JSON.stringify(rawApiResponse, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default FunnelApiResponse;
