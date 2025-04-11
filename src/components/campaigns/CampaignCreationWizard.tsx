
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import CampaignObjectiveStep from './wizard/CampaignObjectiveStep';
import AudienceTargetingStep from './wizard/AudienceTargetingStep';
import AdCreativeStep from './wizard/AdCreativeStep';
import BudgetAndScheduleStep from './wizard/BudgetAndScheduleStep';
import ReviewAndCreateStep from './wizard/ReviewAndCreateStep';
import StepProgressIndicator from './wizard/StepProgressIndicator';
import WizardHeader from './wizard/WizardHeader';
import WizardControls from './wizard/WizardControls';
import { STEPS, CampaignData } from './wizard/WizardSteps';

interface CampaignCreationWizardProps {
  onCancel: () => void;
}

const CampaignCreationWizard = ({ onCancel }: CampaignCreationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState<CampaignData>({
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
  
  const updateCampaignData = (data: Partial<CampaignData>) => {
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
  
  const renderStepContent = () => {
    const currentStepInfo = STEPS[currentStep];
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
          <CardTitle>
            <WizardHeader currentStep={currentStep} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">{STEPS[currentStep].description}</p>
          
          <StepProgressIndicator currentStep={currentStep} />
          
          {renderStepContent()}
          
          <WizardControls
            currentStep={currentStep}
            onNext={handleNext}
            onBack={handleBack}
            onCancel={onCancel}
            onCreate={handleCreate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignCreationWizard;
