
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
 * Validates if a date preset is a valid Meta API value
 */
export const isValidMetaDatePreset = (preset?: string): boolean => {
  if (!preset) return false;
  
  // Valid Meta API date presets
  const validPresets = [
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
    'this_year'
  ];
  
  return validPresets.includes(preset);
};

/**
 * Maps legacy date presets to Meta API compatible values
 */
export const mapToValidDatePreset = (preset?: string): string => {
  if (!preset) return 'last_28d'; // Default
  
  // Legacy mapping
  const mapping: Record<string, string> = {
    'last30days': 'last_28d',
    'last_30d': 'last_28d',
    'last7days': 'last_7d',
  };
  
  return mapping[preset] || preset;
};
