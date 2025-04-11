
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Sample events data
const events = [
  { 
    id: 1, 
    name: "Summer Festival", 
    date: "Jun 15, 2025",
    ticketsSold: 542,
    ticketsTotal: 1000,
    revenue: "$27,100"
  },
  { 
    id: 2, 
    name: "Tech Conference", 
    date: "Jul 22, 2025",
    ticketsSold: 328,
    ticketsTotal: 500,
    revenue: "$32,800"
  },
  { 
    id: 3, 
    name: "Music Concert", 
    date: "Aug 5, 2025",
    ticketsSold: 789,
    ticketsTotal: 800,
    revenue: "$47,340"
  },
  { 
    id: 4, 
    name: "Art Exhibition", 
    date: "Aug 18, 2025",
    ticketsSold: 156,
    ticketsTotal: 300,
    revenue: "$7,800"
  }
];

const EventMetrics = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-medium">
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tickets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              // Calculate percentage of tickets sold
              const percentSold = Math.round((event.ticketsSold / event.ticketsTotal) * 100);
              let statusColor = "bg-green-500";
              
              if (percentSold < 40) {
                statusColor = "bg-red-500";
              } else if (percentSold < 70) {
                statusColor = "bg-yellow-500";
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Revenue</span>
            <span className="font-medium">$115,040</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventMetrics;
