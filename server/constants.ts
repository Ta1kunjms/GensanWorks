/**
 * Application Status Constants
 * Centralized source of truth for application workflow states
 */
export const APPLICATION_STATUS = {
  PENDING: "pending",
  REVIEWED: "reviewed",
  SHORTLISTED: "shortlisted",
  INTERVIEW: "interview",
  HIRED: "hired",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS];

/**
 * Valid state transitions for application workflow
 * Enforces business logic and prevents invalid status changes
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [APPLICATION_STATUS.PENDING]: [
    APPLICATION_STATUS.REVIEWED,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
    APPLICATION_STATUS.WITHDRAWN,
  ],
  [APPLICATION_STATUS.REVIEWED]: [
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.SHORTLISTED]: [
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
    APPLICATION_STATUS.WITHDRAWN,
  ],
  [APPLICATION_STATUS.INTERVIEW]: [
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
  ],
  // Terminal states - no transitions allowed
  [APPLICATION_STATUS.HIRED]: [],
  [APPLICATION_STATUS.REJECTED]: [],
  [APPLICATION_STATUS.WITHDRAWN]: [],
};

/**
 * Validates if a status transition is allowed
 */
export function canTransitionStatus(from: string, to: string): boolean {
  const fromStatus = from as ApplicationStatus;
  const toStatus = to as ApplicationStatus;
  
  if (!ALLOWED_STATUS_TRANSITIONS[fromStatus]) {
    return false;
  }
  
  return ALLOWED_STATUS_TRANSITIONS[fromStatus].includes(toStatus);
}

/**
 * Job Status Constants
 */
export const JOB_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  DRAFT: "draft",
  CLOSED: "closed",
  REJECTED: "rejected",
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];

/**
 * Referral Status Constants
 */
export const REFERRAL_STATUS = {
  PENDING: "Pending",
  FOR_INTERVIEW: "For Interview",
  HIRED: "Hired",
  REJECTED: "Rejected",
} as const;

export type ReferralStatus = typeof REFERRAL_STATUS[keyof typeof REFERRAL_STATUS];

/**
 * Maps application status to referral status
 */
export function mapApplicationToReferralStatus(appStatus: string): string {
  const normalized = appStatus.toLowerCase();
  
  switch (normalized) {
    case APPLICATION_STATUS.HIRED:
      return REFERRAL_STATUS.HIRED;
    case APPLICATION_STATUS.INTERVIEW:
      return REFERRAL_STATUS.FOR_INTERVIEW;
    case APPLICATION_STATUS.REJECTED:
      return REFERRAL_STATUS.REJECTED;
    case APPLICATION_STATUS.PENDING:
    case APPLICATION_STATUS.REVIEWED:
    case APPLICATION_STATUS.SHORTLISTED:
    default:
      return REFERRAL_STATUS.PENDING;
  }
}

/**
 * Maps application status to employment status
 */
export function mapApplicationToEmploymentStatus(appStatus: string): string | null {
  const normalized = appStatus.toLowerCase();
  
  switch (normalized) {
    case APPLICATION_STATUS.HIRED:
      return "Employed";
    case APPLICATION_STATUS.REJECTED:
    case APPLICATION_STATUS.WITHDRAWN:
      return "Unemployed";
    default:
      return null; // No change to employment status
  }
}
