
import React from 'react';
import { 
  Target, 
  Users, 
  Image, 
  DollarSign,
  Check,
} from 'lucide-react';

export const STEPS = [
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

export interface CampaignData {
  name: string;
  objective: string;
  event: any;
  audienceSize: number;
  targetingOptions: {
    age: { min: number, max: number };
    locations: any[];
    interests: any[];
    behaviors: any[];
  };
  adCreatives: any[];
  budget: {
    amount: number;
    type: string;
  };
  schedule: {
    startDate: Date;
    endDate: Date | null;
  };
}

export interface WizardStepProps {
  campaignData: CampaignData;
  updateCampaignData: (data: Partial<CampaignData>) => void;
}
