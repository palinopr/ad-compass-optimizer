
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, X, Users, Info } from 'lucide-react';

interface AudienceTargetingStepProps {
  campaignData: any;
  updateCampaignData: (data: any) => void;
}

// Sample targeting options
const locationOptions = [
  { value: 'nyc', label: 'New York City, NY' },
  { value: 'la', label: 'Los Angeles, CA' },
  { value: 'chicago', label: 'Chicago, IL' },
  { value: 'miami', label: 'Miami, FL' },
  { value: 'austin', label: 'Austin, TX' },
  { value: 'sf', label: 'San Francisco, CA' },
  { value: 'seattle', label: 'Seattle, WA' },
  { value: 'denver', label: 'Denver, CO' },
  { value: 'boston', label: 'Boston, MA' },
];

const interestOptions = [
  { value: 'music', label: 'Music' },
  { value: 'live_events', label: 'Live Events' },
  { value: 'concerts', label: 'Concerts' },
  { value: 'festivals', label: 'Festivals' },
  { value: 'theater', label: 'Theater' },
  { value: 'sports', label: 'Sports' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'food', label: 'Food & Drink' },
  { value: 'technology', label: 'Technology' },
];

const AudienceTargetingStep: React.FC<AudienceTargetingStepProps> = ({ 
  campaignData, 
  updateCampaignData 
}) => {
  const [targetingOptions, setTargetingOptions] = useState({
    age: campaignData.targetingOptions?.age || { min: 18, max: 65 },
    locations: campaignData.targetingOptions?.locations || [],
    interests: campaignData.targetingOptions?.interests || [],
    behaviors: campaignData.targetingOptions?.behaviors || [],
  });
  
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [interestSearchOpen, setInterestSearchOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [interestSearch, setInterestSearch] = useState('');
  
  const handleAgeChange = (values: number[]) => {
    const [min, max] = values;
    const newTargetingOptions = {
      ...targetingOptions,
      age: { min, max }
    };
    setTargetingOptions(newTargetingOptions);
    updateCampaignData({ 
      targetingOptions: newTargetingOptions,
      audienceSize: calculateAudienceSize(newTargetingOptions),
    });
  };
  
  const handleLocationAdd = (locationValue: string) => {
    const location = locationOptions.find(loc => loc.value === locationValue);
    if (location && !targetingOptions.locations.some(loc => loc.value === locationValue)) {
      const newLocations = [...targetingOptions.locations, location];
      const newTargetingOptions = {
        ...targetingOptions,
        locations: newLocations
      };
      setTargetingOptions(newTargetingOptions);
      updateCampaignData({ 
        targetingOptions: newTargetingOptions,
        audienceSize: calculateAudienceSize(newTargetingOptions),
      });
    }
    setLocationSearchOpen(false);
  };
  
  const handleInterestAdd = (interestValue: string) => {
    const interest = interestOptions.find(int => int.value === interestValue);
    if (interest && !targetingOptions.interests.some(int => int.value === interestValue)) {
      const newInterests = [...targetingOptions.interests, interest];
      const newTargetingOptions = {
        ...targetingOptions,
        interests: newInterests
      };
      setTargetingOptions(newTargetingOptions);
      updateCampaignData({ 
        targetingOptions: newTargetingOptions,
        audienceSize: calculateAudienceSize(newTargetingOptions),
      });
    }
    setInterestSearchOpen(false);
  };
  
  const handleLocationRemove = (locationValue: string) => {
    const newLocations = targetingOptions.locations.filter(loc => loc.value !== locationValue);
    const newTargetingOptions = {
      ...targetingOptions,
      locations: newLocations
    };
    setTargetingOptions(newTargetingOptions);
    updateCampaignData({ 
      targetingOptions: newTargetingOptions,
      audienceSize: calculateAudienceSize(newTargetingOptions),
    });
  };
  
  const handleInterestRemove = (interestValue: string) => {
    const newInterests = targetingOptions.interests.filter(int => int.value !== interestValue);
    const newTargetingOptions = {
      ...targetingOptions,
      interests: newInterests
    };
    setTargetingOptions(newTargetingOptions);
    updateCampaignData({ 
      targetingOptions: newTargetingOptions,
      audienceSize: calculateAudienceSize(newTargetingOptions),
    });
  };
  
  // Simplified audience size calculation - would be replaced by Meta API estimate
  const calculateAudienceSize = (options: any) => {
    // Very basic calculation for demonstration purposes
    const ageRange = options.age.max - options.age.min;
    const locationFactor = Math.max(1, options.locations.length) * 250000;
    const interestNarrowingFactor = Math.max(0.1, 1 - (options.interests.length * 0.1));
    
    return Math.round(ageRange * locationFactor * interestNarrowingFactor);
  };
  
  const filteredLocationOptions = locationSearch === ''
    ? locationOptions
    : locationOptions.filter((location) =>
        location.label.toLowerCase().includes(locationSearch.toLowerCase())
      );
  
  const filteredInterestOptions = interestSearch === ''
    ? interestOptions
    : interestOptions.filter((interest) =>
        interest.label.toLowerCase().includes(interestSearch.toLowerCase())
      );
  
  return (
    <div className="space-y-8">
      {/* Age Range */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Age Range</Label>
          <span className="text-sm text-muted-foreground">
            {targetingOptions.age.min} - {targetingOptions.age.max} years
          </span>
        </div>
        <Slider
          defaultValue={[targetingOptions.age.min, targetingOptions.age.max]}
          max={65}
          min={13}
          step={1}
          onValueChange={handleAgeChange}
          className="py-4"
        />
      </div>
      
      {/* Locations */}
      <div className="space-y-2">
        <Label>Locations</Label>
        <p className="text-sm text-muted-foreground">
          Select locations where you want your ads to appear
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {targetingOptions.locations.map(location => (
            <Badge key={location.value} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {location.label}
              <button
                className="ml-1 rounded-full hover:bg-slate-200 p-1"
                onClick={() => handleLocationRemove(location.value)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Popover open={locationSearchOpen} onOpenChange={setLocationSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                Add Location
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" side="bottom">
              <Command>
                <CommandInput
                  placeholder="Search locations..."
                  value={locationSearch}
                  onValueChange={setLocationSearch}
                />
                <CommandList>
                  <CommandEmpty>No locations found.</CommandEmpty>
                  <CommandGroup>
                    {filteredLocationOptions.map((location) => (
                      <CommandItem
                        key={location.value}
                        value={location.value}
                        onSelect={handleLocationAdd}
                      >
                        {location.label}
                        {targetingOptions.locations.some(loc => loc.value === location.value) && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Interests */}
      <div className="space-y-2">
        <Label>Interests</Label>
        <p className="text-sm text-muted-foreground">
          Select interests that match your event audience
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {targetingOptions.interests.map(interest => (
            <Badge key={interest.value} variant="outline" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {interest.label}
              <button
                className="ml-1 rounded-full hover:bg-slate-200 p-1"
                onClick={() => handleInterestRemove(interest.value)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Popover open={interestSearchOpen} onOpenChange={setInterestSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                Add Interest
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" side="bottom">
              <Command>
                <CommandInput
                  placeholder="Search interests..."
                  value={interestSearch}
                  onValueChange={setInterestSearch}
                />
                <CommandList>
                  <CommandEmpty>No interests found.</CommandEmpty>
                  <CommandGroup>
                    {filteredInterestOptions.map((interest) => (
                      <CommandItem
                        key={interest.value}
                        value={interest.value}
                        onSelect={handleInterestAdd}
                      >
                        {interest.label}
                        {targetingOptions.interests.some(int => int.value === interest.value) && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Audience Size Estimate */}
      <div className="bg-slate-50 p-4 rounded-md border mt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-meta-blue text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium flex items-center">
              Estimated Audience Size
              <Info className="h-4 w-4 ml-2 text-muted-foreground" />
            </h3>
            <p className="text-2xl font-bold mt-1">
              {(calculateAudienceSize(targetingOptions) || campaignData.audienceSize || 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              This is an estimate of the number of people your ads could reach based on your targeting options.
            </p>
            {(calculateAudienceSize(targetingOptions) || campaignData.audienceSize) > 1000000 && (
              <p className="text-sm text-amber-600 mt-1 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Consider narrowing your audience for better results
              </p>
            )}
            {(calculateAudienceSize(targetingOptions) || campaignData.audienceSize) < 10000 && (
              <p className="text-sm text-amber-600 mt-1 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                This audience may be too small for optimal delivery
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceTargetingStep;
