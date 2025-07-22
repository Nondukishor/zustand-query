import { useEffect, useState } from "react";
import { useQueryCacheStore } from "./createQueryCacheStore";

export function useQueryZustand<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    enabled?: boolean;
    onError?: (err: any) => void;
    retry?: boolean | number;
  }
) {
  const cacheStore = useQueryCacheStore();
  const cache = useQueryCacheStore((s) => s.cache[key]);
  const [data, setData] = useState<T | null>(cache?.data ?? null);
  const [error, setError] = useState<any>(cache?.error ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(cache?.isLoading ?? false);

  useEffect(() => {
    let isMounted = true;
    if (options?.enabled === false) return;

    setIsLoading(true);
    cacheStore
      .fetchQuery<T>(
        key,
        fetchFn,
        options?.staleTime ?? 0,
        (err) => {
          if (isMounted) setError(err);
          options?.onError?.(err);
        },
        options?.retry
      )
      .then((result) => {
        if (isMounted) setData(result);
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fetchFn, options?.enabled, options?.staleTime, options?.retry]);

  return {
    data,
    error,
    isLoading,
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
