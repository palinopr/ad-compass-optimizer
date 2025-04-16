
import { UIPresetOption } from './types';

export const presets: UIPresetOption[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last_7d' },
  { label: 'Last 28 days', value: 'last_28d' },
  { label: 'This month', value: 'this_month' },
  { label: 'Last month', value: 'last_month' },
  { label: 'Custom range', value: 'custom' },
];
