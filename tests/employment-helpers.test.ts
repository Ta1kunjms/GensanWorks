import { describe, it, expect } from "@jest/globals";
import { getEmploymentStatusLabel, getEmploymentBadgeTone } from "@/lib/employment";

const baseApplicant = {
  employmentStatus: "Employed",
} as const;

describe("employment helpers", () => {
  it("derives labels for wage and self-employed branches", () => {
    expect(
      getEmploymentStatusLabel({
        ...baseApplicant,
        employmentStatusDetail: "Wage employed",
      })
    ).toBe("Wage employed");

    expect(
      getEmploymentStatusLabel({
        ...baseApplicant,
        employmentStatusDetail: "Self-employed",
      })
    ).toBe("Self-employed");
  });

  it("includes custom self-employed category when provided", () => {
    const label = getEmploymentStatusLabel({
      ...baseApplicant,
      employmentStatusDetail: "Self-employed",
      selfEmployedCategory: "Others",
      selfEmployedCategoryOther: "Sari-sari store",
    });

    expect(label).toBe("Self-employed (Sari-sari store)");
  });

  it("shows unemployed reason details and abroad country when available", () => {
    const abroadReason = getEmploymentStatusLabel({
      employmentStatus: "Unemployed",
      unemployedReason: "Terminated/Laid off (abroad)",
      unemployedAbroadCountry: "Qatar",
    });
    expect(abroadReason).toBe("Terminated/Laid off (abroad) - Qatar");

    const otherReason = getEmploymentStatusLabel({
      employmentStatus: "Unemployed",
      unemployedReason: "Others",
      unemployedReasonOther: "Health condition",
    });
    expect(otherReason).toBe("Unemployed (Health condition)");
  });

  it("falls back gracefully when applicant info is missing", () => {
    expect(getEmploymentStatusLabel(undefined)).toBe("Not specified");
    expect(getEmploymentBadgeTone(undefined)).toBe("unemployed");
  });

  it("maps tones for unemployed and self-employed cases", () => {
    expect(
      getEmploymentBadgeTone({
        employmentStatus: "Unemployed",
        unemployedReason: "Finished Contract",
      })
    ).toBe("unemployed");

    expect(
      getEmploymentBadgeTone({
        employmentStatus: "Employed",
        employmentStatusDetail: "Self-employed",
      })
    ).toBe("selfEmployed");

    expect(
      getEmploymentBadgeTone({
        employmentStatus: "Employed",
        employmentStatusDetail: "Wage employed",
      })
    ).toBe("employed");
  });
});
