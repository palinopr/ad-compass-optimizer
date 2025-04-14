
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { type Recommendation } from '@/hooks/funnel/useRecommendations';

interface RecommendationsBoxProps {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
}

const RecommendationsBox: React.FC<RecommendationsBoxProps> = ({
  recommendations,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            No recommendations at this time - performance looking good! ✨
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div 
              key={rec.id}
              className={`flex items-start gap-2 p-2 rounded-lg ${
                rec.type === 'warning' ? 'bg-yellow-50' :
                rec.type === 'success' ? 'bg-green-50' :
                'bg-blue-50'
              }`}
            >
              <span className="text-lg">{rec.icon}</span>
              <span className="text-sm">{rec.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsBox;
