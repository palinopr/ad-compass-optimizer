
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { MockedRequest } from '@/services/api/mock/logger/MockRequestLogger';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MockApiCallsLogProps {
  calls: MockedRequest[];
}

const MockApiCallsLog: React.FC<MockApiCallsLogProps> = ({ calls }) => {
  const [expandedCall, setExpandedCall] = useState<string | null>(null);

  const formatResponse = (response: any): string => {
    if (Array.isArray(response)) {
      return `[${response.length} items] ${JSON.stringify(response[0], null, 2).slice(0, 150)}...`;
    }
    return JSON.stringify(response, null, 2).slice(0, 150) + '...';
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium flex items-center mb-2">
        <Terminal className="w-4 h-4 mr-2" />
        Recent Mock API Calls
      </h4>
      <ScrollArea className="h-[200px] rounded-md border p-2">
        {calls.map((call, index) => (
          <div 
            key={`${call.endpoint}-${call.timestamp}`} 
            className="text-xs mb-2 space-y-1"
          >
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
              onClick={() => setExpandedCall(expandedCall === call.endpoint ? null : call.endpoint)}
            >
              <div className="flex items-center text-green-600">
                <Check className="w-3 h-3 mr-1" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-mono">{call.endpoint}</span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[300px]">
                      <pre className="text-xs">{formatResponse(call.response)}</pre>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {expandedCall === call.endpoint ? (
                <ChevronUp className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              )}
            </div>
            
            <div className="text-gray-500 pl-4">
              {new Date(call.timestamp).toLocaleTimeString()}
            </div>
            
            {expandedCall === call.endpoint && (
              <div className="mt-2 pl-4 pr-2">
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-[200px]">
                  {JSON.stringify(call.response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default MockApiCallsLog;
