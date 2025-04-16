
export const getDateRange = (preset: string) => {
  const date = preset === 'today' 
    ? new Date() 
    : new Date(Date.now() - 86400000); // yesterday
  
  return {
    since: date.toISOString().split('T')[0],
    until: date.toISOString().split('T')[0]
  };
};
