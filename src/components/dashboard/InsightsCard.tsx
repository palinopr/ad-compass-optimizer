
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const insights = [
  {
    id: 1,
    title: "Campaign 'Summer Sale' underperforming on mobile",
    description: "Your mobile conversion rate is 43% lower than desktop. Consider optimizing mobile landing pages.",
    impact: "high"
  },
  {
    id: 2,
    title: "Audience overlap detected in 2 campaigns",
    description: "Your 'New Customer' and 'Retargeting' campaigns have 37% audience overlap.",
    impact: "medium"
  },
  {
    id: 3,
    title: "Budget allocation opportunity",
    description: "Campaign 'Product Launch' has 3.2x higher ROAS than others. Consider reallocating budget.",
    impact: "high"
  }
];

const InsightsCard = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map(insight => (
          <div 
            key={insight.id} 
            className="p-3 border rounded-lg bg-gradient-to-r from-white to-gray-50 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
              <Badge impact={insight.impact} />
            </div>
            <div className="flex justify-end mt-2">
              <Button variant="ghost" size="sm" className="text-xs">
                Take action
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Badge component for impact level
const Badge = ({ impact }: { impact: string }) => {
  return (
    <div className={`px-2 py-1 rounded-md text-xs font-medium ${
      impact === 'high' ? 'bg-red-100 text-red-700' : 
      impact === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
      'bg-blue-100 text-blue-700'
    }`}>
      {impact} impact
    </div>
  );
};

export default InsightsCard;
