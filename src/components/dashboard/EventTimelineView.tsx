
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, Ticket, DollarSign, Clock } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// Sample events data
const events = [
  { 
    id: 1, 
    name: "Summer Festival", 
    date: "2025-06-15",
    ticketSalesStart: "2025-03-01",
  },
  { 
    id: 2, 
    name: "Tech Conference", 
    date: "2025-07-22",
    ticketSalesStart: "2025-04-15",
  },
  { 
    id: 3, 
    name: "Music Concert", 
    date: "2025-08-05",
    ticketSalesStart: "2025-05-01",
  },
  { 
    id: 4, 
    name: "Art Exhibition", 
    date: "2025-08-18",
    ticketSalesStart: "2025-06-01",
  }
];

// Sample timeline data for events
// This would come from the Meta Ads API in production
const generateTimelineData = (eventId: number) => {
  // Find the selected event
  const selectedEvent = events.find(event => event.id === eventId) || events[0];
  
  // Parse dates
  const eventDate = new Date(selectedEvent.date);
  const ticketSalesStartDate = new Date(selectedEvent.ticketSalesStart);
  
  // Calculate days between ticket sales start and event
  const daysBetween = Math.floor((eventDate.getTime() - ticketSalesStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate daily data points
  const timelineData = [];
  const currentDate = new Date(ticketSalesStartDate);
  
  // Pre-event data (actual)
  for (let i = 0; i <= daysBetween; i++) {
    // Create a pattern where ad spend and ticket sales increase as event approaches
    const daysToEvent = daysBetween - i;
    const dayFactor = 1 + (i / daysBetween) * 2; // Increases as event gets closer
    
    // Ad spend increases gradually, then more rapidly in final weeks
    const adSpend = Math.round(50 + (100 * dayFactor));
    
    // Ticket sales follow a similar pattern but with some randomness
    const baseTicketSales = Math.round(5 + (15 * dayFactor));
    const randomFactor = 0.8 + (Math.random() * 0.4); // Random factor between 0.8 and 1.2
    const ticketSales = Math.round(baseTicketSales * randomFactor);
    
    // Revenue calculation
    const ticketPrice = 50; // Average ticket price
    const revenue = ticketSales * ticketPrice;
    
    // ROAS calculation
    const roas = adSpend > 0 ? parseFloat((revenue / adSpend).toFixed(2)) : 0;
    
    // Format date for display
    const formattedDate = currentDate.toISOString().split('T')[0];
    
    timelineData.push({
      date: formattedDate,
      adSpend,
      ticketSales,
      revenue,
      roas,
      daysToEvent
    });
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return timelineData;
};

// Chart configuration
const chartConfig = {
  adSpend: {
    label: "Ad Spend ($)",
    theme: {
      light: "#FF5722",
      dark: "#fdba74"
    }
  },
  ticketSales: {
    label: "Ticket Sales",
    theme: {
      light: "#4CAF50",
      dark: "#86efac"
    }
  },
  revenue: {
    label: "Revenue ($)",
    theme: {
      light: "#1877F2",
      dark: "#60a5fa"
    }
  },
  roas: {
    label: "ROAS",
    theme: {
      light: "#9b87f5",
      dark: "#c4b5fd"
    }
  }
};

const EventTimelineView: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<number>(1);
  const [selectedMetric, setSelectedMetric] = useState<string>("ticketSales");
  const [timelineData, setTimelineData] = useState(() => generateTimelineData(1));
  
  // Handle event selection change
  const handleEventChange = (value: string) => {
    const eventId = parseInt(value);
    setSelectedEventId(eventId);
    setTimelineData(generateTimelineData(eventId));
  };
  
  // Find the selected event
  const selectedEvent = events.find(event => event.id === selectedEventId) || events[0];
  
  // Calculate key milestone dates
  const eventDate = new Date(selectedEvent.date);
  const ticketSalesStartDate = new Date(selectedEvent.ticketSalesStart);
  
  // Format dates for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate days until event
  const today = new Date();
  const daysUntilEvent = Math.max(0, Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Calculate optimal promotion periods
  // In a real implementation, this would be based on historical data analysis
  const earlyPromoStart = new Date(eventDate);
  earlyPromoStart.setDate(eventDate.getDate() - 90);
  
  const peakPromoStart = new Date(eventDate);
  peakPromoStart.setDate(eventDate.getDate() - 30);
  
  const lastMinutePromoStart = new Date(eventDate);
  lastMinutePromoStart.setDate(eventDate.getDate() - 7);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center text-lg font-medium">
            <Calendar className="w-5 h-5 mr-2" />
            Event Timeline View
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <Select value={selectedEventId.toString()} onValueChange={handleEventChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ticketSales">Ticket Sales</SelectItem>
                <SelectItem value="adSpend">Ad Spend</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="roas">ROAS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6 p-4 bg-slate-50 rounded-md border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-slate-500">Event Date</div>
              <div className="text-lg font-bold">{formatDate(eventDate)}</div>
              <div className="text-xs text-blue-600 mt-1">
                {daysUntilEvent > 0 ? `${daysUntilEvent} days remaining` : 'Event completed'}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Ticket Sales Started</div>
              <div className="text-lg font-bold">{formatDate(ticketSalesStartDate)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Campaign Duration</div>
              <div className="text-lg font-bold">
                {Math.floor((eventDate.getTime() - ticketSalesStartDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <div className="text-sm">
                <span className="font-medium">Early Awareness:</span> {formatDate(earlyPromoStart)} - {formatDate(peakPromoStart)}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <div className="text-sm">
                <span className="font-medium">Peak Promotion:</span> {formatDate(peakPromoStart)} - {formatDate(lastMinutePromoStart)}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <div className="text-sm">
                <span className="font-medium">Last Minute Push:</span> {formatDate(lastMinutePromoStart)} - {formatDate(eventDate)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timelineData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'adSpend' || name === 'revenue') {
                    return [`$${value}`, chartConfig[name as keyof typeof chartConfig].label];
                  } else if (name === 'roas') {
                    return [`${value}x`, chartConfig[name as keyof typeof chartConfig].label];
                  }
                  return [value, chartConfig[name as keyof typeof chartConfig].label];
                }}
                labelFormatter={(date) => {
                  const d = new Date(date);
                  return d.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
              />
              <Legend />
              
              {/* Early Awareness Period */}
              <ReferenceLine
                x={earlyPromoStart.toISOString().split('T')[0]}
                stroke="purple"
                strokeDasharray="3 3"
                label={{ value: 'Early Awareness', position: 'insideTopLeft', fill: 'purple', fontSize: 12 }}
              />
              
              {/* Peak Promotion Period */}
              <ReferenceLine
                x={peakPromoStart.toISOString().split('T')[0]}
                stroke="blue"
                strokeDasharray="3 3"
                label={{ value: 'Peak Promotion', position: 'insideTopLeft', fill: 'blue', fontSize: 12 }}
              />
              
              {/* Last Minute Push */}
              <ReferenceLine
                x={lastMinutePromoStart.toISOString().split('T')[0]}
                stroke="green"
                strokeDasharray="3 3"
                label={{ value: 'Last Minute', position: 'insideTopLeft', fill: 'green', fontSize: 12 }}
              />
              
              {/* Event Date */}
              <ReferenceLine
                x={eventDate.toISOString().split('T')[0]}
                stroke="red"
                label={{ value: 'Event Day', position: 'insideTopLeft', fill: 'red', fontSize: 12 }}
              />
              
              {/* Display the selected metric */}
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={chartConfig[selectedMetric as keyof typeof chartConfig].theme.light}
                fill={chartConfig[selectedMetric as keyof typeof chartConfig].theme.light + "80"}
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Promotion Period Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  Early Awareness
                </h4>
                <p className="text-sm text-slate-500 mt-2">
                  Focus on building awareness with broader targeting and lower daily budgets. 
                  Ideal for introducing the event and capturing early bird ticket sales.
                </p>
                <div className="mt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Recommended Budget:</span>
                    <span className="font-medium">20-30% of total</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Targeting:</span>
                    <span className="font-medium">Broad</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  Peak Promotion
                </h4>
                <p className="text-sm text-slate-500 mt-2">
                  Increase budget and narrow targeting to reach most likely attendees. 
                  This period typically sees the highest conversion rates.
                </p>
                <div className="mt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Recommended Budget:</span>
                    <span className="font-medium">40-50% of total</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Targeting:</span>
                    <span className="font-medium">Narrow</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  Last Minute Push
                </h4>
                <p className="text-sm text-slate-500 mt-2">
                  Create urgency with "limited tickets remaining" messaging. 
                  Focus on remarketing to previous site visitors and similar audiences.
                </p>
                <div className="mt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Recommended Budget:</span>
                    <span className="font-medium">20-30% of total</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Targeting:</span>
                    <span className="font-medium">Remarketing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventTimelineView;
