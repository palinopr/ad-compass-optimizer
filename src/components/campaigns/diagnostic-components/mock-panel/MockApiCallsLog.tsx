
import React from 'react';
import { MockedRequest } from '@/services/api/mock/logger/MockRequestLogger';

interface MockApiCallsLogProps {
  calls: MockedRequest[];
}

const MockApiCallsLog: React.FC<MockApiCallsLogProps> = ({ calls }) => {
  if (!calls || calls.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="text-sm font-medium mb-2">Recent Mock API Calls</h4>
      <div className="text-xs font-mono space-y-1 max-h-32 overflow-auto">
        {calls.map((call, index) => (
          <div key={index} className="text-gray-600">
            {call.timestamp} - {call.endpoint} ({call.method || 'GET'})
            {call.endpoint.includes('campaign') && (
              <div className="text-xs text-blue-500 ml-4">
                → Response: {call.response ? 
                  (typeof call.response === 'object' ? 
                    `${JSON.stringify(call.response).substring(0, 50)}...` : 
                    call.response.toString().substring(0, 50)
                  ) : 'No data'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MockApiCallsLog;
