
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface EmptyStateProps {
  status: 'active' | 'draft' | 'archived';
}

export const LoadingState = () => (
  <CardContent className="flex flex-col items-center justify-center py-8">
    <Loader2 className="w-6 h-6 text-meta-blue animate-spin mb-2" />
    <p className="text-muted-foreground">Loading campaigns...</p>
  </CardContent>
);

export const ErrorState = ({ 
  error, 
  isAuthenticated 
}: { 
  error: string; 
  isAuthenticated: boolean;
}) => (
  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
    <p className="text-red-500 mb-2">{error}</p>
    <p className="text-muted-foreground mb-4">
      {!isAuthenticated ? 
        "Please connect your Meta account to view campaigns." : 
        "Please check your permissions or select an ad account."}
    </p>
    {!isAuthenticated && (
      <Button className="bg-meta-blue hover:bg-meta-dark">
        Connect Meta Account
      </Button>
    )}
  </CardContent>
);

export const EmptyState = ({ status }: EmptyStateProps) => (
  <CardContent className="flex flex-col items-center justify-center py-8">
    <p className="text-muted-foreground mb-4">No {status} campaigns found.</p>
    {status === 'draft' && (
      <Button className="bg-meta-blue hover:bg-meta-dark">
        Create New Campaign
      </Button>
    )}
  </CardContent>
);
