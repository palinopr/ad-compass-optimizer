
import React from 'react';
import { Check, X, Brain, Bug } from 'lucide-react';

export interface DiagnosticItem {
  label: string;
  status: 'success' | 'error' | 'info' | 'warning';
  details?: string;
}

interface DiagnosticItemsProps {
  items: DiagnosticItem[];
}

const DiagnosticItems: React.FC<DiagnosticItemsProps> = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          {item.status === 'success' && <Check className="w-4 h-4 text-green-500" />}
          {item.status === 'error' && <X className="w-4 h-4 text-red-500" />}
          {item.status === 'warning' && <Bug className="w-4 h-4 text-amber-500" />}
          {item.status === 'info' && <Brain className="w-4 h-4 text-blue-500" />}
          <span className="font-medium">{item.label}:</span>
          <span className={item.status === 'error' ? 'text-red-600' : 'text-gray-600'}>
            {item.details}
          </span>
        </div>
      ))}
    </div>
  );
};

export default DiagnosticItems;
