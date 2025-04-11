
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const OptimizationScore = () => {
  const score = 76;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Account Optimization Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-2">
          <span className="text-3xl font-bold">{score}</span>
          <span className="text-lg">/100</span>
        </div>
        <Progress 
          value={score} 
          className={`h-2 mb-4 ${
            score >= 80 ? 'bg-green-100' :
            score >= 60 ? 'bg-yellow-100' :
            'bg-red-100'
          }`}
        />
        
        <div className="space-y-3">
          <OptimizationItem 
            title="Add responsive search ads"
            impact="High"
            status="incomplete"
          />
          <OptimizationItem 
            title="Update audience targeting"
            impact="Medium"
            status="incomplete"
          />
          <OptimizationItem 
            title="Implement conversion tracking"
            impact="High"
            status="complete"
          />
          <OptimizationItem 
            title="Adjust bid strategy"
            impact="Medium"
            status="incomplete"
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface OptimizationItemProps {
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  status: 'complete' | 'incomplete';
}

const OptimizationItem = ({ title, impact, status }: OptimizationItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-full mr-2 ${
          status === 'complete' ? 'bg-green-500' : 'border-2 border-gray-300'
        }`}>
          {status === 'complete' && (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <span className="text-sm">{title}</span>
      </div>
      <div className={`px-2 py-0.5 rounded text-xs font-medium ${
        impact === 'High' ? 'bg-red-100 text-red-700' :
        impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
        'bg-blue-100 text-blue-700'
      }`}>
        {impact}
      </div>
    </div>
  );
};

export default OptimizationScore;
