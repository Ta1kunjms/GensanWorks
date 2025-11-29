# GensanWorks — Jobseeker Use Cases

This document enumerates comprehensive use cases for the Jobseeker actor. The structure mirrors the Admin use cases already in the repository.

Legend
- Primary Actor: Jobseeker
- Secondary Actors: Employer, Admin, System Services (Email/SMS), External Identity Provider

---

## 1) Sign Up, Sign In, and Session
- Goal: Securely create an account and access the system.
- Primary Actor: Jobseeker
- Stakeholders: PESO Admin (data integrity), System (security)
- Preconditions: Jobseeker has a valid email/mobile.
- Triggers: Jobseeker initiates sign up or sign in.
- Main Flow:
  1. Jobseeker registers with email/mobile and password or SSO.
  2. System sends verification (email/SMS/OTP).
  3. Jobseeker verifies; session is created.
  4. On return visits, jobseeker signs in; session maintained.
- Alternate Flows:
  - A1: Forgot password → Request reset → Receive code → Set new password.
  - A2: Unverified email → Resend verification → Verify → Proceed.
  - A3: SSO failure → Fallback to email/password.
- Exceptions:
  - E1: Too many attempts → Temporary lockout.
  - E2: Invalid token/expired link → Show friendly error, regenerate.
- Business Rules:
  - BR1: Strong password policy.
  - BR2: Rate-limit auth endpoints.
  - BR3: Terminate stale sessions per policy.
- Postconditions:
  - PC1: Verified account; active session.

## 2) Profile & Resume Builder
- Goal: Maintain a complete, searchable applicant profile and resume.
- Main Flow:
  1. View/edit personal information, contact details.
  2. Add education, training, certifications, work experience.
  3. Add skills, languages, expected salary, desired roles.
  4. Upload documents (resume, IDs, licenses) with file validation.
  5. Generate system resume (PDF) from profile.
- Alternate Flows:
  - A1: Duplicate institution/experience → prompt to merge.
  - A2: Incomplete profile → show completion meter and prompts.
- Business Rules:
  - BR1: NSRP fields prioritized where applicable.
  - BR2: File types and sizes restricted.
- Postconditions: Profile stored; searchable by employers/admins per privacy settings.

## 3) Job Discovery (Search, Filters, Recommendations)
- Goal: Find relevant vacancies efficiently.
- Main Flow:
  1. Enter keywords and location.
  2. Apply filters (industry, salary, employment type, posted date).
  3. Sort results; view recommended jobs by profile fit.
  4. Save searches and enable alerts.
- Alternate Flows:
  - A1: No results → broaden filters and show close matches.
  - A2: Low-quality matches → prompt to enrich profile.
- Business Rules:
  - BR1: Search is case-insensitive and normalized.
  - BR2: Recommendation uses skills/experience overlap and location proximity.
- Postconditions: Search criteria saved (optional); recommendations cached.

## 4) View Job Details
- Goal: Understand a vacancy before applying.
- Main Flow:
  1. Open job page; system shows description, employer info, requirements, benefits, salary period, location.
  2. Display eligibility match highlights and missing requirements.
  3. Show employer rating and posting history (when enabled).
- Alternate Flows: Posting archived or expired → show banner and disable Apply.
- Postconditions: Jobseeker can proceed to Apply or Save.

## 5) Apply to Job
- Goal: Submit a complete application.
- Preconditions: Logged in; job is open.
- Main Flow:
  1. Click Apply; confirm profile/resume selection.
  2. Answer pre-screening questions (if any).
  3. Attach required documents; acknowledge privacy consent.
  4. Submit; system records application and sends notifications.
- Alternate Flows:
  - A1: Missing required fields/docs → validation prompts.
  - A2: Duplicate application → offer update/withdraw options.
- Business Rules:
  - BR1: One active application per job unless explicitly allowed.
  - BR2: Application timestamp is immutable; version history kept.
- Postconditions: Application moves to "Submitted"; visible in tracker.

## 6) Application Tracking
- Goal: Monitor progress and manage applications.
- Main Flow:
  1. See list with statuses (Submitted, Under Review, Interview, Offered, Hired, Rejected, Withdrawn).
  2. Open timeline; view notes, attachments, and referral status.
  3. Withdraw application or update contact preferences.
- Alternate Flows: Employer message triggers in-app and email notifications.
- Business Rules:
  - BR1: Status changes recorded with actor and timestamp.
- Postconditions: Tracker reflects latest status.

## 7) Referrals (Request, Print, Track)
- Goal: Obtain and manage PESO referral slips.
- Main Flow:
  1. Request referral for a selected job.
  2. System generates slip number and PDF.
  3. Jobseeker prints/downloads; tracks follow-up schedule.
- Alternate Flows: Appointment reschedule; slip reprint.
- Business Rules:
  - BR1: Referral IDs are unique and traceable.
- Postconditions: Referral recorded and linked to application/job.

## 8) Interview Scheduling
- Goal: Coordinate interview slots with employers.
- Main Flow:
  1. Receive invite; propose/confirm slots.
  2. System sends calendar-compatible invites; reminders sent automatically.
- Alternate Flows: Decline or request reschedule; timezone handling.
- Postconditions: Confirmed slot stored; reminders scheduled.

## 9) Messaging & Notifications
- Goal: Communicate reliably with employers and receive updates.
- Main Flow: In-app inbox; push/email/SMS notifications for status changes, messages, interviews, referrals.
- Business Rules: Opt-in/out preferences respected; rate limiting on outbound.

## 10) Saved Jobs & Alerts
- Goal: Keep track of opportunities and get alerted.
- Main Flow: Save/unsave jobs; set frequency for alerts (daily/weekly); manage saved searches.
- Postconditions: Alerts delivered per schedule.

## 11) Account & Security
- Goal: Manage credentials and sessions.
- Main Flow: Change password, enable 2FA (if available), manage sessions/devices, delete account (with grace period).
- Business Rules: Critical changes require re-authentication.

## 12) Privacy & Consents
- Goal: Control data usage.
- Main Flow: Review/accept consents (e.g., data sharing with employers); export/download personal data; request deletion.
- Business Rules: Audit log for consent changes; legal retention exceptions.

---

# Quality Attributes & Non-Functional
- Accessibility (WCAG), Reliability (99.9% for key flows), Security (OWASP), Performance (search < 2s on P95), Auditability (status changes).
