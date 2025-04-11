
import React from 'react';
import { STEPS } from './WizardSteps';

interface WizardHeaderProps {
  currentStep: number;
}

const WizardHeader: React.FC<WizardHeaderProps> = ({ currentStep }) => {
  const currentStepInfo = STEPS[currentStep];
  const StepIcon = currentStepInfo.icon;

  return (
    <div className="flex items-center text-lg font-medium">
      <StepIcon className="w-5 h-5 mr-2" />
      {currentStepInfo.title}
      <span className="text-sm text-muted-foreground ml-2">
        Step {currentStep + 1} of {STEPS.length}
      </span>
    </div>
  );
};

export default WizardHeader;
