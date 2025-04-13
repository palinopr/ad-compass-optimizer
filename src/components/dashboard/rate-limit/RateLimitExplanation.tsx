
import React from 'react';

const RateLimitExplanation: React.FC = () => {
  return (
    <div className="text-xs text-gray-600">
      <p>Meta's API has rate limits to prevent abuse. Your application has reached this limit and needs to wait before making more requests.</p>
    </div>
  );
};

export default RateLimitExplanation;
