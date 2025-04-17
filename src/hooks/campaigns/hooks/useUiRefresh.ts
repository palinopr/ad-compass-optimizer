
import { useCallback } from 'react';

export function useUiRefresh(
  forceUiRefresh: () => void,
  setLocalForceRender: (cb: (prev: number) => number) => void
) {
  // Create a function to explicitly force UI refresh
  const exposedForceUiRefresh = useCallback(() => {
    console.log('[UI REFRESH] External component called forceUiRefresh');
    forceUiRefresh();
    setTimeout(() => {
      setLocalForceRender(prev => prev + 1);
    }, 50);
  }, [forceUiRefresh, setLocalForceRender]);

  return { exposedForceUiRefresh };
}
