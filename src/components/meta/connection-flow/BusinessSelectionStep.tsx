
import React from 'react';
import BusinessManagerSelector from '@/components/meta/BusinessManagerSelector';

interface BusinessSelectionStepProps {
  onSelect: (businessId: string) => void;
}

const BusinessSelectionStep: React.FC<BusinessSelectionStepProps> = ({ onSelect }) => {
  return <BusinessManagerSelector onSelect={onSelect} />;
};

export default BusinessSelectionStep;
