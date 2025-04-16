
export const parseDatePreset = (queryParams?: string): string | undefined => {
  if (!queryParams) return undefined;
  
  // First try to extract from insights.date_preset(xxx) format
  const insightsMatch = queryParams.match(/insights\.date_preset\(([^)]+)\)/);
  if (insightsMatch) {
    return insightsMatch[1];
  }
  
  // Try to extract from direct date_preset(xxx) format
  const directMatch = queryParams.match(/date_preset\(([^)]+)\)/);
  if (directMatch) {
    return directMatch[1];
  }
  
  // Try to extract from URL parameter date_preset=xxx format
  const urlParamMatch = queryParams.match(/[?&]date_preset=([^&]+)/);
  if (urlParamMatch) {
    return urlParamMatch[1];
  }
  
  return undefined;
};

/**
 * All valid Meta API date presets - STRICT list from Meta documentation
 */
const validMetaPresets = [
  'today',
  'yesterday', 
  'this_month', 
  'last_month',
  'this_quarter', 
  'lifetime', 
  'last_3d', 
  'last_7d', 
  'last_14d',
  'last_28d', 
  'last_30d', 
  'last_90d',
  'last_week_mon_sun', 
  'last_week_sun_sat', 
  'last_quarter', 
  'last_year',
  'this_week_mon_today', 
  'this_week_sun_today', 
  'this_year',
  'maximum'
] as const; // Use 'as const' to make this a readonly tuple

// Define the type for valid Meta API date presets
export type ValidMetaDatePreset = typeof validMetaPresets[number];

/**
 * Validates if a date preset is a valid Meta API value
 */
export const isValidMetaDatePreset = (preset?: string): boolean => {
  if (!preset) return false;
  return validMetaPresets.includes(preset as any);
};

/**
 * Maps legacy date presets to Meta API compatible values
 * Only returns strictly valid Meta API values
 */
export const mapToValidDatePreset = (preset?: string): ValidMetaDatePreset => {
  if (!preset) return 'last_28d'; // Default
  
  // If it's already a valid preset, use it
  if (isValidMetaDatePreset(preset)) {
    return preset as ValidMetaDatePreset;
  }
  
  // Strict mapping for legacy values
  if (preset === 'last30days' || preset === 'last_30days' || preset === 'last_30d') {
    console.log(`[DATE PRESET MAPPING] Mapped legacy preset '${preset}' to 'last_28d'`);
    return 'last_28d';
  }
  
  if (preset === 'last7days') {
    console.log(`[DATE PRESET MAPPING] Mapped legacy preset '${preset}' to 'last_7d'`);
    return 'last_7d';
  }
  
  // Default fallback
  console.warn(`[DATE PRESET MAPPING] Unrecognized preset '${preset}', using default 'last_28d'`);
  return 'last_28d';
};

/**
 * Get a descriptive label for a date preset
 */
export const getDatePresetLabel = (preset: string): string => {
  const labels: Record<string, string> = {
    'today': 'Today',
    'yesterday': 'Yesterday',
    'last_7d': 'Last 7 days',
    'last_14d': 'Last 14 days',
    'last_28d': 'Last 28 days',
    'last_30d': 'Last 30 days',
    'this_month': 'This month',
    'last_month': 'Last month',
    'maximum': 'Maximum available data',
    'lifetime': 'Lifetime'
  };
  
  return labels[preset] || preset;
};
