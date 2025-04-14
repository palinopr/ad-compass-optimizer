
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';
import { MockedRequest } from '@/services/api/mock/logger/MockRequestLogger';

interface MockApiCallsLogProps {
  calls: MockedRequest[];
}

const MockApiCallsLog: React.FC<MockApiCallsLogProps> = ({ calls }) => {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium flex items-center mb-2">
        <Terminal className="w-4 h-4 mr-2" />
        Recent Mock API Calls
      </h4>
      <ScrollArea className="h-[200px] rounded-md border p-2">
        {calls.map((call, index) => (
          <div key={index} className="text-xs mb-2 space-y-1">
            <div className="flex items-center text-green-600">
              <Check className="w-3 h-3 mr-1" />
              {call.endpoint}
            </div>
            <div className="text-gray-500 pl-4">
              {new Date(call.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default MockApiCallsLog;
