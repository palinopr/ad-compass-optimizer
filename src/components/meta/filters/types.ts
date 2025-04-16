
import { ValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
} | null;

export type DatePresetOption = ValidMetaDatePreset | 'custom';

export type UIPresetOption = {
  label: string;
  value: DatePresetOption;
};
