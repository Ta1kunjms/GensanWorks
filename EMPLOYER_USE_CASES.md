# GensanWorks — Employer Use Cases

This document enumerates comprehensive use cases for the Employer actor.

Legend
- Primary Actor: Employer (HR/Recruiter)
- Secondary Actors: Jobseeker, Admin, System Services (Email/SMS), Team Members

---

## 1) Employer Registration, Verification, and Sign In
- Goal: Establish a verified employer account.
- Preconditions: Employer has corporate email and company details.
- Main Flow:
  1. Sign up with company email; provide organization details.
  2. Upload business documents (permit, TIN, DTI/SEC).
  3. Verify email; Admin/system may perform additional checks.
  4. Sign in; session created.
- Alternate Flows: Pending manual verification; re-upload documents.
- Business Rules: Document types/size validated; suspicious signups flagged.
- Postconditions: Employer is verified or pending.

## 2) Company Profile Management
- Goal: Maintain public company profile.
- Main Flow: Edit company info, logo/cover, locations, contacts, industry codes, about; manage NSRP-required fields.
- Business Rules: Changes versioned; public fields curated.

## 3) Post a Job Vacancy
- Goal: Create a compliant, attractive vacancy.
- Preconditions: Employer verified or allowed to post pending review.
- Main Flow:
  1. Enter title, description, responsibilities, qualifications, salary + period, work type, location.
  2. Add screening questions and required documents.
  3. Complete NSRP fields as required.
  4. Submit; job enters Pending Review or goes Live per policy.
- Alternate Flows: Save as draft; duplicate existing job.
- Business Rules: Content moderation rules; salary range normalization.
- Postconditions: Job created with initial status.

## 4) Manage Job Postings
- Goal: Keep vacancies up-to-date and visible.
- Main Flow: View list; edit, pause, archive; feature priority jobs; extend expiry.
- Alternate Flows: Auto-archive on expiry; reopen archived posting.
- Business Rules: Only editable while not archived; audit logging.

## 5) Candidate Search & Recommendations
- Goal: Proactively source candidates.
- Main Flow: Search applicants by skills, education, experience, location; use AI recommendations based on job.
- Alternate Flows: Save candidate searches; export result sets (if allowed).
- Business Rules: Respect applicant privacy settings; usage throttling.

## 6) Application Review & Shortlisting
- Goal: Efficiently triage applicants.
- Preconditions: Active job with inbound applications.
- Main Flow:
  1. Open job inbox; see applicants with match score and key highlights.
  2. Open application details; view resume, documents, answers.
  3. Add notes and internal tags; shortlist or reject with reason.
  4. Bulk actions (shortlist/reject) optional.
- Alternate Flows: Request missing information; escalate to team.
- Business Rules: Status transitions recorded; candidate notified on updates.

## 7) Interview Scheduling & Coordination
- Goal: Coordinate interview events smoothly.
- Main Flow: Propose slots; confirm time; auto-send calendar invites and reminders; support virtual or on-site details.
- Alternate Flows: Reschedule; cancel; timezone adjustments.
- Business Rules: Invite templates and reminders standardized.

## 8) Offers, Hiring Decision, and Onboarding Handoff
- Goal: Complete the hiring process.
- Main Flow: Issue offer (optional); mark application as Hired; capture start date and position; trigger onboarding handoff notes.
- Alternate Flows: Offer decline; counter-offer record.
- Business Rules: Only one hired per position unless multiple openings set.

## 9) Referral Slip Feedback / Outcome Reporting
- Goal: Provide PESO-required feedback for referrals.
- Main Flow: Receive/ref view; record interview attendance, outcome, hired/not hired reasons; sign-off if required.
- Alternate Flows: Reopen feedback window; attach supporting docs.
- Business Rules: NSRP and PESO tracking norms followed; immutable audit trail.

## 10) Team & Roles (Multi-user Employer)
- Goal: Collaborate within employer account.
- Main Flow: Invite teammates (HR, hiring managers); assign roles (Owner, Recruiter, Viewer); revoke access; set notifications per role.
- Business Rules: Owner can manage billing and sensitive settings; least privilege enforced.

## 11) Analytics & Reports
- Goal: Track recruiting performance.
- Main Flow: View dashboards — applicants per job, time-to-fill, source effectiveness, interview-to-offer ratios; export reports; schedule periodic summaries.
- Alternate Flows: Filter by time range/job/location.
- Business Rules: Aggregations cached; PII minimized in reports.

## 12) Notifications & Communications
- Goal: Keep stakeholders informed and communicate with applicants.
- Main Flow: Receive notifications for new applicants, messages, interview confirmations; send messages to candidates (templated or custom).
- Alternate Flows: Mute certain alerts; digest mode.
- Business Rules: Anti-spam limits; message templates curated.

---

# Cross-cutting Business Rules & NFRs
- Security: RBAC, MFA support, secure file handling; OWASP.
- Privacy: Honor applicant privacy and legal requirements.
- Audit: All status changes and postings versioned with actor/time.
- Performance: Job list/search P95 < 2s; bulk actions optimized.
- Availability: Core functions targeted at 99.9% uptime.
