
import React from 'react';
import { STEPS } from './WizardSteps';
import { Check } from 'lucide-react';

interface StepProgressIndicatorProps {
  currentStep: number;
}

const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <div 
            className={`flex items-center justify-center rounded-full w-8 h-8 ${
              index < currentStep 
                ? 'bg-meta-blue text-white' 
                : index === currentStep 
                  ? 'border-2 border-meta-blue text-meta-blue' 
                  : 'border-2 border-gray-300 text-gray-300'
            }`}
          >
            {index < currentStep ? (
              <Check className="w-4 h-4" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          {index < STEPS.length - 1 && (
            <div 
              className={`h-1 w-12 ${
                index < currentStep ? 'bg-meta-blue' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepProgressIndicator;
