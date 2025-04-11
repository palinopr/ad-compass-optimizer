
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Image as ImageIcon, 
  Upload, 
  PlusCircle,
  Trash2, 
  Facebook, 
  Instagram, 
  Copy
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdCreativeStepProps {
  campaignData: any;
  updateCampaignData: (data: any) => void;
}

// Sample event details
const eventDetails = {
  name: "Summer Festival 2025",
  venue: "Central Park",
  date: "June 15, 2025",
  ticketPrice: "$50",
  features: ["Live Music", "Food Vendors", "Art Installations"]
};

// Sample ad templates
const adTemplates = [
  {
    id: 'template-1',
    name: 'Early Bird Tickets',
    headline: 'Early Bird Tickets Now Available!',
    description: 'Get your tickets for [EVENT_NAME] before prices go up. Limited time offer!',
    primaryText: 'Don\'t miss out on the biggest event of the year! [EVENT_NAME] at [VENUE] on [DATE]. Early bird tickets starting at [PRICE].',
    cta: 'Buy Tickets Now'
  },
  {
    id: 'template-2',
    name: 'Last Chance',
    headline: 'Last Chance to Get Tickets!',
    description: '[EVENT_NAME] is almost sold out. Secure your spot today!',
    primaryText: 'Tickets are selling fast for [EVENT_NAME]! Don\'t miss this incredible experience at [VENUE] on [DATE].',
    cta: 'Get Tickets'
  },
  {
    id: 'template-3',
    name: 'VIP Experience',
    headline: 'Upgrade to VIP Experience',
    description: 'Enhance your [EVENT_NAME] experience with VIP access and exclusive perks!',
    primaryText: 'Get the full [EVENT_NAME] experience with our VIP package! Premium viewing areas, exclusive merchandise, and more at [VENUE] on [DATE].',
    cta: 'Upgrade to VIP'
  }
];

