
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Ticket, 
  BadgePercent, 
  MousePointer, 
  Navigation, 
  Users 
} from 'lucide-react';

interface CampaignObjectiveStepProps {
  campaignData: any;
  updateCampaignData: (data: any) => void;
}

const eventOptions = [
  { id: 1, name: 'Summer Festival 2025', date: '2025-06-15', ticketsTotal: 1000, ticketPrice: 50 },
  { id: 2, name: 'Tech Conference 2025', date: '2025-07-22', ticketsTotal: 500, ticketPrice: 150 },
  { id: 3, name: 'Music Concert 2025', date: '2025-08-05', ticketsTotal: 2000, ticketPrice: 35 },
  { id: 4, name: 'Art Exhibition 2025', date: '2025-08-18', ticketsTotal: 300, ticketPrice: 25 }
];

const objectiveOptions = [
  { 
    id: 'ticket_sales', 
    name: 'Ticket Sales', 
    description: 'Optimize for ticket purchases. Best for events with ticket sales open now.',
    icon: Ticket,
    recommended: true
  },
  { 
    id: 'event_registrations', 
    name: 'Event Registrations', 
    description: 'Drive registrations or sign-ups for free events or waitlists.',
    icon: ShoppingCart,
    recommended: false
  },
  { 
    id: 'website_traffic', 
    name: 'Event Website Traffic', 
    description: 'Drive traffic to your event website. Good for awareness phase.',
    icon: Navigation,
    recommended: false
  },
  { 
    id: 'brand_awareness', 
    name: 'Brand Awareness', 
    description: 'Increase awareness of your event brand in your target market.',
    icon: Users,
    recommended: false
  }
];

const CampaignObjectiveStep: React.FC<CampaignObjectiveStepProps> = ({ 
  campaignData, 
  updateCampaignData 
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCampaignData({ name: e.target.value });
  };
  
  const handleObjectiveChange = (objective: string) => {
    updateCampaignData({ objective });
  };
  
  const handleEventChange = (eventId: string) => {
    const selectedEvent = eventOptions.find(event => event.id === parseInt(eventId));
    updateCampaignData({ event: selectedEvent });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="campaign-name">Campaign Name</Label>
        <Input 
          id="campaign-name" 
          placeholder="Enter a name for your campaign" 
          value={campaignData.name} 
          onChange={handleNameChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="event-select">Select Event</Label>
        <Select 
          value={campaignData.event?.id.toString()} 
          onValueChange={handleEventChange}
        >
          <SelectTrigger id="event-select">
            <SelectValue placeholder="Select an event to promote" />
          </SelectTrigger>
          <SelectContent>
            {eventOptions.map(event => (
              <SelectItem key={event.id} value={event.id.toString()}>
                {event.name} ({new Date(event.date).toLocaleDateString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {campaignData.event && (
          <div className="mt-4 p-4 bg-slate-50 rounded-md">
            <p className="font-medium">{campaignData.event.name}</p>
            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p>{new Date(campaignData.event.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ticket Capacity</p>
                <p>{campaignData.event.ticketsTotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Average Ticket Price</p>
                <p>${campaignData.event.ticketPrice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Campaign Objective</Label>
        <p className="text-sm text-muted-foreground">
          Choose what you want to achieve with this campaign
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {objectiveOptions.map(objective => {
            const Icon = objective.icon;
            return (
              <Card 
                key={objective.id}
                className={`cursor-pointer transition-all ${
                  campaignData.objective === objective.id 
                    ? 'border-meta-blue bg-blue-50' 
                    : 'hover:border-blue-200'
                }`}
                onClick={() => handleObjectiveChange(objective.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-full p-2 ${
                      campaignData.objective === objective.id
                        ? 'bg-meta-blue text-white'
                        : 'bg-blue-100'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center">
                        {objective.name}
                        {objective.recommended && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                            Recommended
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {objective.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CampaignObjectiveStep;
