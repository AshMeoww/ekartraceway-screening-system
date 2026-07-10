import { describe, expect, it } from "vitest";
import { canTransitionStatus } from "@/lib/status";

describe("status transitions", () => {
  it("allows normal screening progression", () => {
    expect(canTransitionStatus("submitted", "screening")).toBe(true);
    expect(canTransitionStatus("screening", "shortlisted")).toBe(true);
  });

  it("blocks invalid terminal moves", () => {
    expect(canTransitionStatus("hired", "rejected")).toBe(false);
  });
});
