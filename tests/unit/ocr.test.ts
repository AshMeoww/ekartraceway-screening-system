import { describe, expect, it } from "vitest";
import {
  isSupportedImageCv,
  MIN_DIRECT_TEXT_CHARACTERS,
  needsOcrFallback,
} from "@/lib/ocr";

describe("ocr helpers", () => {
  it("detects when direct extraction needs OCR fallback", () => {
    expect(needsOcrFallback("short")).toBe(true);
    expect(needsOcrFallback("x".repeat(MIN_DIRECT_TEXT_CHARACTERS))).toBe(false);
  });

  it("accepts common image CV formats", () => {
    expect(isSupportedImageCv("resume.png", "image/png")).toBe(true);
    expect(isSupportedImageCv("resume.tiff")).toBe(true);
    expect(isSupportedImageCv("resume.txt", "text/plain")).toBe(false);
  });
});

