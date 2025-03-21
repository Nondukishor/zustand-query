⚡ Performance & Feature Comparison

| Feature                   | zustand-query (Your Package)        | react-query                             |
| ------------------------- | ----------------------------------- | --------------------------------------- |
| 🔄 State management       | Zustand (global, reactive store)    | Internal React context + caching        |
| 🧠 Data cache             | In-memory with manual invalidation  | In-memory, automated, smart GC          |
| 🕒 Stale time support     | ✅ (manual staleTime support)       | ✅ (automated + configurable)           |
| 🔁 Retries on failure     | ❌ (manual retry if needed)         | ✅ (configurable, exponential backoff)  |
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
