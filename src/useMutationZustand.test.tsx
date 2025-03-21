import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { useMutationZustand } from "./useMutationZustand";

// Mock handleError
const mockHandleError = vi.fn();
vi.mock("./errorHandler", () => ({
  handleError: (e: any) => mockHandleError(e),
}));

describe("useMutationZustand (pure vitest)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("calls mutationFn and onSuccess on success", async () => {
    const mutationFn = vi.fn().mockResolvedValue("Success!");
    const onSuccess = vi.fn();

    function TestComponent() {
      const { mutate, isLoading, error } = useMutationZustand({
        mutationFn,
        onSuccess,
      });

      useEffect(() => {
        mutate("hello");
      }, []);

      return (
        <div>
          <div>Loading: {isLoading ? "yes" : "no"}</div>
          <div>Error: {error?.message || "none"}</div>
        </div>
      );
    }

    await act(async () => {
      const root = createRoot(container);
      root.render(<TestComponent />);
    });

    expect(mutationFn).toHaveBeenCalledWith("hello");
    expect(onSuccess).toHaveBeenCalledWith("Success!");
  });

  it("handles error and calls onError on failure", async () => {
    const error = new Error("Failure!");
    const mutationFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    function TestComponent() {
      const { mutate, isLoading, error } = useMutationZustand({
        mutationFn,
        onError,
      });

      useEffect(() => {
        mutate("bad-input").catch(() => {});
      }, []);

      return (
        <div>
          <div>Loading: {isLoading ? "yes" : "no"}</div>
          <div>Error: {error?.message || "none"}</div>
        </div>
      );
    }

    await act(async () => {
      const root = createRoot(container);
      root.render(<TestComponent />);
    });

    expect(mutationFn).toHaveBeenCalledWith("bad-input");
    expect(onError).toHaveBeenCalledWith(error);
    expect(mockHandleError).toHaveBeenCalledWith(error);
  });
});
