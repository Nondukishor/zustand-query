⚡ Performance & Feature Comparison

| Feature                   | ZStoreQ        | react-query                             |
| ------------------------- | ----------------------------------- | --------------------------------------- |
| 🔄 State management       | Zustand (global, reactive store)    | Internal React context + caching        |
| 🧠 Data cache             | In-memory with manual invalidation  | In-memory, automated, smart GC          |
| 🕒 Stale time support     | ✅ (manual staleTime support)       | ✅ (automated + configurable)           |
| 🔁 Retries on failure     | ✅ (manual retry if needed)         | ✅ (configurable, exponential backoff)  |
| ⏱ Background refresh      | ❌ (can be added manually)          | ✅                                      |
| 🚀 Performance overhead   | 🟢 Lightweight (Zustand + fetch)    | 🟡 Slightly heavier with built-in logic |
| 🪝 React 19 use() support | ✅ Native use of Suspense           | ❌ Not yet optimized for React 19       |
| 🧱 Custom store extension | ✅ (add persistence, logging, etc.) | ❌ Internal state not extensible        |
| 🔥 Global error handling  | ✅ With setGlobalErrorHandler       | ✅ via QueryClient config               |
| 🌐 DevTools               | Optional via Zustand DevTools       | ✅ Rich DevTools (out of the box)       |
| 📦 Bundle size            | 🟢 Tiny (~2KB + Zustand)            | 🟡 ~13KB min+gzip                       |
| 🧩 Mutation handling      | ✅ useMutationZustand               | ✅ Built-in mutations                   |
| 💾 Persistence support    | ✅ Zustand has persist middleware   | ✅ Needs manual setup                   |
| 🤹 Custom control         | 🟢 Full control over everything     | ⚠️ Limited to API surface               |
| 📉 Learning curve         | 🟢 Minimal if you know Zustand      | 🟡 Slightly higher                      |

## Usage Example

### Validation Utilities (Fixes Zod Record Issue #3197)

The library now includes validation utilities that fix the issue where `z.record(z.any())` filters out `undefined` values. Our implementation preserves `undefined` values in records, matching the behavior of object validation.

```typescript
import { v } from "zstoreq";

// Object validation preserves undefined values
const objectResult = v.object({ foo: v.any() }).parse({ foo: undefined });
console.log(objectResult); // { foo: undefined }

// Record validation now ALSO preserves undefined values (fixing the Zod bug)
const recordResult = v.record(v.any()).parse({ foo: undefined });
console.log(recordResult); // { foo: undefined } (not {} like buggy Zod)

// Safe parsing with error handling
const safeResult = v.record(v.any()).safeParse({ foo: undefined, bar: "test" });
if (safeResult.success) {
  console.log(safeResult.data); // { foo: undefined, bar: "test" }
}
```

### useQueryZustand

```typescript
import React from "react";
import { useQueryZustand } from "zstoreq";

function fetchUser() {
  return fetch("/api/user").then((res) => res.json());
}

function UserComponent() {
  const { data, error, isLoading, refetch } = useQueryZustand(
    "user",
    fetchUser,
    {
      staleTime: 5000,
      retry: 2,
      onError: (err) => console.error("Failed to fetch user:", err),
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>Refetch</button>
    </div>
  );
}
```

### useMutationZustand

```typescript
import React from "react";
import { useMutationZustand } from "zstoreq";

function updateUser(data) {
  return fetch("/api/user", {
    method: "POST",
    body: JSON.stringify(data),
  }).then((res) => res.json());
}

function UpdateUserComponent() {
  const { mutate, isLoading, error } = useMutationZustand({
    mutationFn: updateUser,
    onSuccess: (data) => console.log("User updated:", data),
    onError: (err) => console.error("Failed to update user:", err),
  });

  const handleSubmit = () => {
    mutate({ name: "New Name" });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Updating..." : "Update User"}
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```
