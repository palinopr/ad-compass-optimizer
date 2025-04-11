
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Calendar,
  Target,
  Users,
  Image,
  DollarSign,
  Clock,
  AlertTriangle,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ReviewAndCreateStepProps {
  campaignData: any;
  updateCampaignData: (data: any) => void;
}

const ReviewAndCreateStep: React.FC<ReviewAndCreateStepProps> = ({ 
  campaignData 
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatDate = (date: Date | null) => {
    return date ? format(date, 'PPP') : '';
  };
  
  const calculateTotalBudget = () => {
    if (campaignData.budget.type === 'lifetime') {
      return campaignData.budget.amount;
    } else {
      const startDate = new Date(campaignData.schedule.startDate);
      const endDate = new Date(campaignData.schedule.endDate);
      const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return campaignData.budget.amount * days;
    }
  };
  
  // Get validation issues
  const getValidationIssues = () => {
    const issues = [];
    
    if (!campaignData.name || campaignData.name.trim() === '') {
      issues.push('Campaign name is required');
    }
    
    if (!campaignData.objective) {
      issues.push('Campaign objective is required');
    }
    
    if (!campaignData.event) {
      issues.push('Event selection is required');
    }
    
    if (campaignData.targetingOptions.locations.length === 0) {
      issues.push('At least one location is required');
    }
    
    // Check if any ad creative is missing required fields
    const adCreatives = campaignData.adCreatives || [];
    if (adCreatives.length === 0) {
      issues.push('At least one ad creative is required');
    } else {
      for (let i = 0; i < adCreatives.length; i++) {
        const ad = adCreatives[i];
        if (!ad.headline || ad.headline.trim() === '') {
          issues.push(`Ad ${i + 1} is missing a headline`);
        }
        if (!ad.description || ad.description.trim() === '') {
          issues.push(`Ad ${i + 1} is missing a description`);
        }
        if (!ad.image) {
          issues.push(`Ad ${i + 1} is missing an image`);
        }
      }
    }
    
    if (campaignData.budget.amount <= 0) {
      issues.push('Budget amount must be greater than zero');
    }
    
    return issues;
  };
  
  const validationIssues = getValidationIssues();
  const hasValidationIssues = validationIssues.length > 0;
  
  return (
    <div className="space-y-6">
      {/* Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center mb-4">
              <Target className="w-4 h-4 mr-2 text-meta-blue" />
              Campaign Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Campaign Name</p>
                <p className="font-medium">{campaignData.name || 'Unnamed Campaign'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Objective</p>
                <p className="font-medium">
                  {campaignData.objective 
                    ? campaignData.objective.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) 
                    : 'Not specified'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Event</p>
                {campaignData.event ? (
                  <div>
                    <p className="font-medium">{campaignData.event.name}</p>
                    <p className="text-xs">{formatDate(new Date(campaignData.event.date))}</p>
                  </div>
                ) : (
                  <p className="italic text-muted-foreground">No event selected</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center mb-4">
              <Clock className="w-4 h-4 mr-2 text-meta-blue" />
              Budget & Schedule
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Type</p>
                  <p className="font-medium">
                    {campaignData.budget?.type === 'daily' ? 'Daily Budget' : 'Lifetime Budget'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Budget Amount</p>
                  <p className="font-medium">
                    {formatCurrency(campaignData.budget?.amount || 0)}
                    {campaignData.budget?.type === 'daily' ? '/day' : ' total'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Campaign Duration</p>
                <p className="font-medium">
                  {formatDate(campaignData.schedule?.startDate)} - {formatDate(campaignData.schedule?.endDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {campaignData.schedule?.startDate && campaignData.schedule?.endDate && (
                    <>
                      {Math.round((new Date(campaignData.schedule.endDate).getTime() - new Date(campaignData.schedule.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </>
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Total Campaign Budget</p>
                <p className="font-medium">{formatCurrency(calculateTotalBudget())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Audience Targeting */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium flex items-center mb-4">
            <Users className="w-4 h-4 mr-2 text-meta-blue" />
            Audience Targeting
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Age Range</p>
              <p className="font-medium">
                {campaignData.targetingOptions?.age?.min} - {campaignData.targetingOptions?.age?.max} years
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Locations</p>
              {campaignData.targetingOptions?.locations?.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {campaignData.targetingOptions.locations.map((location: any) => (
                    <Badge key={location.value} variant="outline" className="text-xs">
                      {location.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="italic text-muted-foreground">No locations selected</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Interests</p>
              {campaignData.targetingOptions?.interests?.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {campaignData.targetingOptions.interests.map((interest: any) => (
                    <Badge key={interest.value} variant="outline" className="text-xs">
                      {interest.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="italic text-muted-foreground">No interests selected</p>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Estimated Audience Size</p>
            <p className="font-medium">{campaignData.audienceSize?.toLocaleString() || 'Not calculated'}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Ad Creatives */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium flex items-center mb-4">
            <Image className="w-4 h-4 mr-2 text-meta-blue" />
            Ad Creatives ({campaignData.adCreatives?.length || 0})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(campaignData.adCreatives || []).map((ad: any, index: number) => (
              <div key={ad.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">Ad {index + 1}</Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Headline</p>
                    <p className="font-medium">{ad.headline || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{ad.description || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Call to Action</p>
                    <p className="text-sm">{ad.cta || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Image</p>
                    {ad.image ? (
                      <div className="mt-1 h-20 w-full bg-slate-100 flex items-center justify-center rounded">
                        <img src={ad.image} alt="Ad creative" className="h-full object-contain" />
                      </div>
                    ) : (
                      <p className="italic text-muted-foreground">No image uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {!campaignData.adCreatives || campaignData.adCreatives.length === 0 ? (
              <div className="italic text-muted-foreground">No ad creatives added</div>
            ) : null}
          </div>
        </CardContent>
      </Card>
      
      {/* Validation Issues */}
      {hasValidationIssues && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center mb-4 text-red-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Issues to Resolve
            </h3>
            
            <ul className="space-y-1">
              {validationIssues.map((issue, index) => (
                <li key={index} className="text-sm text-red-600 flex items-start">
                  <span className="mr-2">•</span> {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Ready to Launch */}
      {!hasValidationIssues && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h3 className="font-medium flex items-center mb-2 text-green-600">
              <Check className="w-4 h-4 mr-2" />
              Your Campaign is Ready to Launch
            </h3>
            <p className="text-sm text-green-800">
              All required information has been provided. Click "Create Campaign" to proceed.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewAndCreateStep;
