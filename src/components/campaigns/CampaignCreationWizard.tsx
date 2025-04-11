
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Users, 
  Image, 
  DollarSign, 
  Calendar,
  Check,
  X
} from 'lucide-react';
import CampaignObjectiveStep from './wizard/CampaignObjectiveStep';
import AudienceTargetingStep from './wizard/AudienceTargetingStep';
import AdCreativeStep from './wizard/AdCreativeStep';
import BudgetAndScheduleStep from './wizard/BudgetAndScheduleStep';
import ReviewAndCreateStep from './wizard/ReviewAndCreateStep';
import { useToast } from '@/hooks/use-toast';

interface CampaignCreationWizardProps {
  onCancel: () => void;
}

const STEPS = [
  {
    id: 'objective',
    title: 'Campaign Objective',
    description: 'Select the goal for your campaign',
    icon: Target,
  },
  {
    id: 'audience',
    title: 'Audience Targeting',
    description: 'Define who will see your ads',
    icon: Users,
  },
  {
    id: 'creative',
    title: 'Ad Creatives',
    description: 'Design ads that convert',
    icon: Image,
  },
  {
    id: 'budget',
    title: 'Budget & Schedule',
    description: 'Set your spending limits and timeline',
    icon: DollarSign,
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Finalize your campaign',
    icon: Check,
  },
];

const CampaignCreationWizard = ({ onCancel }: CampaignCreationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: '',
    event: null,
    audienceSize: 0,
    targetingOptions: {
      age: { min: 18, max: 65 },
      locations: [],
      interests: [],
      behaviors: []
    },
    adCreatives: [],
    budget: {
      amount: 100,
      type: 'daily'
    },
    schedule: {
      startDate: new Date(),
      endDate: null
    }
  });
  const { toast } = useToast();
  
  const updateCampaignData = (data: any) => {
    setCampaignData(prevData => ({
      ...prevData,
      ...data
    }));
  };
  
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleCreate = async () => {
    try {
      // This would be replaced with actual API call in production
      console.log('Creating campaign with data:', campaignData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Campaign Created",
        description: `${campaignData.name || 'New campaign'} has been created successfully.`,
      });
      
      onCancel(); // Close wizard after creation
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Failed to create campaign. Please try again later.",
      });
    }
  };
  
  const currentStepInfo = STEPS[currentStep];
  const StepIcon = currentStepInfo.icon;
  
  const renderStepContent = () => {
    switch (currentStepInfo.id) {
      case 'objective':
        return <CampaignObjectiveStep 
          campaignData={campaignData} 
          updateCampaignData={updateCampaignData}
        />;
      case 'audience':
        return <AudienceTargetingStep 
          campaignData={campaignData} 
          updateCampaignData={updateCampaignData}
        />;
      case 'creative':
        return <AdCreativeStep 
          campaignData={campaignData} 
          updateCampaignData={updateCampaignData}
        />;
      case 'budget':
        return <BudgetAndScheduleStep 
          campaignData={campaignData} 
          updateCampaignData={updateCampaignData}
        />;
      case 'review':
        return <ReviewAndCreateStep 
          campaignData={campaignData} 
          updateCampaignData={updateCampaignData}
        />;
      default:
        return <div>Unknown step</div>;
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-medium">
            <StepIcon className="w-5 h-5 mr-2" />
            {currentStepInfo.title}
            <span className="text-sm text-muted-foreground ml-2">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">{currentStepInfo.description}</p>
          
          {/* Step progress indicators */}
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
          
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
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
                  onClick={handleCreate} 
                  className="bg-meta-blue hover:bg-meta-dark"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  className="bg-meta-blue hover:bg-meta-dark"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignCreationWizard;
