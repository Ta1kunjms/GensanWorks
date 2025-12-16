import type { Applicant } from "@shared/schema";

type EmploymentLike = Partial<
  Pick<
    Applicant,
    |
      "employmentStatus"
      | "employmentStatusDetail"
      | "selfEmployedCategory"
      | "selfEmployedCategoryOther"
      | "unemployedReason"
      | "unemployedReasonOther"
      | "unemployedAbroadCountry"
  >
>;

const normalize = (value?: string | null) => value?.trim?.() ?? "";
const normalizeLower = (value?: string | null) => normalize(value).toLowerCase();

export const getEmploymentStatusLabel = (applicant?: EmploymentLike): string => {
  if (!applicant) {
    return "Not specified";
  }

  const status = normalize(applicant.employmentStatus);
  const detail = normalize(applicant.employmentStatusDetail);
  const category = normalize(applicant.selfEmployedCategory);
  const categoryOther = normalize(applicant.selfEmployedCategoryOther);
  const reason = normalize(applicant.unemployedReason);
  const reasonOther = normalize(applicant.unemployedReasonOther);
  const abroadCountry = normalize(applicant.unemployedAbroadCountry);

  if (status === "Employed") {
    if (detail === "Self-employed") {
      const categoryLabel = category === "Others" ? categoryOther || "Others" : category;
      return categoryLabel ? `Self-employed (${categoryLabel})` : "Self-employed";
    }
    return detail || "Employed";
  }

  if (status === "Unemployed") {
    if (reason === "Terminated/Laid off (abroad)" && abroadCountry) {
      return `${reason} - ${abroadCountry}`;
    }
    if (reason === "Others") {
      return reasonOther ? `Unemployed (${reasonOther})` : "Unemployed (Others)";
    }
    return reason ? `Unemployed (${reason})` : "Unemployed";
  }

  return status || "Not specified";
};

export const getEmploymentBadgeTone = (
  applicant?: EmploymentLike
): "employed" | "selfEmployed" | "unemployed" => {
  if (!applicant) {
    return "unemployed";
  }

  const status = normalizeLower(applicant.employmentStatus);
  const detail = normalizeLower(applicant.employmentStatusDetail);
  const category = normalizeLower(applicant.selfEmployedCategory);
  const reason = normalizeLower(applicant.unemployedReason);

  if (status === "unemployed" || reason) {
    return "unemployed";
  }

  if (detail === "self-employed" || category || status === "self-employed") {
    return "selfEmployed";
  }

  return "employed";
};
