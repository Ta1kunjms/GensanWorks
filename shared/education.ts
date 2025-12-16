export const EDUCATION_LEVEL_OPTIONS = [
  "Elementary",
  "Secondary",
  "High School (K-12)",
  "Senior High School",
  "Vocational/Technical",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "No specific requirement",
] as const;

export type EducationLevelOption = (typeof EDUCATION_LEVEL_OPTIONS)[number];

const normalizedOptionMap: Record<string, EducationLevelOption> = Object.fromEntries(
  EDUCATION_LEVEL_OPTIONS.map((opt) => [opt.toLowerCase(), opt])
) as Record<string, EducationLevelOption>;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Maps legacy / free-form education values to the canonical dropdown vocabulary.
 * Returns null when the value is missing/unknown.
 */
export function normalizeEducationLevel(raw: unknown): EducationLevelOption | null {
  if (typeof raw !== "string") return null;

  const value = normalizeWhitespace(raw);
  if (!value) return null;

  const direct = normalizedOptionMap[value.toLowerCase()];
  if (direct) return direct;

  const lower = value.toLowerCase();

  // Common legacy values used around the app/DB.
  if (lower === "secondary (k-12)" || lower === "k-12" || lower === "secondary k-12") {
    return "High School (K-12)";
  }

  if (lower === "tertiary") {
    return "Bachelor's Degree";
  }

  if (lower === "graduate" || lower === "graduate studies" || lower === "post graduate" || lower === "postgraduate") {
    return "Master's Degree";
  }

  if (lower === "high school" || lower === "secondary") {
    // Preserve "Secondary" if explicitly provided; otherwise treat "High School" as K-12.
    return lower === "secondary" ? "Secondary" : "High School (K-12)";
  }

  if (lower === "vocational" || lower === "technical" || lower.includes("tesda")) {
    return "Vocational/Technical";
  }

  if (lower === "college") {
    return "Bachelor's Degree";
  }

  if (lower === "bachelor" || lower.includes("bachelor")) {
    return "Bachelor's Degree";
  }

  if (lower === "master" || lower.includes("master")) {
    return "Master's Degree";
  }

  if (lower === "doctorate" || lower.includes("phd") || lower.includes("doctor")) {
    // No doctorate option in the target dropdown; treat as meeting Master's.
    return "Master's Degree";
  }

  if (lower.includes("senior high")) {
    return "Senior High School";
  }

  if (lower.includes("associate")) {
    return "Associate Degree";
  }

  // NSRP-style entries like "College Graduate" / "College Undergraduate".
  if (lower.includes("college")) {
    if (lower.includes("undergraduate") || lower.includes("under grad") || lower.includes("under-grad")) {
      return "Associate Degree";
    }
    return "Bachelor's Degree";
  }

  if (lower.includes("elementary")) {
    return "Elementary";
  }

  if (lower.includes("high school") || lower.includes("secondary")) {
    return "High School (K-12)";
  }

  return null;
}

export function educationLevelRank(level: unknown): number | null {
  const normalized = normalizeEducationLevel(level);
  if (!normalized) return null;

  switch (normalized) {
    case "No specific requirement":
      return 0;
    case "Elementary":
      return 1;
    case "Secondary":
      return 2;
    case "High School (K-12)":
      return 3;
    case "Senior High School":
      return 4;
    case "Vocational/Technical":
      return 5;
    case "Associate Degree":
      return 6;
    case "Bachelor's Degree":
      return 7;
    case "Master's Degree":
      return 8;
    default:
      return null;
  }
}

export function isNoSpecificEducationRequirement(level: unknown): boolean {
  return normalizeEducationLevel(level) === "No specific requirement";
}
