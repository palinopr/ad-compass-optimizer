
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

const Audience = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Audience Insights</h1>
        <p className="text-muted-foreground">Demographics and behavior of your ad audiences.</p>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Audience Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Audience insights and demographic analysis will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Audience;
