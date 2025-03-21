import { describe, it, expect, vi, beforeEach } from "vitest";
import { useQueryCacheStore } from ".";

describe("useQueryCacheStore", () => {
  beforeEach(() => {
    useQueryCacheStore.getState().invalidateAll();
  });

  it("fetches and caches data correctly", async () => {
    const mockFn = vi.fn().mockResolvedValue("fetched data");

    const result = await useQueryCacheStore
      .getState()
      .fetchQuery("test-key", mockFn);

    expect(result).toBe("fetched data");
    expect(mockFn).toHaveBeenCalledTimes(1);

    const cached = useQueryCacheStore.getState().cache["test-key"];
    expect(cached.data).toBe("fetched data");
    expect(cached.isLoading).toBe(false);
    expect(cached.error).toBe(null);
  });

  it("returns cached data if not stale", async () => {
    const mockFn = vi.fn().mockResolvedValue("cached");

    await useQueryCacheStore.getState().fetchQuery("my-key", mockFn);
    const result = await useQueryCacheStore
      .getState()
      .fetchQuery("my-key", mockFn);

    expect(result).toBe("cached");
    expect(mockFn).toHaveBeenCalledTimes(1); // Should not re-fetch
  });

  it("fetches again if stale", async () => {
    const mockFn = vi.fn().mockResolvedValue("fresh");

    await useQueryCacheStore.getState().fetchQuery("stale-key", mockFn);
    // Manually modify lastFetched to simulate staleness
    useQueryCacheStore.setState((state) => ({
      cache: {
        ...state.cache,
        "stale-key": {
          ...state.cache["stale-key"],
          lastFetched: Date.now() - 10000, // 10s ago
        },
      },
    }));

    const result = await useQueryCacheStore
      .getState()
      .fetchQuery("stale-key", mockFn, 5000); // staleTime = 5s

    expect(mockFn).toHaveBeenCalledTimes(2); // Should re-fetch
    expect(result).toBe("fresh");
  });

  it("retries if fetch fails", async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockResolvedValueOnce("recovered");

    const result = await useQueryCacheStore
      .getState()
      .fetchQuery("retry-key", mockFn, 0, undefined, 1);

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(result).toBe("recovered");
  });

  it("handles error and calls onError", async () => {
    const error = new Error("API error");
    const fetchFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    await expect(
      useQueryCacheStore
        .getState()
        .fetchQuery("fail-key", fetchFn, 0, onError, 0)
    ).rejects.toThrow("API error");

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error);

    const cache = useQueryCacheStore.getState().cache["fail-key"];
    expect(cache.error).toBe(error);
    expect(cache.isLoading).toBe(false);
  });

  it("invalidates a single query", async () => {
    const fetchFn = vi.fn().mockResolvedValue("to be removed");

    await useQueryCacheStore.getState().fetchQuery("remove-me", fetchFn);
    expect(useQueryCacheStore.getState().cache["remove-me"]).toBeDefined();

    useQueryCacheStore.getState().invalidateQuery("remove-me");
    expect(useQueryCacheStore.getState().cache["remove-me"]).toBeUndefined();
  });

  it("invalidates all queries", async () => {
    const fn = vi.fn().mockResolvedValue("some value");
    await useQueryCacheStore.getState().fetchQuery("key1", fn);
    await useQueryCacheStore.getState().fetchQuery("key2", fn);

    useQueryCacheStore.getState().invalidateAll();

    expect(Object.keys(useQueryCacheStore.getState().cache).length).toBe(0);
  });
});
