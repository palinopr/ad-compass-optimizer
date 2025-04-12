
import React from 'react';

interface DebugInfoProps {
  tokenSource: string;
  userId: string;
  tokenExists: boolean;
  tokenLength?: number;
}

const DebugInfo: React.FC<DebugInfoProps> = ({
  tokenSource,
  userId,
  tokenExists,
  tokenLength
}) => {
  if (process.env.NODE_ENV === 'production') return null;
  
  return (
    <div className="border-t pt-3 mt-2 text-xs text-gray-500">
      <details>
        <summary className="cursor-pointer font-medium">Debug Information</summary>
        <div className="mt-2 space-y-1 pl-2">
          <div>Token Source: {tokenSource}</div>
          <div>User ID: {userId}</div>
          <div>Token Status: {tokenExists ? 'Present' : 'Missing'}</div>
          {tokenExists && tokenLength && (
            <div>Token Length: {tokenLength}</div>
          )}
        </div>
      </details>
    </div>
  );
};

export default DebugInfo;
