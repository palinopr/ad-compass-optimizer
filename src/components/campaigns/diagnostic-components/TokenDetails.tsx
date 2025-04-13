
import React from 'react';

interface TokenDetailsProps {
  tokenInfo: {
    hasToken: boolean;
    tokenLength?: number;
    tokenAge?: number | null;
  };
}

const TokenDetails: React.FC<TokenDetailsProps> = ({ tokenInfo }) => {
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
      <h3 className="text-sm font-medium mb-2">Token Details:</h3>
      <div className="text-xs space-y-1 font-mono">
        <p>Has Token: {tokenInfo.hasToken ? 'Yes' : 'No'}</p>
        {tokenInfo.tokenLength > 0 && (
          <p>Token Length: {tokenInfo.tokenLength} characters</p>
        )}
        {tokenInfo.tokenAge !== null && (
          <p>Token Age: {tokenInfo.tokenAge} days</p>
        )}
      </div>
    </div>
  );
};

export default TokenDetails;
