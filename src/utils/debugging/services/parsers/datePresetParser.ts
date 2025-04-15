
export const parseDatePreset = (queryParams?: string): string => {
  if (!queryParams) return '';
  
  const datePresetMatch = queryParams.match(/date_preset=([^&]+)/);
  return datePresetMatch ? datePresetMatch[1] : '';
};