const AdCreativeStep: React.FC<AdCreativeStepProps> = ({ 
  campaignData, 
  updateCampaignData 
}) => {
  const [adCreatives, setAdCreatives] = useState<any[]>(
    campaignData.adCreatives && campaignData.adCreatives.length > 0 
      ? campaignData.adCreatives 
      : [
          {
            id: `ad-${Date.now()}`,
            headline: '',
            description: '',
            primaryText: '',
            image: null,
            cta: 'Buy Tickets Now'
          }
        ]
  );
  
  const [selectedAdIndex, setSelectedAdIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState('custom');
  
  const handleAddCreative = () => {
    const newAd = {
      id: `ad-${Date.now()}`,
      headline: '',
      description: '',
      primaryText: '',
      image: null,
      cta: 'Buy Tickets Now'
    };
    
    const newAdCreatives = [...adCreatives, newAd];
    setAdCreatives(newAdCreatives);
    updateCampaignData({ adCreatives: newAdCreatives });
    setSelectedAdIndex(newAdCreatives.length - 1);
  };
  
  const handleRemoveCreative = (index: number) => {
    if (adCreatives.length <= 1) {
      return; // Don't remove the last creative
    }
    
    const newAdCreatives = [...adCreatives];
    newAdCreatives.splice(index, 1);
    setAdCreatives(newAdCreatives);
    updateCampaignData({ adCreatives: newAdCreatives });
    
    if (selectedAdIndex >= newAdCreatives.length) {
      setSelectedAdIndex(newAdCreatives.length - 1);
    }
  };
  
  const handleFieldChange = (field: string, value: string) => {
    const newAdCreatives = [...adCreatives];
    newAdCreatives[selectedAdIndex] = {
      ...newAdCreatives[selectedAdIndex],
      [field]: value
    };
    setAdCreatives(newAdCreatives);
    updateCampaignData({ adCreatives: newAdCreatives });
  };
  
  const handleTemplateSelect = (templateId: string) => {
    const template = adTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    // Replace placeholders with actual event data if available
    let headline = template.headline;
    let description = template.description;
    let primaryText = template.primaryText;
    
    if (campaignData.event) {
      const replacements: any = {
        '[EVENT_NAME]': campaignData.event.name,
        '[VENUE]': 'the venue', // This would come from actual event data
        '[DATE]': new Date(campaignData.event.date).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        '[PRICE]': `$${campaignData.event.ticketPrice}`
      };
      
      Object.entries(replacements).forEach(([placeholder, value]) => {
        headline = headline.replace(new RegExp(placeholder, 'g'), value as string);
        description = description.replace(new RegExp(placeholder, 'g'), value as string);
        primaryText = primaryText.replace(new RegExp(placeholder, 'g'), value as string);
      });
    }
    
    const newAdCreatives = [...adCreatives];
    newAdCreatives[selectedAdIndex] = {
      ...newAdCreatives[selectedAdIndex],
      headline,
      description,
      primaryText,
      cta: template.cta
    };
    setAdCreatives(newAdCreatives);
    updateCampaignData({ adCreatives: newAdCreatives });
    setSelectedTab('custom');
  };
  
  const currentAd = adCreatives[selectedAdIndex] || adCreatives[0];
  const ctaOptions = ['Buy Tickets Now', 'Get Tickets', 'Learn More', 'Sign Up', 'Register Now'];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {adCreatives.map((ad, index) => (
          <Badge 
            key={ad.id}
            variant={selectedAdIndex === index ? "default" : "outline"}
            className="cursor-pointer px-3 py-1"
            onClick={() => setSelectedAdIndex(index)}
          >
            Ad {index + 1}
            {adCreatives.length > 1 && (
              <button 
                className="ml-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCreative(index);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        {adCreatives.length < 5 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddCreative}
            className="flex items-center gap-1 border-dashed"
          >
            <PlusCircle className="h-4 w-4" />
            Add Variation
          </Button>
        )}
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="custom">Custom Ad</TabsTrigger>
          <TabsTrigger value="templates">Ad Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="custom" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input 
                  id="headline" 
                  placeholder="Enter a short, attention-grabbing headline" 
                  value={currentAd.headline} 
                  onChange={(e) => handleFieldChange('headline', e.target.value)}
                  maxLength={40} // Meta ad headline limit
                />
                <p className="text-xs text-right text-muted-foreground">
                  {currentAd.headline.length}/40
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Brief description of your event" 
                  value={currentAd.description} 
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  maxLength={125} // Meta ad description limit
                />
                <p className="text-xs text-right text-muted-foreground">
                  {currentAd.description.length}/125
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primary-text">Primary Text</Label>
                <Textarea 
                  id="primary-text" 
                  placeholder="More detailed information about your event" 
                  value={currentAd.primaryText} 
                  onChange={(e) => handleFieldChange('primaryText', e.target.value)}
                  maxLength={500} // Meta ad primary text limit
                />
                <p className="text-xs text-right text-muted-foreground">
                  {currentAd.primaryText.length}/500
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cta">Call to Action</Label>
                <Select 
                  value={currentAd.cta} 
                  onValueChange={(value) => handleFieldChange('cta', value)}
                >
                  <SelectTrigger id="cta" className="w-full">
                    <SelectValue placeholder="Select a call to action" />
                  </SelectTrigger>
                  <SelectContent>
                    {ctaOptions.map((cta) => (
                      <SelectItem key={cta} value={cta}>
                        {cta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Ad Preview</Label>
              <div className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-meta-blue flex items-center justify-center text-white">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Event Page</p>
                    <p className="text-xs text-muted-foreground">Sponsored</p>
                  </div>
                </div>
                
                <p className="text-sm my-2">{currentAd.primaryText || 'Primary text will appear here'}</p>
                
                <div className="border rounded">
                  <div className="aspect-video bg-slate-100 flex items-center justify-center">
                    {currentAd.image ? (
                      <img 
                        src={currentAd.image} 
                        alt="Ad creative" 
                        className="max-h-full object-cover" 
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <p className="text-sm">Image will appear here</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm uppercase text-meta-blue">
                      {campaignData.event?.name || 'EVENT NAME'}
                    </p>
                    <p className="font-medium">
                      {currentAd.headline || 'Headline will appear here'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {currentAd.description || 'Description will appear here'}
                    </p>
                    <Button size="sm" className="bg-meta-blue hover:bg-meta-dark">
                      {currentAd.cta}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Recommended size: 1200 x 628 pixels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adTemplates.map(template => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:border-meta-blue transition-all"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{template.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateSelect(template.id);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    <p><span className="text-sm text-muted-foreground">Headline:</span> {template.headline}</p>
                    <p><span className="text-sm text-muted-foreground">Description:</span> {template.description}</p>
                    <p className="line-clamp-2"><span className="text-sm text-muted-foreground">Primary text:</span> {template.primaryText}</p>
                    <p><span className="text-sm text-muted-foreground">CTA:</span> {template.cta}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Click on a template to apply it to the current ad. Placeholder text like [EVENT_NAME] will be replaced with your event details.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdCreativeStep;
