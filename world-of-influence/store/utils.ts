// Debounce helper for cloud sync
let syncTimeout: NodeJS.Timeout | null = null;
export const debounceSync = (syncFn: () => Promise<void>) => {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncFn();
  }, 2000); // 2 second debounce
};

export const metersToKilometers = (meters: number) => meters / 1000;
