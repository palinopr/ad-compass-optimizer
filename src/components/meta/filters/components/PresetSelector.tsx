
import React from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { presets } from '../constants';
import { DatePresetOption } from '../types';

interface PresetSelectorProps {
  selectedPreset: DatePresetOption;
  onPresetChange: (preset: DatePresetOption) => void;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedPreset,
  onPresetChange,
}) => {
  const currentPresetLabel = presets.find(p => p.value === selectedPreset)?.label || 'Custom';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{currentPresetLabel}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {presets.map((preset) => (
          <DropdownMenuItem 
            key={preset.value}
            onClick={() => onPresetChange(preset.value)}
            className={cn(
              selectedPreset === preset.value && "bg-accent"
            )}
          >
            {preset.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PresetSelector;
