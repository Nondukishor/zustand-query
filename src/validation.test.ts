import { describe, it, expect } from "vitest";
import { v, any, object, record } from "./validation";

describe("Validation utilities (fixing Zod issue #3197)", () => {
  describe("any validator", () => {
    it("should accept any value including undefined", () => {
      const validator = any();
      
      expect(validator.parse(undefined)).toBe(undefined);
      expect(validator.parse(null)).toBe(null);
      expect(validator.parse("string")).toBe("string");
      expect(validator.parse(42)).toBe(42);
      expect(validator.parse({ foo: "bar" })).toEqual({ foo: "bar" });
      expect(validator.parse([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("should always return success in safeParse", () => {
      const validator = any();
      
      expect(validator.safeParse(undefined)).toEqual({ success: true, data: undefined });
      expect(validator.safeParse("test")).toEqual({ success: true, data: "test" });
    });
  });

  describe("object validator", () => {
    it("should preserve undefined values in object properties", () => {
      const validator = object({ foo: any() });
      
      const result = validator.parse({ foo: undefined });
      expect(result).toEqual({ foo: undefined });
      expect(Object.prototype.hasOwnProperty.call(result, 'foo')).toBe(true);
    });

    it("should handle multiple properties with undefined values", () => {
      const validator = object({ 
        foo: any(), 
        bar: any(),
        baz: any() 
      });
      
      const input = { foo: undefined, bar: "test", baz: undefined };
      const result = validator.parse(input);
      
      expect(result).toEqual({ foo: undefined, bar: "test", baz: undefined });
      expect(Object.prototype.hasOwnProperty.call(result, 'foo')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(result, 'baz')).toBe(true);
    });

    it("should only include properties that exist in input", () => {
      const validator = object({ 
        foo: any(), 
        bar: any() 
      });
      
      const result = validator.parse({ foo: "test" });
      expect(result).toEqual({ foo: "test" });
      expect(Object.prototype.hasOwnProperty.call(result, 'bar')).toBe(false);
    });

    it("should throw error for non-object inputs", () => {
      const validator = object({ foo: any() });
      
      expect(() => validator.parse("string")).toThrow("Expected object");
      expect(() => validator.parse(null)).toThrow("Expected object");
      expect(() => validator.parse([1, 2, 3])).toThrow("Expected object");
    });
  });

  describe("record validator - the main fix for Zod issue #3197", () => {
    it("should preserve undefined values (fixing the Zod bug)", () => {
      const validator = record(any());
      
      // This is the key test case from the Zod issue
      const result = validator.parse({ foo: undefined });
      
      // Should be { foo: undefined }, not {} (empty object)
      expect(result).toEqual({ foo: undefined });
      expect(Object.prototype.hasOwnProperty.call(result, 'foo')).toBe(true);
    });

    it("should match object behavior for undefined values", () => {
      const objectValidator = object({ foo: any() });
      const recordValidator = record(any());
      
      const input = { foo: undefined };
      
      const objectResult = objectValidator.parse(input);
      const recordResult = recordValidator.parse(input);
      
      // Both should preserve the undefined value
      expect(objectResult).toEqual({ foo: undefined });
      expect(recordResult).toEqual({ foo: undefined });
      
      // Both should have the property
      expect(Object.prototype.hasOwnProperty.call(objectResult, 'foo')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(recordResult, 'foo')).toBe(true);
    });

    it("should handle mixed values including undefined", () => {
      const validator = record(any());
      
      const input = { 
        a: "string", 
        b: 42, 
        c: undefined, 
        d: null, 
        e: { nested: "object" } 
      };
      
      const result = validator.parse(input);
      
      expect(result).toEqual({
        a: "string",
        b: 42,
        c: undefined,
        d: null,
        e: { nested: "object" }
      });
      
      // All properties should be present
      expect(Object.prototype.hasOwnProperty.call(result, 'a')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(result, 'b')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(result, 'c')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(result, 'd')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(result, 'e')).toBe(true);
    });

    it("should handle empty objects", () => {
      const validator = record(any());
      const result = validator.parse({});
      expect(result).toEqual({});
    });

    it("should throw error for non-object inputs", () => {
      const validator = record(any());
      
      expect(() => validator.parse("string")).toThrow("Expected object");
      expect(() => validator.parse(null)).toThrow("Expected object");
      expect(() => validator.parse([1, 2, 3])).toThrow("Expected object");
    });

    it("should work with safeParse", () => {
      const validator = record(any());
      
      const successResult = validator.safeParse({ foo: undefined, bar: "test" });
      expect(successResult).toEqual({
        success: true,
        data: { foo: undefined, bar: "test" }
      });
      
      const errorResult = validator.safeParse("invalid");
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBe("Expected object");
    });
  });

  describe("v namespace", () => {
    it("should provide access to all validators", () => {
      expect(typeof v.any).toBe("function");
      expect(typeof v.object).toBe("function");
      expect(typeof v.record).toBe("function");
    });

    it("should replicate the exact Zod issue scenario", () => {
      // Exact test case from the GitHub issue
      const objectResult = v.object({ foo: v.any() }).parse({ foo: undefined });
      const recordResult = v.record(v.any()).parse({ foo: undefined });
      
      // Before fix: objectResult = { foo: undefined }, recordResult = {}
      // After fix: both should be { foo: undefined }
      expect(objectResult).toEqual({ foo: undefined });
      expect(recordResult).toEqual({ foo: undefined }); // This was the bug
      
      console.log("Object result:", objectResult); // { foo: undefined }
      console.log("Record result:", recordResult); // { foo: undefined } (fixed!)
    });
  });
});