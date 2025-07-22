import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEffect, act } from "react";
import { createRoot } from "react-dom/client";

import { useMutationZustand } from "./useMutationZustand";

// Mock the error handler
const mockHandleError = vi.fn();
vi.mock("./errorHandler", () => ({
  handleError: (e: any) => mockHandleError(e),
}));

describe("useMutationZustand (Vitest only)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    mockHandleError.mockReset();
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
        mutate("input-var");
      }, []);

      return (
        <div>
          <div id="loading">{isLoading ? "Loading" : "Idle"}</div>
          <div id="error">{error?.message || "No Error"}</div>
        </div>
      );
    }

    await act(async () => {
      const root = createRoot(container);
      root.render(<TestComponent />);
    });

    // Assert
    expect(mutationFn).toHaveBeenCalledWith("input-var");
    expect(onSuccess).toHaveBeenCalledWith("Success!");
    expect(container.querySelector("#loading")?.textContent).toBe("Idle");
    expect(container.querySelector("#error")?.textContent).toBe("No Error");
  });

  it("handles mutation error and calls onError", async () => {
    const error = new Error("Something went wrong");
    const mutationFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    function TestComponent() {
      const { mutate, isLoading, error } = useMutationZustand({
        mutationFn,
        onError,
      });

      useEffect(() => {
        mutate("fail-case").catch(() => {});
      }, []);

      return (
        <div>
          <div id="loading">{isLoading ? "Loading" : "Idle"}</div>
          <div id="error">{error?.message || "No Error"}</div>
        </div>
      );
    }

    await act(async () => {
      const root = createRoot(container);
      root.render(<TestComponent />);
    });

    // Assert
    expect(mutationFn).toHaveBeenCalledWith("fail-case");
    expect(onError).toHaveBeenCalledWith(error);
    expect(mockHandleError).toHaveBeenCalledWith(error);
    expect(container.querySelector("#loading")?.textContent).toBe("Idle");
    expect(container.querySelector("#error")?.textContent).toBe(
      "Something went wrong"
    );
  });
});
