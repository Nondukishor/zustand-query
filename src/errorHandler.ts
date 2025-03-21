// src/errorHandler.ts
let globalErrorHandler: ((err: any) => void) | null = null;

export function setGlobalErrorHandler(handler: (err: any) => void) {
  globalErrorHandler = handler;
}

export function handleError(err: any) {
  if (globalErrorHandler) {
    globalErrorHandler(err);
  } else {
    console.error("[zustand-query error]:", err);
  }
}
