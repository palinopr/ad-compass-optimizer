
import { useState } from 'react';
import { useItemInsights } from './useItemInsights';

interface SelectedItem {
  id: string;
  name: string;
  type: 'campaign' | 'adset';
  data: any;
}

export const useItemSelection = () => {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const { insights, isLoading, fetchInsights } = useItemInsights();
  
  const handleItemSelect = async (id: string, name: string, type: 'campaign' | 'adset', data: any) => {
    setSelectedItem({ id, name, type, data });
    await fetchInsights(id, type);
  };
  
  const clearSelection = () => setSelectedItem(null);
  
  return {
    selectedItem,
    insights,
    isLoading,
    handleItemSelect,
    clearSelection
  };
};
