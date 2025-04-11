
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ImportCard from '@/components/dashboard/ImportCard';

const Import = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Import Data</h1>
        <p className="text-muted-foreground">Import data from Meta Ads or CSV files.</p>
        
        <ImportCard />
      </div>
    </AppLayout>
  );
};

export default Import;
