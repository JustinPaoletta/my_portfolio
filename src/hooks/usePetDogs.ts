/**
 * Hook for managing pet dog statistics with localStorage and Vercel KV persistence
 * Updates server-side stats via API while maintaining localStorage as fallback
 */

import { useState, useCallback, useEffect } from 'react';

interface DogStats {
  treats: number;
  scritches: number;
}

interface DogData {
  name: string;
  stats: DogStats;
}

const STORAGE_KEY = 'pet-dogs-stats';
const API_ENDPOINT = '/api/pet-dogs';

/**
 * Load dog stats from localStorage
 */
function loadDogStats(): Record<string, DogStats> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Record<string, DogStats>;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(
        '[usePetDogs] Failed to load stats from localStorage:',
        error
      );
    }
  }
  return {};
}

/**
 * Save dog stats to localStorage
 */
function saveDogStats(stats: Record<string, DogStats>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(
        '[usePetDogs] Failed to save stats to localStorage:',
        error
      );
    }
  }
}

/**
 * Fetch stats from the API
 */
async function fetchStatsFromAPI(): Promise<Record<string, DogStats> | null> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = (await response.json()) as { stats: Record<string, DogStats> };
    return data.stats;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[usePetDogs] Failed to fetch stats from API:', error);
    }
    return null;
  }
}

/**
 * Update stats on the server via API
 */
async function updateStatsOnServer(
  dogName: string,
  action: 'treat' | 'scritch'
): Promise<void> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dogName, action }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
  } catch (error) {
    // Fail silently - localStorage fallback will handle it
    if (import.meta.env.DEV) {
      console.warn('[usePetDogs] Failed to update stats on server:', error);
    }
  }
}

/**
 * Hook for managing pet dog statistics with localStorage and API persistence
 * @param initialDogs - Initial dog data array with name and stats
 * @returns Tuple of [dogs data, updateStats function]
 */
export function usePetDogs(
  initialDogs: DogData[]
): [DogData[], (dogName: string, statType: 'treats' | 'scritches') => void] {
  const [dogs, setDogs] = useState<DogData[]>(() => {
    // Load from localStorage on mount (instant UI)
    const savedStats = loadDogStats();
    return initialDogs.map((dog) => ({
      ...dog,
      stats: savedStats[dog.name] || dog.stats,
    }));
  });

  // Fetch server stats on mount (syncs with server state)
  useEffect(() => {
    void fetchStatsFromAPI().then((serverStats) => {
      if (serverStats) {
        setDogs((prevDogs) =>
          prevDogs.map((dog) => ({
            ...dog,
            stats: serverStats[dog.name] || dog.stats,
          }))
        );
        // Update localStorage with server stats
        saveDogStats(serverStats);
      }
    });
  }, []);

  // Update stats (optimistic update + API call)
  const updateStats = useCallback(
    (dogName: string, statType: 'treats' | 'scritches'): void => {
      const action =
        statType === 'treats' ? ('treat' as const) : ('scritch' as const);

      // Optimistic update - update UI immediately
      setDogs((prevDogs) => {
        const updatedDogs = prevDogs.map((dog) =>
          dog.name === dogName
            ? {
                ...dog,
                stats: {
                  ...dog.stats,
                  [statType]: dog.stats[statType] + 1,
                },
              }
            : dog
        );

        // Persist to localStorage immediately (fallback)
        const statsToSave: Record<string, DogStats> = {};
        updatedDogs.forEach((dog) => {
          statsToSave[dog.name] = dog.stats;
        });
        saveDogStats(statsToSave);

        return updatedDogs;
      });

      // Update on server (fire and forget - doesn't block UI)
      void updateStatsOnServer(dogName, action);
    },
    []
  );

  return [dogs, updateStats];
}
