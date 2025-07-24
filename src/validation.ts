// Validation utilities inspired by the Zod record issue #3197
// This implementation preserves undefined values in records, unlike the buggy Zod behavior

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Validator<T> {
  parse: (input: any) => T;
  safeParse: (input: any) => ValidationResult<T>;
}

// A validator that accepts any value (similar to z.any())
export const any = (): Validator<any> => ({
  parse: (input: any) => input,
  safeParse: (input: any) => ({ success: true, data: input }),
});

// Object validator that preserves undefined values (like z.object behavior)
export const object = <T extends Record<string, Validator<any>>>(
  shape: T
): Validator<{ [K in keyof T]: ReturnType<T[K]['parse']> }> => ({
  parse: (input: any) => {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new Error('Expected object');
    }

    const result: any = {};
    for (const key in shape) {
      if (key in input) {
        result[key] = shape[key].parse(input[key]);
      }
    }
    return result;
  },
  safeParse: (input: any) => {
    try {
      const data = object(shape).parse(input);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Record validator that preserves undefined values (fixes the Zod issue)
// This is the key fix - unlike buggy Zod behavior, this preserves undefined values
export const record = <T>(valueValidator: Validator<T>): Validator<Record<string, T>> => ({
  parse: (input: any) => {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new Error('Expected object');
    }

    const result: Record<string, T> = {};
    
    // Key fix: iterate over all own enumerable properties, including those with undefined values
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        // Parse the value, preserving undefined values
        result[key] = valueValidator.parse(input[key]);
      }
    }
    
    return result;
  },
  safeParse: (input: any) => {
    try {
      const data = record(valueValidator).parse(input);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Export the main validation functions
export const v = {
  any,
  object,
  record,
};