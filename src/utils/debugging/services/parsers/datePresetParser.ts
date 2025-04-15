
export const parseDatePreset = (queryParams?: string): string | undefined => {
  if (!queryParams) return undefined;
  
  const match = queryParams.match(/date_preset\(([^)]+)\)/);
  return match ? match[1] : undefined;
};
