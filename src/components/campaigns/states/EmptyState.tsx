
import React from 'react';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = "📭",
  title, 
  description 
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        <span className="text-4xl" role="img" aria-label="empty state icon">
          {icon}
        </span>
        <h3 className="text-lg font-medium text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      </div>
    </Card>
  );
};

export default EmptyState;
