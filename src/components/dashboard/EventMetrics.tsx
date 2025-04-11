
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import MetricCard from '@/components/dashboard/MetricCard';
import { Ticket, DollarSign, CreditCard, TrendingDown, Percent, Users, ShoppingCart, XCircle } from 'lucide-react';

// Sample events data
const events = [
  { 
    id: 1, 
    name: "Summer Festival", 
    date: "Jun 15, 2025",
    ticketsSold: 542,
    ticketsTotal: 1000,
    revenue: "$27,100",
    adSpend: "$5,420",
    roas: 5.0
  },
  { 
    id: 2, 
    name: "Tech Conference", 
    date: "Jul 22, 2025",
    ticketsSold: 328,
    ticketsTotal: 500,
    revenue: "$32,800",
    adSpend: "$7,500",
    roas: 4.37
  },
  { 
    id: 3, 
    name: "Music Concert", 
    date: "Aug 5, 2025",
    ticketsSold: 789,
    ticketsTotal: 800,
    revenue: "$47,340",
    adSpend: "$10,200",
    roas: 4.64
  },
  { 
    id: 4, 
    name: "Art Exhibition", 
    date: "Aug 18, 2025",
    ticketsSold: 156,
    ticketsTotal: 300,
    revenue: "$7,800",
    adSpend: "$2,100",
    roas: 3.71
  }
];

// Calculate funnel metrics for the selected event (using first event as default)
const selectedEvent = events[0];
const funnelMetrics = {
  ticketPageVisits: 3200,
  checkoutInitiated: 780,
  abandonedCarts: 238,
  conversions: selectedEvent.ticketsSold,
  conversionRate: ((selectedEvent.ticketsSold / 3200) * 100).toFixed(1),
  costPerTicket: (Number(selectedEvent.adSpend.replace('$', '')) / selectedEvent.ticketsSold).toFixed(2)
};

const EventMetrics = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-medium">
          Event Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tickets</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Ad Spend</TableHead>
              <TableHead>ROAS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              // Calculate percentage of tickets sold
              const percentSold = Math.round((event.ticketsSold / event.ticketsTotal) * 100);
              let statusColor = "bg-green-500";
              let badgeVariant = "success";
              
              if (percentSold < 40) {
                statusColor = "bg-red-500";
                badgeVariant = "destructive";
              } else if (percentSold < 70) {
                statusColor = "bg-yellow-500";
                badgeVariant = "warning";
              }
              
              return (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${statusColor}`} 
                          style={{ width: `${percentSold}%` }}>
                        </div>
                      </div>
                      <span className="text-xs whitespace-nowrap">
                        {event.ticketsSold}/{event.ticketsTotal}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{event.revenue}</TableCell>
                  <TableCell>{event.adSpend}</TableCell>
                  <TableCell>
                    <Badge variant={event.roas >= 4 ? "success" : event.roas >= 3 ? "secondary" : "warning"}>
                      {event.roas}x
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <div className="mt-6 border-t pt-6">
          <h3 className="font-medium mb-3">Event Funnel - {selectedEvent.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard 
              title="Page Visits" 
              value={funnelMetrics.ticketPageVisits}
              icon="users"
            />
            <MetricCard 
              title="Checkout Initiated" 
              value={funnelMetrics.checkoutInitiated}
              icon="shopping-cart"
            />
            <MetricCard 
              title="Abandoned Carts" 
              value={funnelMetrics.abandonedCarts}
              icon="x-circle"
              trendDesired="down"
            />
            <MetricCard 
              title="Conversion Rate" 
              value={`${funnelMetrics.conversionRate}%`}
              trend={+1.2}
              trendLabel="vs. prev. event"
              icon="percent"
            />
            <MetricCard 
              title="Cost Per Ticket" 
              value={`$${funnelMetrics.costPerTicket}`}
              trend={-0.75}
              trendLabel="vs. prev. event"
              trendDesired="down"
              icon="credit-card"
            />
            <MetricCard 
              title="ROAS" 
              value={`${selectedEvent.roas}x`}
              trend={+0.3}
              trendLabel="vs. prev. event"
              icon="trending-up"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventMetrics;
