
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const Reports = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and view campaign reports.</p>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Report Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Report generation and management will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
