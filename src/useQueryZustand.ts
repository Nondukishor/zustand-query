import { use } from "react";
import { useQueryCacheStore } from "./createQueryCacheStore";

export function useQueryZustand<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    enabled?: boolean;
    onError?: (err: any) => void;
    retry?: boolean | number; // Add retry option
  }
) {
  const cacheStore = useQueryCacheStore();

  const promise =
    options?.enabled === false
      ? Promise.resolve(null as T)
      : cacheStore.fetchQuery<T>(
          key,
          fetchFn,
          options?.staleTime ?? 0,
          options?.onError,
          options?.retry // Pass retry option
        );

  const data = use(promise);
  const cache = useQueryCacheStore((s) => s.cache[key]);

  return {
    data,
    error: cache?.error ?? null,
    isLoading: cache?.isLoading ?? false,
    refetch: () =>
      cacheStore.fetchQuery<T>(
        key,
        fetchFn,
        0,
        options?.onError,
        options?.retry
      ),
    invalidate: () => cacheStore.invalidateQuery(key),
  };
}
