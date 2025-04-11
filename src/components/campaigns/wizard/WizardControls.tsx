
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import { STEPS } from './WizardSteps';

interface WizardControlsProps {
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  onCreate: () => void;
}

const WizardControls: React.FC<WizardControlsProps> = ({ 
  currentStep, 
  onNext, 
  onBack, 
  onCancel,
  onCreate 
}) => {
  return (
    <div className="flex justify-between mt-8">
      <div>
        {currentStep > 0 && (
          <Button 
            variant="outline" 
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        
        {currentStep === STEPS.length - 1 ? (
          <Button 
            onClick={onCreate} 
            className="bg-meta-blue hover:bg-meta-dark"
          >
            <Check className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        ) : (
          <Button 
            onClick={onNext} 
            className="bg-meta-blue hover:bg-meta-dark"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default WizardControls;
