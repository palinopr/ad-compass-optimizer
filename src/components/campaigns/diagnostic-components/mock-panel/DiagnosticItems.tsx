
import React from 'react';

export type DiagnosticItemStatus = 'success' | 'warning' | 'error' | 'info';

export interface DiagnosticItem {
  label: string;
  status: DiagnosticItemStatus;
  details: string;
}

interface DiagnosticItemsProps {
  items: DiagnosticItem[];
}

const DiagnosticItems: React.FC<DiagnosticItemsProps> = ({ items }) => {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-start text-sm">
          <span className="text-gray-600">{item.label}:</span>
          <span className={`
            flex-1 text-right
            ${item.status === 'success' ? 'text-green-600' : ''}
            ${item.status === 'warning' ? 'text-amber-600' : ''}
            ${item.status === 'error' ? 'text-red-600' : ''}
            ${item.status === 'info' ? 'text-blue-600' : ''}
          `}>
            {item.details}
          </span>
        </div>
      ))}
    </div>
  );
};

export default DiagnosticItems;
