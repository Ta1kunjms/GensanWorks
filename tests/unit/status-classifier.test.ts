import { describe, it, expect } from "@jest/globals";
import { classifyEmploymentStatus } from "../../server/storage";

describe("classifyEmploymentStatus", () => {
  it("detects employed", () => {
    expect(classifyEmploymentStatus("Currently working full time")).toBe("employed");
  });
  it("detects self-employed", () => {
    expect(classifyEmploymentStatus("Self employed carpenter")).toBe("selfEmployed");
  });
  it("detects unemployed", () => {
    expect(classifyEmploymentStatus("Unemployed, no work")).toBe("unemployed");
  });
  it("detects new entrant", () => {
    expect(classifyEmploymentStatus("fresh graduate")).toBe("newEntrant");
  });
});
