import { create } from "zustand";
import { handleError } from "./errorHandler.js";

type CacheItem<T> = {
  data: T | null;
  error: any;
  isLoading: boolean;
  lastFetched: number | null;
  fetchFn: () => Promise<T>;
};

type CacheStore = {
  cache: Record<string, CacheItem<any>>;
  fetchQuery: <T>(
    key: string,
    fetchFn: () => Promise<T>,
    staleTime?: number,
    onError?: (err: any) => void,
    retry?: boolean | number
  ) => Promise<T>;
  invalidateQuery: (key: string) => void;
  invalidateAll: () => void;
};

export const useQueryCacheStore = create<CacheStore>((set, get) => ({
  cache: {},

  fetchQuery: async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    staleTime = 0,
    onError?: (err: any) => void,
    retry: number | boolean = 0
  ): Promise<T> => {
    const existing = get().cache[key];
    const now = Date.now();
    const isStale =
      !existing?.lastFetched || now - existing.lastFetched > staleTime;

    if (existing && !isStale && existing.data) return existing.data;

    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          ...existing,
          isLoading: true,
          error: null,
          fetchFn,
        },
      },
    }));

    const attemptFetch = async (retries: number): Promise<T> => {
      try {
        const data: T = await fetchFn();
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: {
              data,
              isLoading: false,
              error: null,
              lastFetched: Date.now(),
              fetchFn,
            },
          },
        }));
        return data;
      } catch (error) {
        if (retries > 0) {
          return attemptFetch(retries - 1);
        }
        handleError(error);
        onError?.(error);
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: {
              data: null,
              isLoading: false,
              error,
              lastFetched: Date.now(),
              fetchFn,
            },
          },
        }));
        throw error;
      }
    };

    return attemptFetch(typeof retry === "number" ? retry : retry ? 3 : 0);
  },

  invalidateQuery: (key) => {
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[key];
      return { cache: newCache };
    });
  },

  invalidateAll: () => set({ cache: {} }),
}));
