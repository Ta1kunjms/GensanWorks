# GensanWorks Admin Use Cases

## Document Overview
This document provides comprehensive use cases for the Admin role in the GensanWorks system. It covers all administrative functions including user management, job posting management, applicant tracking, employer management, analytics, and system configuration.

---

## PART 1/3: AUTHENTICATION & USER MANAGEMENT

### Use Case 1: Admin Authentication

**Actor:** Admin User

**Preconditions:**
- Admin account exists in the system
- Admin has valid credentials (email and password)

**Main Flow:**
1. Admin navigates to the login page (`/login`)
2. System displays login form
3. Admin enters email address and password
4. Admin clicks "Sign In" button
5. System validates credentials against the database
6. System checks user role is "admin"
7. System creates session and sets authentication cookie
8. System redirects admin to dashboard (`/admin/dashboard`)
9. Admin sees the main dashboard with sidebar navigation

**Alternative Flows:**

**A1: Invalid Credentials**
- At step 5, if credentials are invalid:
  - System displays error message "Invalid email or password"
  - Admin remains on login page
  - Admin can retry with correct credentials

**A2: Non-Admin User Attempts Admin Access**
- At step 6, if user role is not "admin":
  - System denies access
  - System redirects to appropriate user role page (jobseeker/employer)

**A3: Session Timeout**
- If admin session expires during use:
  - System redirects to login page
  - System displays message "Session expired. Please login again"
  - Admin must re-authenticate

**Postconditions:**
- Admin is authenticated and has active session
- Admin has access to all admin features
- Session is stored in database and browser cookie

**Business Rules:**
- Admin accounts must be created manually via database script
- Passwords must be hashed using bcrypt
- Sessions expire after configured timeout period
- Only one active session per admin is allowed

---

### Use Case 2: View Dashboard Summary

**Actor:** Admin User

**Preconditions:**
- Admin is authenticated and logged in
- System has applicant, employer, and job posting data

**Main Flow:**
1. Admin lands on dashboard after login or clicks "Dashboard" in sidebar
2. System queries database for summary statistics
3. System displays key metrics:
   - Total number of applicants
   - Total number of employers
   - Total number of job postings
   - Number of active job postings
   - Recent applications count (last 30 days)
   - Recent registrations count (last 7 days)
4. System displays recent activity feed:
   - Latest applicant registrations
   - Latest employer registrations
   - Latest job postings
   - Recent job applications
5. System displays charts and visualizations:
   - Employment status distribution chart
   - Applications over time (line chart)
   - Job postings by industry (bar chart)
   - Referral status breakdown (pie chart)
6. Admin views summary cards with quick stats
7. Admin can click on cards to navigate to detailed pages

**Alternative Flows:**

**A1: No Data Available**
- At step 2, if database is empty:
  - System displays "No data available" message
  - System suggests running seed script or waiting for registrations

**A2: Data Loading Error**
- If database query fails:
  - System displays error notification
  - System shows cached data if available
  - Admin can refresh to retry

**Postconditions:**
- Admin has overview of system status
- All statistics are current and accurate
- Charts render correctly with real-time data

**Business Rules:**
- Dashboard refreshes automatically every 5 minutes
- Statistics are calculated in real-time from database
- Archived/deleted records are excluded from counts
- Date ranges for "recent" activities are configurable

---

### Use Case 3: Manage Applicant Accounts

**Actor:** Admin User

**Preconditions:**
- Admin is authenticated
- Applicant records exist in database

**Main Flow:**
1. Admin clicks "Applicants" in sidebar navigation
2. System displays applicants list page
3. System shows table with columns:
   - Full Name
   - Email
   - Phone Number
   - Employment Status
   - Registration Date
   - Actions (View, Edit, Delete)
4. System displays pagination controls (10, 25, 50, 100 per page)
5. System provides search functionality (by name, email, phone)
6. System provides filter options:
   - Employment Status (Employed, Unemployed, Self-Employed, etc.)
   - Date Range (registration date)
   - Educational Attainment
   - Civil Status
7. Admin views list of all applicants with applied filters
8. System displays total count of applicants matching criteria

**Sub Use Case 3.1: View Applicant Details**
1. Admin clicks "View" icon on applicant row
2. System opens applicant detail page
3. System displays complete applicant profile:
   - Personal Information (name, age, gender, civil status)
   - Contact Information (email, phone, address)
   - Educational Background (highest level, course, year graduated)
   - Employment Information (status, actively looking for work)
   - Work Preferences (preferred occupation, location)
   - Skills and Qualifications
   - Work Experience History
   - Application History (jobs applied to)
   - Referral History (employers referred to)
   - NSRP Registration Status
4. Admin can navigate back to list or edit from detail view

**Sub Use Case 3.2: Edit Applicant Information**
1. Admin clicks "Edit" icon on applicant row or from detail page
2. System opens edit modal/form with current data pre-filled
3. Admin modifies allowed fields:
   - Contact information
   - Employment status
   - Educational background
   - Skills
   - Work preferences
   - Verification status
4. Admin clicks "Save Changes" button
5. System validates input data against schema
6. System updates applicant record in database
7. System displays success notification
8. System refreshes applicant list with updated data

**Sub Use Case 3.3: Delete Applicant Account**
1. Admin clicks "Delete" icon on applicant row
2. System displays confirmation dialog:
   - "Are you sure you want to delete this applicant?"
   - Warning about permanent deletion
   - Option to archive instead of delete
3. Admin confirms deletion
4. System performs soft delete (sets archived flag) or hard delete
5. System removes applicant from active list
6. System displays success notification
7. System logs deletion action with admin ID and timestamp

**Sub Use Case 3.4: Add New Applicant Manually**
1. Admin clicks "Add Applicant" button
2. System opens new applicant form modal
3. Admin fills in required fields:
   - Full Name (required)
   - Email (required, must be unique)
   - Phone Number (required)
   - Employment Status (required)
   - Date of Birth
   - Gender
   - Address
4. Admin fills in optional fields (education, skills, preferences)
5. Admin clicks "Create Applicant" button
6. System validates all input data
7. System checks email uniqueness
8. System creates new applicant record with auto-generated ID
9. System sends welcome email to applicant (optional)
10. System displays success notification
11. System adds new applicant to list

**Sub Use Case 3.5: Export Applicant Data**
1. Admin clicks "Export" button above applicant list
2. System displays export options:
   - Export Format (CSV, Excel, PDF)
   - Fields to Include (select/deselect columns)
   - Filter Options (export all or filtered results)
3. Admin selects preferences and confirms
4. System generates export file with selected data
5. System triggers browser download
6. Admin saves file to local computer

**Sub Use Case 3.6: Bulk Import Applicants**
1. Admin clicks "Import" button
2. System displays import dialog with file upload
3. Admin selects CSV or Excel file from computer
4. System validates file format and headers
5. System previews data to be imported (first 10 rows)
6. Admin reviews and confirms import
7. System processes each row:
   - Validates data against schema
   - Checks for duplicate emails
   - Creates applicant records
   - Logs errors for invalid rows
8. System displays import summary:
   - Total rows processed
   - Successful imports
   - Failed imports with reasons
9. System provides error report download for failed imports

**Alternative Flows:**

**A1: Search Returns No Results**
- At step 7, if no applicants match search criteria:
  - System displays "No applicants found" message
  - System suggests clearing filters or search term

**A2: Validation Error on Edit**
- At step 5 of Sub Use Case 3.2:
  - System displays field-specific error messages
  - Admin must correct errors before saving
  - System highlights invalid fields in red

**A3: Email Conflict on Creation**
- At step 7 of Sub Use Case 3.4:
  - System detects duplicate email address
  - System displays error "Email already registered"
  - Admin must use different email or update existing record

**A4: Confirmation Cancel**
- At step 3 of Sub Use Case 3.3:
  - Admin clicks "Cancel" button
  - System closes dialog without deleting
  - No changes are made to database

**Postconditions:**
- Applicant data is accurate and up-to-date
- All changes are logged in audit trail
- Applicant list reflects current system state
- Exported data matches database records

**Business Rules:**
- Only admins can delete applicant accounts
- Email addresses must be unique across all users
- Soft delete is preferred to maintain referential integrity
- Changes to applicant data are logged with timestamp and admin ID
- Applicants cannot be deleted if they have active applications
- Exported data must exclude sensitive information like passwords
- Bulk imports must validate all data before committing any records

---

### Use Case 4: Manage Employer Accounts

**Actor:** Admin User

**Preconditions:**
- Admin is authenticated
- Employer records exist in database

**Main Flow:**
1. Admin clicks "Employers" in sidebar navigation
2. System displays employers list page
3. System shows table with columns:
   - Company Name
   - Contact Person
   - Email
   - Phone Number
   - Industry
   - Total Job Postings
   - Active Postings
   - Registration Date
   - Verification Status
   - Actions (View, Edit, Verify, Delete)
4. System displays pagination and filtering controls
5. System provides search functionality (by company name, email, contact person)
6. System provides filter options:
   - Industry Sector
   - Verification Status (Verified, Pending, Rejected)
   - Registration Date Range
   - Number of Active Postings
7. Admin views list of all employers with applied filters

**Sub Use Case 4.1: View Employer Profile**
1. Admin clicks "View" icon on employer row
2. System opens employer detail page
3. System displays complete employer profile:
   - Company Information (name, industry, size, establishment date)
   - Contact Information (email, phone, address, website)
   - Contact Person Details
   - Verification Status and Documents
   - Business Permit/Registration Number
   - All Job Postings (active and archived)
   - Applicant Referrals Received
   - Hiring Statistics (hired count, pending applications)
   - Account Activity History
4. Admin can view documents uploaded for verification
5. Admin can navigate to related job postings

**Sub Use Case 4.2: Verify Employer Account**
1. Admin views employer with "Pending" verification status
2. Admin clicks "Verify" button on employer row or detail page
3. System displays verification dialog with:
   - Submitted documents preview
   - Business permit/license information
   - Company registration details
   - Verification checklist
4. Admin reviews all submitted information
5. Admin selects verification action:
   - Approve (set status to "Verified")
   - Reject (set status to "Rejected" with reason)
   - Request More Information
6. If rejecting, admin enters rejection reason/feedback
7. Admin clicks "Submit Verification" button
8. System updates employer verification status
9. System sends notification email to employer
10. System logs verification action with admin ID
11. System displays confirmation message

**Sub Use Case 4.3: Edit Employer Information**
1. Admin clicks "Edit" icon on employer row
2. System opens edit modal with current data
3. Admin modifies allowed fields:
   - Company name
   - Contact information
   - Industry classification
   - Company size
   - Verification status
   - Account status (active/suspended)
4. Admin clicks "Save Changes" button
5. System validates input data
6. System updates employer record in database
7. System displays success notification
8. System refreshes employer list

**Sub Use Case 4.4: Suspend/Unsuspend Employer Account**
1. Admin identifies employer violating terms or requiring suspension
2. Admin clicks "Suspend" action on employer row
3. System displays suspension dialog:
   - Reason for suspension (required)
   - Suspension duration (temporary/permanent)
   - Notification message to employer
4. Admin fills in suspension details
5. Admin confirms suspension
6. System sets employer account status to "suspended"
7. System deactivates all active job postings
8. System sends suspension notification to employer
9. System displays all suspended employers with special indicator
10. Admin can later unsuspend by clicking "Activate" action

**Sub Use Case 4.5: Delete Employer Account**
1. Admin clicks "Delete" icon on employer row
2. System displays confirmation dialog with warnings:
   - "Delete employer and all associated job postings?"
   - List of active job postings to be affected
   - Number of applicants with applications to this employer
3. Admin confirms deletion
4. System performs cascading soft delete:
   - Marks employer as archived
   - Archives all job postings
   - Updates application statuses
   - Preserves data for referential integrity
5. System displays success notification
6. System removes employer from active list

**Sub Use Case 4.6: Add New Employer Manually**
1. Admin clicks "Add Employer" button
2. System opens new employer form
3. Admin fills in required fields:
   - Company Name (required)
   - Email (required, unique)
   - Contact Person Name
   - Phone Number
   - Industry
   - Address
4. Admin sets verification status (can pre-verify)
5. Admin clicks "Create Employer" button
6. System validates input data
7. System creates employer record with generated password
8. System sends welcome email with login credentials
9. System displays success notification

**Sub Use Case 4.7: View Employer Activity Log**
1. Admin opens employer detail page
2. Admin clicks "Activity Log" tab
3. System displays chronological activity history:
   - Login timestamps
   - Job postings created
   - Job postings modified
   - Applications received
   - Applicant interactions
   - Profile updates
4. Admin can filter by activity type and date range

**Alternative Flows:**

**A1: Verification Documents Missing**
- At step 4 of Sub Use Case 4.2:
  - System shows "Documents not uploaded" warning
  - Admin can request documents via system message
  - Verification cannot be completed until documents provided

**A2: Cannot Delete Employer with Active Applications**
- At step 3 of Sub Use Case 4.5:
  - System checks for pending applications
  - System displays warning if applications exist
  - System recommends suspending instead of deleting
  - Admin must close all applications before deletion allowed

**A3: Email Already Exists**
- At step 6 of Sub Use Case 4.6:
  - System detects duplicate email
  - System displays error "Email already registered"
  - Admin must use different email or update existing record

**Postconditions:**
- Employer data is accurate and current
- Verification statuses are properly maintained
- All employer actions are logged
- Suspended employers cannot post jobs or access system
- Employers receive appropriate notifications for status changes

**Business Rules:**
- Only verified employers can post job vacancies
- Employer verification requires business permit/registration
- Suspended employers retain data but lose access
- Deletion is soft delete to preserve application history
- Verification/rejection reasons must be documented
- Admins must review verification within 48 hours of submission
- Employers cannot be deleted if they have active job postings
- System maintains complete audit trail of employer account changes

---

## PART 1/3 END

---

## PART 2/3: JOB POSTING & APPLICATION MANAGEMENT

### Use Case 5: Manage Job Postings

**Actor:** Admin User

**Preconditions:**
- Admin is authenticated
- Job posting records exist in database
- Employers have created job postings

**Main Flow:**
1. Admin clicks "Job Postings" in sidebar navigation
2. System displays job postings list page
3. System shows table with columns:
   - Job Title
   - Company Name (Employer)
   - Industry
   - Location
   - Salary Range
   - Posted Date
   - Expiry Date
   - Status (Active, Expired, Archived, Pending)
   - Number of Applicants
   - Actions (View, Edit, Archive, Delete, Feature)
4. System displays pagination controls
5. System provides search functionality (by job title, company, location)
6. System provides filter options:
   - Status (Active, Expired, Archived, Pending Approval)
   - Industry Sector
   - Employment Type (Full-time, Part-time, Contract, Freelance)
   - Salary Range
   - Posted Date Range
   - Location/Region
   - With/Without Applications
7. Admin views list of all job postings with applied filters
8. System displays total count and status breakdown

**Sub Use Case 5.1: View Job Posting Details**
1. Admin clicks "View" icon on job posting row
2. System opens job posting detail page
3. System displays complete job information:
   - Job Title and Description
   - Company Information (linked to employer)
   - Required Qualifications and Skills
   - Job Responsibilities
   - Employment Type and Work Schedule
   - Salary Range and Benefits
   - Location and Work Arrangement (onsite/remote/hybrid)
   - Application Deadline
   - Posted Date and Last Modified Date
   - Status and Visibility
   - Special Requirements (if any)
4. System displays application statistics:
   - Total Applications Received
   - Applications by Status (pending, reviewed, shortlisted, rejected, hired)
   - List of Applicants (with links to profiles)
5. System shows admin-specific options:
   - Approval status (if pending review)
   - Featured/Promoted status
   - SEO/visibility settings
6. Admin can navigate to related employer profile or applicant list

**Sub Use Case 5.2: Edit Job Posting**
1. Admin clicks "Edit" icon on job posting row or from detail page
2. System opens job posting edit form with current data
3. Admin can modify fields:
   - Job title and description
   - Qualifications and requirements
   - Salary range
   - Employment type
   - Location
   - Application deadline
   - Status (Active, Paused, Expired)
   - Visibility (Public, Hidden)
   - Featured status
4. Admin clicks "Save Changes" button
5. System validates input data against schema
6. System updates job posting record in database
7. System logs modification with admin ID and timestamp
8. System sends notification to employer about changes (optional)
9. System displays success notification
10. System refreshes job posting list

**Sub Use Case 5.3: Approve Pending Job Posting**
1. Admin views job posting with "Pending" status
2. Admin clicks "Review" button
3. System displays approval dialog with full job details
4. Admin reviews posting for:
   - Compliance with posting guidelines
   - Appropriate content (no discriminatory language)
   - Valid contact information
   - Reasonable requirements and compensation
   - Employer verification status
5. Admin selects action:
   - Approve (change status to "Active")
   - Reject (change status to "Rejected" with reason)
   - Request Modifications (send back to employer with feedback)
6. If rejecting or requesting changes, admin enters detailed reason
7. Admin clicks "Submit Review" button
8. System updates job posting status
9. System sends email notification to employer
10. System logs approval action
11. If approved, job posting becomes visible to applicants

**Sub Use Case 5.4: Archive Job Posting**
1. Admin identifies job posting to archive (filled position, expired, etc.)
2. Admin clicks "Archive" icon on job posting row
3. System displays confirmation dialog:
   - "Archive this job posting?"
   - Reason for archiving (dropdown: Position Filled, Expired, Employer Request, Policy Violation)
   - Option to notify pending applicants
4. Admin selects reason and confirms
5. System sets job posting status to "Archived"
6. System hides posting from public job listings
7. System optionally sends notification to applicants with pending applications
8. System maintains posting data for historical records
9. System displays success notification
10. Admin can view archived postings in separate archive section

**Sub Use Case 5.5: Delete Job Posting**
1. Admin clicks "Delete" icon on job posting row
2. System displays warning confirmation dialog:
   - "Permanently delete this job posting?"
   - Shows number of applications that will be affected
   - Warning about data loss
   - Recommendation to archive instead
3. Admin confirms deletion
4. System performs soft delete or hard delete based on configuration
5. System updates related application records (mark as "job deleted")
6. System removes posting from all lists
7. System logs deletion action
8. System displays success notification

**Sub Use Case 5.6: Feature/Promote Job Posting**
1. Admin identifies job posting to feature (high demand, priority employer, etc.)
2. Admin clicks "Feature" button on job posting
3. System displays feature settings dialog:
   - Feature duration (days)
   - Featured position (top, sidebar, homepage)
   - Boost visibility score
   - Additional promotion options
4. Admin configures feature settings
5. Admin clicks "Apply Feature" button
6. System sets featured flag and metadata
7. System prioritizes posting in search results and job listings
8. System displays featured badge on posting
9. System tracks feature performance metrics

**Sub Use Case 5.7: Bulk Job Posting Actions**
1. Admin selects multiple job postings using checkboxes
2. Admin clicks "Bulk Actions" dropdown
3. System displays available bulk operations:
   - Archive Selected
   - Delete Selected
   - Change Status (Active/Paused)
   - Export Selected
   - Assign to Category
4. Admin selects action and confirms
5. System processes each selected posting
6. System displays progress indicator
7. System shows summary of successful and failed operations
8. System logs all bulk actions

**Sub Use Case 5.8: View Job Posting Analytics**
1. Admin clicks "Analytics" tab on job posting detail page
2. System displays posting performance metrics:
   - Total Views (impressions)
   - Click-through Rate
   - Application Conversion Rate
   - Time to First Application
   - Average Time to Fill
   - Demographics of Applicants (age, location, education)
   - Traffic Sources (search, direct, referral)
3. System displays charts and graphs:
   - Views over time (line chart)
   - Application funnel (conversion funnel)
   - Applicant quality score distribution
4. Admin can export analytics report as PDF or CSV

**Alternative Flows:**

**A1: Job Posting Violates Guidelines**
- At step 4 of Sub Use Case 5.3:
  - Admin identifies policy violation
  - Admin rejects posting with detailed violation explanation
  - System flags employer for review if repeated violations

**A2: Cannot Delete Job with Active Applications**
- At step 3 of Sub Use Case 5.5:
  - System detects active/pending applications
  - System displays stronger warning
  - System requires admin to resolve applications first or force delete with reason

**A3: Employer Account Suspended**
- When editing job from suspended employer:
  - System displays warning "Employer account suspended"
  - Admin can still edit but posting remains inactive
  - System prevents posting from going live until employer reactivated

**Postconditions:**
- Job posting data is accurate and current
- All changes are logged with admin identity
- Applicants see current, approved job listings
- Employers receive notifications of admin actions
- Featured postings display prominently

**Business Rules:**
- Only approved job postings are visible to applicants
- Admin approval required for first-time employer postings
- Job postings automatically expire after deadline date
- Archived postings can be restored within 90 days
- Featured postings are limited to configured maximum
- Deleted postings with applications use soft delete
- Job modifications by admin are logged and auditable
- Salary information must be within reasonable ranges
- Discriminatory language triggers automatic flagging for review

---

### Use Case 6: Manage Job Applications

**Actor:** Admin User

**Preconditions:**
- Admin is authenticated
- Applicants have submitted applications to job postings
- Job postings and applicant records exist

**Main Flow:**
1. Admin clicks "Applications" in sidebar navigation
2. System displays applications list page
3. System shows table with columns:
   - Applicant Name (linked to profile)
   - Job Title (linked to posting)
   - Company Name (linked to employer)
   - Applied Date
   - Application Status (Applied, Reviewed, Shortlisted, Interview, Offer, Hired, Rejected, Withdrawn)
   - Match Score (AI-generated compatibility)
   - Resume/CV (download link)
   - Actions (View, Update Status, Delete, Match Score)
4. System displays pagination and filtering
5. System provides search functionality (applicant name, job title, company)
6. System provides filter options:
   - Application Status
   - Date Range (applied date)
   - Job Industry
   - Employer
   - Match Score Range (High, Medium, Low)
7. Admin views list of all applications with filters applied
8. System displays statistics dashboard above table:
   - Total Applications
   - By Status breakdown
   - Average match score
   - Conversion rates

**Sub Use Case 6.1: View Application Details**
1. Admin clicks "View" icon on application row
2. System opens application detail page in modal or new page
3. System displays comprehensive application information:
   - Applicant profile summary (with link to full profile)
   - Job posting summary (with link to full posting)
   - Application date and timestamp
   - Current status and status history
   - Cover letter / Application message
   - Resume/CV viewer or download link
   - AI match score with breakdown:
     * Skills match percentage
     * Experience match percentage
     * Education match percentage
     * Overall compatibility score
   - Application timeline (status changes, views, actions)
   - Notes added by employer or admin
   - Communication history (if any)
4. Admin can download all application documents
5. Admin can view side-by-side comparison of applicant qualifications vs job requirements

**Sub Use Case 6.2: Update Application Status**
1. Admin clicks "Update Status" icon on application row
2. System displays status update dialog with current status highlighted
3. System shows available status transitions:
   - Applied → Reviewed
   - Reviewed → Shortlisted / Rejected
   - Shortlisted → Interview Scheduled
   - Interview Scheduled → Offer Extended / Rejected
   - Offer Extended → Hired / Rejected
   - Any → Withdrawn (by applicant)
4. Admin selects new status from dropdown
5. Admin optionally adds notes/reason for status change
6. Admin indicates if notification should be sent to applicant
7. Admin clicks "Update Status" button
8. System validates status transition
9. System updates application record with new status
10. System logs status change with admin ID and timestamp
11. System sends notification email to applicant (if selected)
12. System updates application statistics
13. System displays success notification

**Sub Use Case 6.3: Bulk Status Update**
1. Admin filters applications by specific criteria (e.g., all "Applied" status for specific job)
2. Admin selects multiple applications using checkboxes
3. Admin clicks "Bulk Update Status" button
4. System displays bulk update dialog:
   - Number of applications selected
   - Current statuses (if mixed)
   - New status dropdown
   - Optional notes
   - Notification preference (notify all, notify none)
5. Admin configures bulk update and confirms
6. System processes each application:
   - Updates status
   - Logs change
   - Sends notifications (if enabled)
7. System displays progress indicator
8. System shows summary report:
   - Successfully updated count
   - Failed updates (with reasons)
   - Notification delivery status
9. System refreshes application list

**Sub Use Case 6.4: View Application Match Score Details**
1. Admin clicks "Match Score" icon on application row
2. System displays AI match analysis dialog
3. System shows detailed scoring breakdown:
   - **Skills Match (40%):**
     * Required skills present: X/Y
     * Preferred skills present: X/Y
     * Matching skills list
     * Missing skills list
   - **Experience Match (30%):**
     * Years of experience: Required vs Actual
     * Industry experience match
     * Relevant position experience
   - **Education Match (20%):**
     * Education level: Required vs Actual
     * Field of study relevance
     * Additional certifications
   - **Other Factors (10%):**
     * Location proximity
     * Salary expectation alignment
     * Availability match
4. System displays overall compatibility score (0-100)
5. System provides AI-generated recommendation:
   - "Highly Recommended" (80-100)
   - "Good Match" (60-79)
   - "Moderate Match" (40-59)
   - "Low Match" (<40)
6. Admin can view match score calculation methodology
7. Admin can recalculate score if job posting or applicant profile updated

**Sub Use Case 6.5: Add Admin Notes to Application**
1. Admin opens application detail view
2. Admin clicks "Add Note" button
3. System displays note entry form:
   - Note text area (rich text editor)
   - Visibility option (Admin only / Visible to Employer)
   - Tag/Category (Follow-up, Issue, Recommendation, etc.)
4. Admin enters note content
5. Admin sets visibility and category
6. Admin clicks "Save Note" button
7. System saves note with timestamp and admin identity
8. System displays note in application timeline
9. If visible to employer, system sends notification

**Sub Use Case 6.6: Delete/Withdraw Application**
1. Admin identifies application to remove (duplicate, error, request, etc.)
2. Admin clicks "Delete" icon on application row
3. System displays confirmation dialog:
   - "Delete this application?"
   - Reason dropdown (Duplicate, Applicant Request, Error, Policy Violation)
   - Option to notify applicant
   - Warning about permanent removal
4. Admin selects reason and confirms
5. System soft deletes application (marks as deleted but preserves data)
6. System sends notification to applicant (if selected)
7. System logs deletion with admin ID and reason
8. System removes application from active lists
9. System maintains record in audit trail

**Sub Use Case 6.7: Export Applications Data**
1. Admin applies desired filters to application list
2. Admin clicks "Export" button
3. System displays export configuration dialog:
   - Format (CSV, Excel, PDF)
   - Fields to include (checkboxes for columns)
   - Include attachments (resumes, cover letters)
   - Date range
   - Export scope (current page, all filtered, all applications)
4. Admin configures export settings and confirms
5. System generates export file:
   - Compiles data from filtered applications
   - Formats according to selected type
   - Optionally zips attachments
6. System triggers download
7. System logs export action with admin ID

**Sub Use Case 6.8: Generate Application Reports**
1. Admin clicks "Reports" button on applications page
2. System displays report generation interface
3. Admin selects report type:
   - Application Volume Report (by date, job, employer)
   - Conversion Funnel Report (status progression)
   - Time-to-Hire Report (average days per stage)
   - Match Score Effectiveness Report
   - Applicant Demographics Report
   - Industry Trends Report
4. Admin configures report parameters:
   - Date range
   - Filters (industry, employer, job type)
   - Grouping (by week, month, quarter)
   - Visualization type (charts, tables, graphs)
5. Admin clicks "Generate Report" button
6. System processes data and creates report:
   - Queries database with filters
   - Calculates metrics and statistics
   - Generates visualizations
   - Formats report layout
7. System displays report in viewer
8. Admin can export report as PDF or print
9. System saves report to admin's report history

**Alternative Flows:**

**A1: Invalid Status Transition**
- At step 8 of Sub Use Case 6.2:
  - System detects invalid status transition
  - System displays error "Cannot change from [Current] to [New] status"
  - System shows allowed transitions
  - Admin must select valid status

**A2: Applicant Account Deleted**
- When viewing application for deleted applicant:
  - System displays warning "Applicant account no longer exists"
  - System shows cached applicant data
  - Admin can view but not update application

**A3: Job Posting Removed**
- When viewing application for deleted job:
  - System displays warning "Job posting no longer available"
  - System shows cached job data
  - Application remains for historical records

**A4: Notification Delivery Failed**
- At step 11 of Sub Use Case 6.2:
  - System fails to send email notification
  - System logs delivery failure
  - System displays warning to admin
  - Status update still succeeds

**Postconditions:**
- Application statuses are current and accurate
- All status changes are logged with audit trail
- Applicants receive timely notifications
- Employers can see updated application statuses
- Reports reflect current application data

**Business Rules:**
- Application status can only move forward in workflow (except withdrawals)
- Rejected applications cannot be re-opened (new application required)
- Applicants can withdraw applications at any time
- Status changes must be logged with timestamp and modifier
- Notifications are sent asynchronously (failure doesn't block update)
- Match scores are recalculated when job or applicant data changes
- Applications remain linked to jobs even after job archival
- Admin notes marked "Admin only" are never visible to applicants or employers
- Bulk operations have maximum limit of 100 records per batch
- Export files are auto-deleted after 24 hours for security

---

### Use Case 7: Manage Referrals

**Actor:** Admin User

**Preconditions:**
- Admin is authenticated
- Referral system is active
- Applicants have been referred to employers

**Main Flow:**
1. Admin clicks "Referrals" in sidebar navigation
2. System displays referrals list page
3. System shows table with columns:
   - Referral ID / Slip Number
   - Applicant Name (linked to profile)
   - Employer Name (linked to company)
   - Job Position Referred For
   - Referral Date
   - Status (Referred, Contacted, Interviewed, Hired, Not Hired, Expired)
   - Source (Walk-in, Online, Phone, Email)
   - Follow-up Date
   - Actions (View, Update Status, Add Note, Print Slip)
4. System displays pagination and filters
5. System provides search functionality
6. System provides filter options:
   - Referral Status
   - Date Range
   - Employer
   - Applicant
   - Source Type
   - Follow-up Required (Yes/No)
7. Admin views referral list with applied filters
8. System displays summary statistics:
   - Total Referrals
   - By Status breakdown
   - Hiring success rate
   - Pending follow-ups

**Sub Use Case 7.1: View Referral Details**
1. Admin clicks "View" icon on referral row
2. System opens referral detail page
3. System displays complete referral information:
   - Referral Slip Number
   - Applicant Information (name, contact, qualifications)
   - Employer Information (company, contact person, address)
   - Position Details (job title, requirements)
   - Referral Date and Time
   - Current Status and Status History
   - Source/Channel of Referral
   - Admin/Staff who created referral
   - Follow-up Schedule
   - Communication Log (calls, emails, visits)
   - Interview Details (if scheduled)
   - Outcome/Result
   - Notes and Remarks
4. System shows referral slip preview (printable)
5. Admin can view linked applicant and employer profiles
6. Admin can see related referrals (same applicant or employer)

**Sub Use Case 7.2: Create New Referral**
1. Admin clicks "New Referral" button
2. System displays referral creation form with steps:
   
   **Step 1: Select Applicant**
   - Search applicant by name, email, or ID
   - View applicant profile summary
   - Check applicant eligibility for referral
   - Select applicant
   
   **Step 2: Select Employer/Position**
   - Search employer by company name
   - View available positions from employer
   - Or manually enter position if not listed
   - Select job position
   
   **Step 3: Referral Details**
   - Referral source (dropdown: Walk-in, Online Request, Phone Inquiry, Email)
   - Position referred for (if not selected in step 2)
   - Referral notes/remarks
   - Special instructions or requirements
   - Follow-up date (optional)
   
   **Step 4: Review and Submit**
   - Review all referral information
   - Preview referral slip
   - Option to print immediately
   - Option to email to applicant and/or employer

3. Admin fills in all required information
4. Admin clicks "Create Referral" button
5. System validates all data
6. System generates unique referral slip number
7. System creates referral record in database
8. System sets initial status to "Referred"
9. System optionally sends notifications:
   - Email to applicant with referral slip
   - Email to employer with applicant info
10. System displays success message with referral number
11. System opens option to print referral slip

**Sub Use Case 7.3: Update Referral Status**
1. Admin clicks "Update Status" on referral row
2. System displays status update dialog showing current status
3. System shows available status options:
   - Referred (initial status)
   - Contacted (employer contacted applicant)
   - Interviewed (applicant attended interview)
   - Hired (applicant was hired)
   - Not Hired (applicant not selected)
   - No Show (applicant didn't attend)
   - Withdrawn (applicant withdrew)
   - Expired (referral expired without action)
4. Admin selects new status
5. Admin enters status update details:
   - Date of status change
   - Notes/remarks about status
   - Outcome reason (if Not Hired or Withdrawn)
   - Interview date (if Interviewed)
   - Hiring date (if Hired)
6. Admin clicks "Update" button
7. System validates status transition
8. System updates referral record with new status
9. System logs status change with admin ID and timestamp
10. System sends notification to applicant about status update
11. System updates referral statistics
12. System schedules follow-up if required
13. System displays success confirmation

**Sub Use Case 7.4: Track Referral Follow-ups**
1. Admin clicks "Follow-ups" tab on referrals page
2. System displays list of referrals requiring follow-up:
   - Referrals with scheduled follow-up date today or overdue
   - Referrals in "Referred" or "Contacted" status for > 7 days
   - Referrals marked for follow-up by admin
3. System highlights overdue follow-ups in red
4. Admin clicks on referral to follow up
5. Admin contacts employer or applicant (phone, email)
6. Admin clicks "Log Follow-up" button
7. System displays follow-up log form:
   - Contact method (Phone, Email, In-person, SMS)
   - Contact result (Reached, Not Reached, Voicemail, Callback Requested)
   - Details/notes of conversation
   - Action items or next steps
   - Next follow-up date (if needed)
8. Admin fills in follow-up information
9. Admin clicks "Save Follow-up" button
10. System saves follow-up log to referral timeline
11. System updates follow-up status
12. System schedules next follow-up if specified
13. System moves referral out of immediate follow-up list

**Sub Use Case 7.5: Print Referral Slip**
1. Admin views referral detail or clicks "Print" on referral row
2. Admin clicks "Print Referral Slip" button
3. System generates printable referral slip with:
   - PESO office letterhead and logo
   - Referral slip number
   - Date of referral
   - "To" section: Employer name, address, contact person
   - "Applicant" section: Full name, address, contact number
   - Position referred for
   - Applicant qualifications summary
   - Skills and experience
   - Admin signature section
   - Instructions for employer
   - Validity period
   - QR code for verification (optional)
4. System opens print preview dialog
5. Admin reviews referral slip layout
6. Admin clicks "Print" or "Download PDF"
7. System sends to printer or generates PDF
8. System logs printing action
9. System marks referral slip as "Printed"

**Sub Use Case 7.6: Bulk Referral Creation**
1. Admin clicks "Bulk Referral" button
2. System displays bulk referral interface
3. Admin selects multiple applicants (checkboxes or CSV upload)
4. Admin selects employer and position
5. Admin sets common referral details:
   - Referral date
   - Source
   - Notes (applied to all)
6. System displays preview of referrals to be created
7. Admin reviews and confirms
8. System creates individual referral records for each applicant
9. System generates unique referral numbers
10. System displays summary:
    - Total referrals created
    - Successfully created
    - Failed (with reasons)
11. System offers to print all referral slips at once

**Sub Use Case 7.7: Generate Referral Reports**
1. Admin clicks "Reports" button on referrals page
2. System displays referral report options:
   - Monthly Referral Summary Report
   - Referral Outcome Report (hiring success rate)
   - Employer Referral Activity Report
   - Applicant Referral History Report
   - Source Effectiveness Report
   - Follow-up Compliance Report
3. Admin selects report type and parameters:
   - Date range
   - Employer filter (all or specific)
   - Status filter
   - Grouping (by month, employer, position)
4. Admin clicks "Generate Report"
5. System compiles report data:
   - Queries referral database
   - Calculates statistics (success rate, average time-to-hire)
   - Generates charts and graphs
   - Formats report layout
6. System displays report preview
7. Admin can export as PDF, Excel, or print
8. System saves report to admin's report archive

**Sub Use Case 7.8: Add Notes to Referral**
1. Admin opens referral detail page
2. Admin clicks "Add Note" button
3. System displays note entry form:
   - Note text area
   - Note type (General, Follow-up, Interview, Outcome)
   - Visibility (Internal only / Share with Applicant)
   - Attachments (upload documents/photos)
4. Admin enters note content
5. Admin optionally attaches files
6. Admin clicks "Save Note" button
7. System saves note with timestamp and admin identity
8. System adds note to referral timeline
9. If shared with applicant, system sends notification
10. System displays note in referral history

**Alternative Flows:**

**A1: Applicant Already Referred to Same Employer**
- At step 5 of Sub Use Case 7.2:
  - System detects existing referral to same employer within 30 days
  - System displays warning "Duplicate referral detected"
  - System shows existing referral details
  - Admin can choose to:
    * Cancel new referral
    * Proceed anyway (for different position)
    * Update existing referral instead

**A2: Employer Not Verified**
- At step 2 of Sub Use Case 7.2:
  - System detects employer verification status is "Pending" or "Rejected"
  - System displays warning message
  - Admin can still create referral but system flags it
  - Referral marked for review before sending to employer

**A3: Referral Expired Without Status Update**
- System automatically updates referrals:
  - After 30 days in "Referred" status with no update
  - System changes status to "Expired"
  - System sends reminder to admin for follow-up
  - Admin can reactivate if needed

**A4: Follow-up Contact Unsuccessful**
- At step 8 of Sub Use Case 7.4:
  - Admin logs "Not Reached" multiple times
  - System suggests alternative contact methods
  - System can flag referral for applicant re-engagement
  - Admin can mark referral for closure

**Postconditions:**
- All referrals are tracked with current status
- Referral slips are generated and printable
- Follow-ups are scheduled and logged
- Hiring outcomes are recorded
- Statistics reflect referral effectiveness
- Applicants and employers receive appropriate notifications

**Business Rules:**
- Each referral must have unique slip number (auto-generated)
- Referral slips are valid for 30 days from issue date
- Applicants can have multiple active referrals to different employers
- Duplicate referrals to same employer within 30 days require approval
- Follow-up required within 7 days of "Referred" status
- "Hired" status requires hiring date and can trigger success metrics
- Referral data preserved for reporting even if applicant/employer deleted
- Admin must log follow-up attempts for compliance tracking
- Printed referral slips are tracked for audit purposes
- Bulk referrals limited to 50 applicants per batch

---

## PART 2/3 END

---

## PART 3/3: ANALYTICS, REPORTING & SYSTEM ADMINISTRATION

### Use Case 8: View Analytics and Dashboards

**Actor:** Admin User

**Preconditions:**
- Admin is authenticated
- System has collected sufficient data for analysis
- Database contains applicants, employers, jobs, applications, and referrals

**Main Flow:**
1. Admin clicks "Analytics" or "Dashboard" in sidebar navigation
2. System displays comprehensive analytics dashboard
3. System shows key performance indicators (KPIs):
   - Total Active Users (Applicants + Employers)
   - New Registrations (This Week/Month)
   - Active Job Postings Count
   - Total Applications Submitted
   - Referrals Made (This Month)
   - Placement Rate (Hired / Total Referrals) %
   - System Uptime and Health
4. System displays time-series charts:
   - User Registration Trend (line chart - last 6 months)
   - Job Posting Activity (bar chart - by month)
   - Application Volume (area chart - by week)
   - Placement Success Rate (line chart - by month)
5. System shows demographic breakdowns:
   - Applicants by Age Group (pie chart)
   - Applicants by Gender (donut chart)
   - Applicants by Educational Attainment (bar chart)
   - Applicants by Location/Region (map visualization)
   - Applicants by Employment Status (stacked bar)
6. System displays industry analytics:
   - Top Industries Hiring (horizontal bar chart)
   - Job Postings by Industry (treemap)
   - Average Time-to-Fill by Industry
   - Salary Ranges by Industry (box plot)
7. Admin can interact with charts:
   - Click to drill down into details
   - Filter by date range
   - Export chart as image or data
   - Toggle between different metrics

**Sub Use Case 8.1: Customize Dashboard View**
1. Admin clicks "Customize Dashboard" button
2. System displays dashboard customization interface
3. Admin can:
   - Add/Remove widgets from dashboard
   - Rearrange widget positions (drag and drop)
   - Resize widgets
   - Select which KPIs to display
   - Set default date ranges
   - Choose chart types for data
4. Admin configures dashboard layout
5. Admin clicks "Save Layout" button
6. System saves admin's dashboard preferences
7. System applies custom layout on future dashboard loads

**Sub Use Case 8.2: View Real-Time Statistics**
1. Admin clicks "Real-Time" tab on analytics page
2. System displays live statistics dashboard with auto-refresh
3. System shows real-time metrics:
   - Users Currently Online
   - Active Job Searches (last hour)
   - Applications Submitted Today
   - New User Registrations Today
   - Active Admin Sessions
   - System Response Time
   - Database Query Performance
4. System updates statistics every 30 seconds automatically
5. System displays activity feed:
   - Recent user actions (logged in, applied, posted job)
   - Recent admin actions
   - System events (errors, warnings, alerts)
6. Admin can pause/resume auto-refresh
7. Admin can filter activity feed by type and user role

**Sub Use Case 8.3: Analyze Applicant Trends**
1. Admin clicks "Applicant Analytics" section
2. System displays detailed applicant analysis:
   
   **Demographics:**
   - Age distribution (histogram)
   - Gender breakdown (pie chart)
   - Civil status distribution
   - Educational attainment (bar chart)
   - Geographic distribution (map with heat zones)
   
   **Employment Metrics:**
   - Employment status breakdown (employed, unemployed, self-employed)
   - Actively looking for work percentage
   - Time unemployed (average, median, distribution)
   - Previous employment sectors
   
   **Skill Analysis:**
   - Most common skills registered
   - In-demand skills vs applicant skills gap
   - Certifications and licenses distribution
   
   **Activity Metrics:**
   - Average applications per applicant
   - Application success rate by demographics
   - Profile completion rate
   - Login frequency and engagement
   
3. Admin can filter all views by:
   - Date range
   - Location/region
   - Industry preference
   - Employment status
4. System provides comparison tools (compare periods, cohorts)
5. Admin can export detailed reports

**Sub Use Case 8.4: Analyze Employer Trends**
1. Admin clicks "Employer Analytics" section
2. System displays employer analysis dashboard:
   
   **Employer Metrics:**
   - Total employers by industry (pie chart)
   - Active vs inactive employers
   - Verified vs pending verification
   - Company size distribution
   - Geographic distribution
   
   **Hiring Activity:**
   - Average job postings per employer
   - Application response time (average)
   - Hiring rate (applications to hires ratio)
   - Most active employers (leaderboard)
   - Job posting frequency trend
   
   **Job Posting Analytics:**
   - Total postings by type (full-time, part-time, contract)
   - Average salary offered by industry
   - Job posting duration average
   - Expiry and renewal rates
   - Featured vs standard posting performance
   
   **Engagement Metrics:**
   - Employer login frequency
   - Time to first hire after registration
   - Repeat hiring rate
   - Referral acceptance rate
   
3. System shows employer satisfaction indicators:
   - Average time to fill positions
   - Quality of applicants metric
   - Employer retention rate
4. Admin can identify at-risk employers (low activity, poor metrics)
5. Admin can export employer reports

**Sub Use Case 8.5: Job Market Intelligence**
1. Admin clicks "Job Market" tab
2. System displays job market intelligence dashboard:
   
   **Supply and Demand:**
   - Open positions count by industry
   - Available applicants by skill category
   - Supply-demand ratio by job category
   - Skills gap analysis (most needed vs available)
   
   **Salary Intelligence:**
   - Average salary by position/industry
   - Salary trends over time (line chart)
   - Salary range distribution (box plots)
   - Comparison with national/regional benchmarks
   
   **Job Trends:**
   - Fastest growing job categories
   - Declining job sectors
   - Emerging skills requirements
   - Remote vs onsite job distribution
   
   **Matching Efficiency:**
   - Average match score distribution
   - Application-to-interview ratio
   - Interview-to-hire ratio
   - Time-to-hire by industry
   
3. System provides predictive insights:
   - Forecasted job growth by sector (next quarter)
   - Anticipated skill shortages
   - Hiring trend predictions
4. Admin can generate market intelligence reports for stakeholders

**Sub Use Case 8.6: Performance Benchmarking**
1. Admin clicks "Benchmarks" section
2. System displays performance comparison metrics:
   - Current period vs previous period
   - Year-over-year comparison
   - Comparison with similar PESO offices (if available)
   - National employment statistics comparison
3. System shows performance indicators:
   - Placement rate vs target
   - Application processing time vs benchmark
   - User satisfaction scores
   - System utilization rate
4. System highlights areas of improvement (red) and success (green)
5. Admin can set custom benchmarks and targets

**Sub Use Case 8.7: Export Analytics Data**
1. Admin clicks "Export" button on any analytics view
2. System displays export configuration dialog:
   - Export format (CSV, Excel, PDF, JSON)
   - Date range
   - Data aggregation level (raw, daily, weekly, monthly)
   - Include visualizations (for PDF)
   - Schedule recurring export (optional)
3. Admin configures export settings
4. Admin clicks "Export Now" or "Schedule Export"
5. System generates export file with all selected data
6. System triggers download or emails export to admin
7. If scheduled, system saves export configuration for future runs

**Alternative Flows:**

**A1: Insufficient Data for Analysis**
- At step 3, if data volume is too low:
  - System displays message "Insufficient data for statistical analysis"
  - System shows available data with disclaimer
  - System suggests minimum data requirements

**A2: Chart Rendering Error**
- If chart fails to render:
  - System displays error message with chart data in table format
  - System logs error for technical team
  - Admin can still export raw data

**A3: Performance Impact from Complex Query**
- If analytics query takes too long:
  - System displays loading indicator
  - System offers to email results when ready
  - Admin can cancel and adjust date range

**Postconditions:**
- Admin has comprehensive view of system performance
- Data-driven insights available for decision making
- Trends and patterns are identifiable
- Export data is available for external reporting
- Custom dashboard preferences are saved

**Business Rules:**
- Analytics data is refreshed hourly from main database
- Real-time statistics use cached data updated every 30 seconds
- Personal identifiable information (PII) is anonymized in aggregated reports
- Historical data retained for minimum 2 years for trend analysis
- Performance metrics calculated using industry-standard formulas
- Dashboard customizations are per-admin user (not global)
- Exported data includes timestamp and admin identity for audit trail
- Scheduled exports run daily at configured time

---

### Use Case 9: Generate and Manage Reports

**Actor:** Admin User

**Preconditions:**
- Admin is authenticated
- System has data to report on
- Report templates are configured

**Main Flow:**
1. Admin clicks "Reports" in sidebar navigation
2. System displays reports management page
3. System shows report categories:
   - Standard Reports (pre-configured templates)
   - Custom Reports (admin-created)
   - Scheduled Reports (recurring)
   - Report History (previously generated)
4. System displays available standard reports:
   - Monthly Activity Summary Report
   - Applicant Registration Report
   - Employer Activity Report
   - Job Posting Analytics Report
   - Application Tracking Report
   - Referral Outcomes Report
   - Placement Success Report
   - NSRP Compliance Report
   - System Usage Report
5. Admin selects report type to generate

**Sub Use Case 9.1: Generate Standard Report**
1. Admin clicks on standard report name (e.g., "Monthly Activity Summary")
2. System displays report parameters form:
   - **Date Range:**
     * Preset options (This Month, Last Month, Quarter, Year)
     * Custom date range picker
   - **Filters:**
     * By location/region
     * By industry
     * By user type
   - **Output Format:**
     * PDF (formatted for printing)
     * Excel (with data tables)
     * CSV (raw data)
     * HTML (web view)
   - **Additional Options:**
     * Include charts and visualizations
     * Include executive summary
     * Comparison with previous period
     * Detailed vs summary level
3. Admin configures report parameters
4. Admin clicks "Generate Report" button
5. System validates parameters
6. System displays progress indicator
7. System queries database with filters
8. System compiles data and calculates statistics
9. System generates visualizations (if selected)
10. System formats report according to template
11. System displays report preview
12. Admin can:
    - Download report
    - Print report
    - Email report to stakeholders
    - Save to report history
    - Schedule for recurring generation

**Sub Use Case 9.2: Create Custom Report**
1. Admin clicks "Create Custom Report" button
2. System displays custom report builder interface
3. Admin configures report structure:
   
   **Step 1: Select Data Sources**
   - Applicants table
   - Employers table
   - Job postings table
   - Applications table
   - Referrals table
   - Custom SQL query (advanced)
   
   **Step 2: Select Fields/Columns**
   - Checkboxes for available fields
   - Option to create calculated fields
   - Field aliases/display names
   
   **Step 3: Apply Filters**
   - Filter conditions (WHERE clauses)
   - Date range filters
   - Status filters
   - Joins between tables
   
   **Step 4: Grouping and Aggregation**
   - Group by fields
   - Aggregate functions (COUNT, SUM, AVG, MIN, MAX)
   - Having conditions (for aggregates)
   
   **Step 5: Sorting and Limits**
   - Order by fields (ascending/descending)
   - Row limit (top N results)
   
   **Step 6: Visualization**
   - Select chart type for data
   - Configure chart axes and labels
   - Color scheme
   
   **Step 7: Layout and Formatting**
   - Report title and description
   - Header/footer content
   - Logo and branding
   - Page orientation (portrait/landscape)

4. Admin previews report with sample data
5. Admin clicks "Save Report Template" button
6. System prompts for report name and description
7. Admin names report and saves
8. System saves custom report template
9. Report appears in "Custom Reports" section for future use

**Sub Use Case 9.3: Schedule Recurring Report**
1. Admin opens any report (standard or custom)
2. Admin clicks "Schedule Report" button
3. System displays scheduling configuration:
   - **Frequency:**
     * Daily, Weekly, Monthly, Quarterly, Yearly
     * Specific day of week/month
   - **Time:**
     * Time of day to generate (HH:MM)
     * Timezone
   - **Date Range:**
     * Relative (e.g., "Last 30 days", "Previous month")
     * Rolling window option
   - **Recipients:**
     * Admin email
     * Additional stakeholder emails
     * Distribution list
   - **Delivery Method:**
     * Email attachment
     * Save to server folder
     * Upload to cloud storage
   - **Active Date Range:**
     * Start date (when scheduling begins)
     * End date (when scheduling stops) - optional
4. Admin configures schedule settings
5. Admin clicks "Create Schedule" button
6. System validates schedule configuration
7. System creates scheduled job
8. System displays confirmation with next run time
9. System adds schedule to "Scheduled Reports" list
10. On scheduled time, system automatically:
    - Generates report with current data
    - Emails to recipients
    - Saves to history
    - Logs generation event

**Sub Use Case 9.4: View Report History**
1. Admin clicks "Report History" tab
2. System displays list of previously generated reports:
   - Report name
   - Generation date and time
   - Generated by (admin user)
   - Parameters used
   - File size
   - Actions (Download, Re-generate, Delete)
3. System provides filters:
   - Report type
   - Date range (generation date)
   - Generated by user
4. Admin can search report history
5. Admin clicks "Download" to retrieve archived report
6. System retrieves report file from storage
7. System triggers download to admin's computer

**Sub Use Case 9.5: Generate NSRP Compliance Report**
1. Admin clicks "NSRP Compliance Report" (special government-required report)
2. System displays NSRP report form with specific parameters:
   - Reporting period (month/quarter)
   - PESO office code
   - Region/province/municipality
   - Report type (Form 1, Form 2, Form 3)
3. Admin selects parameters
4. System generates report following NSRP format specifications:
   - **SRS Form 1: Registration Data**
     * Total applicants registered by category
     * Age, gender, educational attainment breakdown
     * Employment status distribution
   - **SRS Form 2: Placement Data**
     * Total referrals made
     * Total placements (hired)
     * Placement by industry/occupation
     * Local vs overseas placement
   - **SRS Form 3: Job Vacancies**
     * Job orders received
     * Job vacancies by industry
     * Positions filled vs unfilled
5. System formats report in official government template
6. System includes required signatures and certification sections
7. System displays report preview
8. Admin can export as PDF for submission to DOLE
9. System saves NSRP report to compliance folder

**Sub Use Case 9.6: Generate Executive Summary Report**
1. Admin clicks "Executive Summary" report
2. System displays summary report configuration:
   - Period (monthly, quarterly, annual)
   - Audience (internal, DOLE, local government)
3. Admin configures and generates
4. System creates executive summary including:
   - **Overview Section:**
     * Key accomplishments
     * Significant events
     * Challenges and issues
   - **Statistical Highlights:**
     * Registration metrics (with % change)
     * Placement metrics (with success rate)
     * Job order metrics
   - **Trend Analysis:**
     * Growth trends
     * Comparative analysis (vs previous period)
     * Benchmark performance
   - **Key Insights:**
     * Top industries hiring
     * In-demand skills
     * Demographic patterns
   - **Future Outlook:**
     * Projected trends
     * Upcoming initiatives
     * Action items
5. System formats in professional executive report template
6. System includes charts, graphs, and infographics
7. Admin can customize content before finalizing

**Sub Use Case 9.7: Export Report Data to External Systems**
1. Admin clicks "Export to External System" button
2. System displays export targets:
   - DOLE Central Database (API)
   - National PESO Network Database
   - Local Government MIS
   - Data Warehouse
3. Admin selects target system
4. System displays data mapping configuration:
   - Field mapping (source → destination)
   - Data transformation rules
   - Validation rules
5. Admin reviews and confirms export
6. System prepares data in target format
7. System validates data against target schema
8. System transmits data via API or file transfer
9. System logs export transaction
10. System displays success/error report

**Sub Use Case 9.8: Share Report with Stakeholders**
1. Admin has generated report preview open
2. Admin clicks "Share" button
3. System displays sharing options:
   - Email to recipients
   - Generate public link (password protected)
   - Print physical copies
   - Save to shared drive
4. Admin selects "Email" option
5. System displays email form:
   - Recipients (multiple emails)
   - Subject (pre-filled with report name)
   - Message body (customizable)
   - Attachment format (PDF, Excel, etc.)
   - Send copy to self
6. Admin fills in recipients and message
7. Admin clicks "Send" button
8. System attaches report file to email
9. System sends email to all recipients
10. System logs sharing action
11. System displays confirmation with recipients list

**Alternative Flows:**

**A1: Report Generation Timeout**
- At step 7 of Sub Use Case 9.1:
  - If report takes longer than 60 seconds:
  - System displays "Large report detected" message
  - System offers to email when complete
  - Admin can choose to wait or receive via email

**A2: Invalid Date Range**
- At step 5 of Sub Use Case 9.1:
  - System detects invalid date range (end before start)
  - System displays error message
  - Admin must correct dates before proceeding

**A3: No Data for Selected Filters**
- At step 8 of Sub Use Case 9.1:
  - Query returns zero records
  - System displays "No data found for selected criteria"
  - System suggests adjusting filters
  - Admin can generate empty report or cancel

**A4: Scheduled Report Execution Failure**
- When scheduled report runs:
  - If database unavailable or error occurs:
  - System retries 3 times
  - If still failing, system sends error notification to admin
  - System logs failure with details

**Postconditions:**
- Reports are generated accurately with current data
- Report history is maintained for audit purposes
- Scheduled reports execute on time
- Stakeholders receive reports via configured channels
- Compliance reports meet government requirements

**Business Rules:**
- All reports include generation timestamp and admin identity
- Personal identifying information follows data privacy guidelines
- NSRP reports must match DOLE format specifications exactly
- Report history retained for minimum 3 years
- Scheduled reports cannot exceed 10 MB attachment size (split or compress)
- Custom reports require advanced permissions
- Report generation limited to 5 concurrent requests per admin
- Sensitive reports (salary data, personal info) marked confidential
- External data exports logged for compliance and audit
- Report templates versioned for consistency

---

### Use Case 10: Manage System Configuration

**Actor:** Admin User (with elevated/super admin privileges)

**Preconditions:**
- Admin is authenticated with super admin role
- System configuration database is accessible

**Main Flow:**
1. Admin clicks "Settings" or "Configuration" in sidebar
2. System displays configuration management page
3. System shows configuration categories:
   - General Settings
   - User & Authentication Settings
   - Email & Notification Settings
   - Job Posting Settings
   - Application Settings
   - Referral Settings
   - Security Settings
   - Integration Settings
   - Backup & Maintenance
4. Admin selects configuration category to manage

**Sub Use Case 10.1: Configure General Settings**
1. Admin clicks "General Settings" section
2. System displays general configuration form:
   
   **System Information:**
   - PESO Office Name
   - Office Code/Registration Number
   - Region, Province, Municipality/City
   - Contact Information (phone, email, address)
   - Office Hours
   
   **Branding:**
   - System Logo (upload image)
   - Favicon
   - Color Scheme (primary, secondary, accent colors)
   - Custom CSS (advanced)
   
   **Regional Settings:**
   - Timezone
   - Date Format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
   - Time Format (12-hour, 24-hour)
   - Currency Symbol
   - Language/Locale
   
   **Feature Toggles:**
   - Enable/Disable Online Job Applications
   - Enable/Disable Applicant Self-Registration
   - Enable/Disable Employer Self-Registration
   - Enable/Disable AI Job Matching
   - Enable/Disable Referral System
   - Enable/Disable Public Job Board

3. Admin modifies desired settings
4. Admin clicks "Save Changes" button
5. System validates all inputs
6. System updates configuration in database
7. System applies changes immediately (or on next restart for critical settings)
8. System logs configuration change with admin ID
9. System displays success notification
10. System may prompt admin to restart server for certain changes

**Sub Use Case 10.2: Configure User & Authentication Settings**
1. Admin clicks "User & Authentication Settings"
2. System displays authentication configuration:
   
   **Password Policy:**
   - Minimum password length (6-20 characters)
   - Require uppercase letters (checkbox)
   - Require lowercase letters (checkbox)
   - Require numbers (checkbox)
   - Require special characters (checkbox)
   - Password expiry (days, or never)
   - Password history (prevent reuse of last N passwords)
   
   **Session Management:**
   - Session timeout duration (minutes)
   - Remember me duration (days)
   - Maximum concurrent sessions per user
   - Auto-logout on browser close
   
   **Account Security:**
   - Enable two-factor authentication (2FA)
   - Account lockout threshold (failed login attempts)
   - Lockout duration (minutes)
   - Email verification required for new accounts
   - Admin approval required for new employers
   
   **Registration Settings:**
   - Allow applicant self-registration (on/off)
   - Allow employer self-registration (on/off)
   - Required fields for registration
   - Terms and conditions text
   - Privacy policy URL

3. Admin configures security settings
4. Admin clicks "Save Settings" button
5. System validates settings
6. System updates authentication configuration
7. System displays confirmation
8. New policies apply to future authentications

**Sub Use Case 10.3: Configure Email & Notification Settings**
1. Admin clicks "Email & Notification Settings"
2. System displays email configuration form:
   
   **Email Server (SMTP):**
   - SMTP Host
   - SMTP Port (25, 465, 587)
   - Encryption (None, SSL, TLS)
   - SMTP Username
   - SMTP Password
   - From Email Address
   - From Name
   - Reply-To Email
   
   **Email Templates:**
   - Welcome email template
   - Password reset template
   - Application confirmation template
   - Job posting approval template
   - Referral notification template
   - Status update notification template
   - Custom variables/placeholders guide
   
   **Notification Preferences:**
   - Send email on new applicant registration (on/off)
   - Send email on new employer registration (on/off)
   - Send email on new job posting (on/off)
   - Send email on new application (on/off)
   - Send daily digest to admin (on/off)
   - Digest time (HH:MM)
   
   **SMS Settings (Optional):**
   - SMS API provider
   - API key
   - SMS notifications enabled (on/off)
   - SMS templates

3. Admin configures email settings
4. Admin can click "Send Test Email" to verify configuration
5. System sends test email to admin's address
6. Admin verifies receipt and formatting
7. Admin clicks "Save Settings" button
8. System updates email configuration
9. System restarts email service with new settings

**Sub Use Case 10.4: Configure Job Posting Settings**
1. Admin clicks "Job Posting Settings"
2. System displays job posting configuration:
   
   **Posting Rules:**
   - Require admin approval for new postings (on/off)
   - Auto-approve for verified employers (on/off)
   - Default job posting duration (days)
   - Maximum posting duration (days)
   - Allow posting renewal (on/off)
   - Maximum renewals per posting
   
   **Content Requirements:**
   - Minimum job description length (characters)
   - Required fields (checkboxes for salary, location, etc.)
   - Prohibited words/phrases (moderation list)
   - Salary disclosure required (on/off)
   
   **Visibility & Promotion:**
   - Featured posting cost (if applicable)
   - Featured posting duration (days)
   - Maximum featured postings at once
   - Job posting SEO enabled (on/off)
   
   **Application Settings:**
   - Maximum applications per job
   - Close applications when limit reached (on/off)
   - Allow external application URLs (on/off)
   - Application deadline enforcement (strict/flexible)

3. Admin modifies job posting settings
4. Admin clicks "Save Settings" button
5. System validates and saves configuration
6. New rules apply to future job postings

**Sub Use Case 10.5: Configure Application Settings**
1. Admin clicks "Application Settings"
2. System displays application configuration:
   
   **Application Rules:**
   - Maximum applications per applicant per day
   - Prevent duplicate applications to same job (on/off)
   - Allow application withdrawal by applicant (on/off)
   - Withdrawal deadline (days after applying)
   
   **Document Requirements:**
   - Resume/CV required (on/off)
   - Cover letter required (on/off)
   - Maximum file size for uploads (MB)
   - Allowed file types (PDF, DOC, DOCX, etc.)
   
   **AI Matching:**
   - Enable AI job matching (on/off)
   - Match score threshold for recommendations
   - Matching algorithm version
   - Matching criteria weights:
     * Skills match weight (%)
     * Experience match weight (%)
     * Education match weight (%)
     * Location match weight (%)
   
   **Status Workflow:**
   - Default initial status (Applied, Pending Review)
   - Auto-change to "Reviewed" after employer view (on/off)
   - Status transition rules (define allowed transitions)
   - Notification triggers for status changes

3. Admin configures application settings
4. Admin clicks "Save Settings" button
5. System updates application processing rules

**Sub Use Case 10.6: Configure Security Settings**
1. Admin clicks "Security Settings"
2. System displays security configuration:
   
   **Access Control:**
   - IP whitelist for admin access (optional)
   - Geo-blocking countries (optional)
   - Rate limiting (requests per minute per IP)
   - CORS allowed origins
   
   **Data Protection:**
   - Enable data encryption at rest (on/off)
   - Enable SSL/TLS enforcement (on/off)
   - Cookie security flags (HttpOnly, Secure, SameSite)
   - Session secret rotation schedule
   
   **Audit Logging:**
   - Log level (Error, Warn, Info, Debug)
   - Log retention period (days)
   - Audit trail enabled for admin actions (on/off)
   - Log user login attempts (on/off)
   - Log failed authentication attempts (on/off)
   
   **Backup Settings:**
   - Automatic backup enabled (on/off)
   - Backup frequency (daily, weekly)
   - Backup time (HH:MM)
   - Backup retention (number of backups to keep)
   - Backup location (local, cloud storage)
   
   **Privacy Compliance:**
   - Enable GDPR compliance features (on/off)
   - Data retention policy (years)
   - User data export enabled (on/off)
   - Right to be forgotten enabled (on/off)

3. Admin configures security settings
4. Admin clicks "Save Settings" button
5. System may require admin to re-authenticate for critical changes
6. System applies security settings immediately

**Sub Use Case 10.7: Manage Admin Users**
1. Admin clicks "Admin Users" section
2. System displays list of admin accounts:
   - Username
   - Email
   - Role (Super Admin, Admin, Moderator)
   - Status (Active, Suspended)
   - Last Login
   - Actions (Edit, Suspend, Delete)
3. Admin clicks "Add Admin User" button
4. System displays admin creation form:
   - Full Name (required)
   - Email (required, unique)
   - Username (required, unique)
   - Role (dropdown: Super Admin, Admin, Moderator)
   - Permissions (checkboxes for granular access control):
     * Manage Applicants
     * Manage Employers
     * Manage Job Postings
     * Manage Applications
     * Manage Referrals
     * View Analytics
     * Generate Reports
     * System Configuration
     * User Management
   - Temporary Password (auto-generated or manual)
   - Send welcome email (checkbox)
5. Admin fills in user details
6. Admin clicks "Create Admin User" button
7. System validates input (email/username uniqueness)
8. System creates admin account with hashed password
9. System sends welcome email with login credentials (if selected)
10. System logs admin user creation
11. System displays success notification
12. New admin appears in admin users list

**Sub Use Case 10.8: View System Logs**
1. Admin clicks "System Logs" section
2. System displays log viewer interface
3. System shows log entries in table:
   - Timestamp
   - Log Level (Error, Warn, Info, Debug)
   - Category (Auth, Database, API, Email, System)
   - Message
   - User (if applicable)
   - IP Address
   - Actions (View Details)
4. Admin can filter logs:
   - By date range
   - By log level
   - By category
   - By user
   - Search by message content
5. Admin clicks on log entry to view full details
6. System displays complete log entry with:
   - Stack trace (for errors)
   - Request/response data
   - Context information
7. Admin can export logs:
   - Filtered logs or all logs
   - Format: CSV, JSON, or plain text
8. System downloads log file

**Sub Use Case 10.9: Perform Database Maintenance**
1. Admin clicks "Database Maintenance" section
2. System displays maintenance operations:
   
   **Database Status:**
   - Database size
   - Number of records per table
   - Last backup date/time
   - Database health status
   
   **Maintenance Operations:**
   - Optimize Database (defragment, rebuild indexes)
   - Clean Up Old Data (delete archived records older than X days)
   - Verify Data Integrity (check for orphaned records)
   - Reset Auto-Increment Counters
   - Clear Cache
   
   **Backup & Restore:**
   - Create Manual Backup Now
   - View Backup History
   - Restore from Backup
   - Download Backup File

3. Admin selects operation (e.g., "Create Manual Backup Now")
4. System displays confirmation dialog with warning
5. Admin confirms operation
6. System performs maintenance task:
   - Shows progress indicator
   - Logs operation start
   - Executes database commands
   - Logs completion
7. System displays result summary:
   - Operation success/failure
   - Records affected
   - Time taken
   - Any errors encountered
8. For backup operations, system provides download link

**Alternative Flows:**

**A1: Invalid Configuration Value**
- At validation step in any configuration:
  - System detects invalid value (out of range, wrong format)
  - System displays field-specific error message
  - Admin must correct before saving

**A2: SMTP Test Email Fails**
- At step 5 of Sub Use Case 10.3:
  - System cannot send test email
  - System displays error with details (connection refused, auth failed, etc.)
  - Admin must fix SMTP settings before saving

**A3: Security Setting Requires Restart**
- After saving certain security settings:
  - System displays "Server restart required for changes to take effect"
  - Admin can restart now or schedule restart
  - Critical services continue running until restart

**A4: Backup Operation Fails**
- At step 6 of Sub Use Case 10.9:
  - Backup fails due to disk space or permissions
  - System displays error message
  - System suggests solutions
  - Admin can free space or adjust permissions and retry

**A5: Cannot Delete Last Super Admin**
- When deleting admin user:
  - System prevents deletion of last super admin
  - System displays error "At least one super admin must exist"
  - Admin must create another super admin first

**Postconditions:**
- System configuration updated according to admin changes
- Changes are logged in audit trail
- Critical settings trigger appropriate alerts or restarts
- Configuration is backed up before major changes
- Users experience updated behavior immediately or after restart

**Business Rules:**
- Only super admins can access system configuration
- Configuration changes are logged with full audit trail
- Critical security changes require admin re-authentication
- Email settings must be tested before saving
- Password policies apply to all users including admins
- Backup must complete successfully before dangerous operations
- System must maintain at least one super admin account
- Configuration export/import available for disaster recovery
- Changes to authentication settings don't logout current users
- Rate limiting applies to all users except admin IP whitelist

---

### Use Case 11: Manage Notifications and Communications

**Actor:** Admin User

**Preconditions:**
- Admin is authenticated
- Notification system is configured
- Users (applicants, employers) exist in system

**Main Flow:**
1. Admin clicks "Notifications" in sidebar
2. System displays notifications management page
3. System shows notification categories:
   - Inbox (incoming notifications to admin)
   - Sent Messages (admin-initiated communications)
   - Broadcast Messages
   - Automated Notifications (system-generated)
   - Templates
   - Settings
4. Admin views current notification overview

**Sub Use Case 11.1: View Admin Notifications**
1. Admin clicks "Inbox" tab
2. System displays list of notifications received by admin:
   - New applicant registration alerts
   - New employer registration alerts
   - Job posting pending approval alerts
   - System error/warning notifications
   - User support requests
   - Scheduled report completion notices
3. System shows notification details:
   - Timestamp
   - Category/Type
   - Message preview
   - Read/Unread status
   - Action buttons (Mark as Read, Delete, Respond)
4. System displays unread count badge
5. Admin clicks on notification to view full details
6. System marks notification as read
7. System displays full notification content with:
   - Complete message
   - Relevant links (to applicant, employer, job, etc.)
   - Action buttons (Approve, Reject, View, etc.)
8. Admin can take action directly from notification

**Sub Use Case 11.2: Send Direct Message to User**
1. Admin clicks "Send Message" button or from user profile page
2. System displays message composition form:
   - **Recipient Selection:**
     * Single user (search by name, email)
     * Multiple users (select from list)
     * User group (All Applicants, All Employers, etc.)
   - **Message Details:**
     * Subject line (required)
     * Message body (rich text editor)
     * Attachments (optional, PDF, images)
   - **Delivery Options:**
     * Send as Email (checkbox)
     * Send as In-App Notification (checkbox)
     * Send as SMS (checkbox, if configured)
     * Schedule send time (optional)
   - **Priority:**
     * Normal, High, Urgent
3. Admin composes message
4. Admin selects recipients
5. Admin clicks "Send" or "Schedule" button
6. System validates message (recipient exists, message not empty)
7. System queues message for delivery
8. System sends via selected channels:
   - Creates in-app notification
   - Sends email via SMTP
   - Sends SMS via API (if enabled)
9. System logs message sending action
10. System displays confirmation with delivery status
11. System adds message to "Sent Messages" folder

**Sub Use Case 11.3: Create Broadcast Announcement**
1. Admin clicks "Broadcast" tab
2. Admin clicks "New Broadcast" button
3. System displays broadcast creation form:
   - **Audience:**
     * All Users
     * All Applicants
     * All Employers
     * Active Users Only
     * Custom Filter (by location, industry, status, etc.)
   - **Announcement Content:**
     * Title (required)
     * Message body (rich text)
     * Banner style (Info, Warning, Success, Error)
     * Display duration (days)
     * Link/Call-to-action button (optional)
   - **Display Settings:**
     * Show on dashboard (checkbox)
     * Show as popup (checkbox)
     * Show in notification panel (checkbox)
     * Dismissible by user (checkbox)
   - **Schedule:**
     * Start date and time
     * End date and time (optional)
4. Admin fills in broadcast details
5. Admin previews broadcast appearance
6. Admin clicks "Publish Broadcast" button
7. System validates broadcast configuration
8. System creates broadcast record
9. System displays broadcast to target audience:
   - Shows banner on dashboard
   - Creates notification entry for each user
   - Displays popup on next login (if configured)
10. System tracks broadcast metrics:
    - Views count
    - Dismissals count
    - Click-through rate (if link included)
11. System displays confirmation to admin

**Sub Use Case 11.4: Manage Notification Templates**
1. Admin clicks "Templates" tab
2. System displays list of notification templates:
   - Welcome Email (new user registration)
   - Application Confirmation
   - Application Status Update
   - Job Posting Approved
   - Job Posting Rejected
   - Referral Notification
   - Password Reset
   - Account Verification
   - Interview Invitation
   - Job Alert
3. Admin clicks "Edit" on template
4. System displays template editor:
   - Template Name
   - Subject Line (for emails)
   - HTML Email Body (WYSIWYG editor)
   - Plain Text Version
   - SMS Version (if applicable)
   - Available Variables:
     * {{user_name}}
     * {{company_name}}
     * {{job_title}}
     * {{application_date}}
     * {{referral_number}}
     * {{link}}
     * (and more context-specific variables)
5. Admin modifies template content
6. Admin can use variable placeholders for dynamic content
7. Admin clicks "Preview" to see rendered template
8. System displays preview with sample data
9. Admin clicks "Save Template" button
10. System validates template (checks for unclosed tags, required variables)
11. System updates template in database
12. System displays success notification
13. New template version used for future notifications

**Sub Use Case 11.5: View Notification Delivery Statistics**
1. Admin clicks "Statistics" tab on notifications page
2. System displays notification metrics dashboard:
   
   **Email Statistics:**
   - Total emails sent (by period)
   - Delivery rate (%)
   - Bounce rate (%)
   - Open rate (%) - if tracking enabled
   - Click rate (%) - if tracking enabled
   - Failed deliveries with reasons
   
   **In-App Notifications:**
   - Total notifications sent
   - Read rate (%)
   - Average time to read
   - Dismissed notifications
   
   **SMS Statistics (if enabled):**
   - Total SMS sent
   - Delivery rate
   - Failed deliveries
   - Cost summary
   
   **Broadcast Performance:**
   - Active broadcasts
   - Total views
   - Engagement rate
   - Top performing broadcasts

3. System displays charts:
   - Notification volume over time (line chart)
   - Delivery success rate trend
   - Notifications by type (pie chart)
4. Admin can filter statistics by date range
5. Admin can export statistics report

**Sub Use Case 11.6: Configure Notification Rules**
1. Admin clicks "Settings" tab
2. System displays notification rules configuration:
   
   **Auto-Notification Triggers:**
   - New user registration → Send welcome email
   - Job application submitted → Confirm to applicant, notify employer
   - Application status changed → Notify applicant
   - Job posting approved → Notify employer
   - Referral created → Notify applicant and employer
   - Account verification → Send verification link
   - Password reset requested → Send reset link
   
   **Notification Timing:**
   - Immediate (real-time)
   - Batched (daily digest)
   - Business hours only (schedule window)
   
   **User Preferences Override:**
   - Allow users to opt-out of non-critical notifications
   - Respect user email preferences
   - Frequency limiting (max emails per day per user)
   
   **Escalation Rules:**
   - Send admin alert if email fails repeatedly
   - Re-send notification if not read after X days
   - SMS fallback if email fails (optional)

3. Admin enables/disables specific notification rules
4. Admin configures timing and frequency settings
5. Admin clicks "Save Rules" button
6. System updates notification engine configuration
7. Future notifications follow new rules

**Sub Use Case 11.7: Handle User Support Requests**
1. Users submit support requests through system contact form
2. System creates notification for admin
3. Admin sees notification in inbox with "Support Request" label
4. Admin clicks to view support request details:
   - User information (name, email, role)
   - Subject
   - Message content
   - Timestamp
   - Attachments (if any)
5. Admin clicks "Reply" button
6. System opens reply form with:
   - Original message quoted
   - Reply text area
   - Option to close/resolve request
   - Mark as spam/invalid
7. Admin composes reply
8. Admin clicks "Send Reply" button
9. System sends email to user
10. System creates notification for user in-app
11. System updates support request status to "Responded"
12. User receives reply via email and in-app notification

**Sub Use Case 11.8: Send Job Alerts to Applicants**
1. Admin identifies new job postings matching applicant profiles
2. Admin clicks "Send Job Alerts" button
3. System displays job alert configuration:
   - Select job posting(s)
   - Target audience:
     * All active applicants
     * Applicants matching job criteria
     * Custom applicant list
   - Message template (default or custom)
4. Admin configures job alert
5. Admin clicks "Preview Recipients" button
6. System shows count and list of applicants who will receive alert
7. Admin reviews and clicks "Send Job Alerts" button
8. System processes job alerts:
   - Matches applicants to jobs based on:
     * Skills match
     * Location preference
     * Salary expectation
     * Employment type preference
   - Creates personalized notification for each applicant
   - Sends email with job details and apply link
9. System tracks job alert metrics:
   - Emails sent
   - Emails opened
   - Application conversions from alert
10. System displays sending progress and completion summary

**Alternative Flows:**

**A1: Email Delivery Failure**
- At step 8 of Sub Use Case 11.2:
  - SMTP server returns error
  - System logs failure reason
  - System retries 3 times with exponential backoff
  - If still failing, system:
    * Sends in-app notification only
    * Alerts admin of email system issue
    * Queues message for later retry

**A2: Invalid Email Template**
- At step 10 of Sub Use Case 11.4:
  - System detects syntax error or missing required variable
  - System displays validation error
  - System highlights problematic section
  - Admin must fix error before saving

**A3: User Has Opted Out**
- When sending notification:
  - System checks user preferences
  - User has disabled this notification type
  - System skips sending email but:
    * Still creates in-app notification (critical only)
    * Logs opt-out skip
    * Admin sees "not sent due to user preference" status

**A4: Broadcast Overlap**
- At step 7 of Sub Use Case 11.3:
  - System detects another broadcast active with overlapping audience
  - System displays warning "Users may see multiple broadcasts"
  - Admin can:
    * Proceed anyway
    * Schedule broadcast for after current one ends
    * Modify audience to avoid overlap

**Postconditions:**
- Users receive timely, relevant notifications
- Admin maintains communication history
- Notification delivery is tracked and logged
- Templates are version-controlled
- User preferences are respected
- Support requests are handled and closed

**Business Rules:**
- Critical notifications (password reset, security) cannot be disabled by users
- Notification frequency limited to prevent spam (max 5 emails/day per user)
- Broadcast messages expire automatically after end date
- Templates support multiple languages (if multi-language enabled)
- All communication logged for audit and compliance
- User opt-out honored except for legal/security notifications
- Failed email deliveries trigger automatic retry (3 attempts)
- Notification metrics retained for 90 days
- Support requests must be responded to within 48 hours (policy)
- Job alerts sent only to active applicants looking for work

---

### Use Case 12: System Health Monitoring

**Actor:** Admin User (System Administrator)

**Preconditions:**
- Admin is authenticated with system admin privileges
- Monitoring tools are enabled

**Main Flow:**
1. Admin clicks "System Health" or "Monitoring" in sidebar
2. System displays health monitoring dashboard
3. System shows real-time system metrics:
   - Server Status (Online, Degraded, Offline)
   - CPU Usage (%)
   - Memory Usage (%)
   - Disk Space (used/total)
   - Database Status (Connected, Response Time)
   - Active User Sessions Count
   - API Response Time (average, p95, p99)
   - Error Rate (errors per minute)
4. System displays health indicators:
   - Green: All systems operational
   - Yellow: Degraded performance
   - Red: Critical issues detected
5. System shows recent alerts and warnings
6. Admin can drill down into specific metrics

**Sub Use Case 12.1: View Performance Metrics**
1. Admin clicks "Performance" tab
2. System displays detailed performance charts:
   - Request throughput (requests/second)
   - Response time distribution (histogram)
   - Database query performance (slow queries)
   - Cache hit rate (%)
   - Page load times
   - API endpoint performance breakdown
3. System allows time range selection (last hour, day, week, month)
4. Admin can identify performance bottlenecks
5. Admin can export performance reports

**Sub Use Case 12.2: View Error Logs and Alerts**
1. Admin clicks "Errors" tab
2. System displays error dashboard:
   - Error count by severity (Critical, Error, Warning)
   - Recent errors list with timestamps
   - Error trend chart (over time)
   - Most common errors (grouped)
3. Admin clicks on error to view details:
   - Full error message and stack trace
   - User and request context
   - Affected functionality
   - Suggested resolution
4. Admin can:
   - Mark error as resolved
   - Assign error to team member
   - Create issue ticket
   - Add notes

**Sub Use Case 12.3: Perform Health Check**
1. Admin clicks "Run Health Check" button
2. System performs comprehensive health check:
   - Database connectivity test
   - External API connectivity (email, SMS, etc.)
   - Disk space check
   - Backup system check
   - Security certificate validity
   - Configuration validation
3. System displays health check results:
   - Passed checks (green checkmarks)
   - Failed checks (red X with details)
   - Warnings (yellow caution)
4. System provides recommendations for failed checks
5. Admin can export health check report

**Postconditions:**
- Admin is aware of system health status
- Performance issues are identified
- Errors are tracked and can be resolved
- System uptime is monitored

**Business Rules:**
- Health dashboard updates every 60 seconds
- Critical alerts trigger immediate admin notification
- Performance data retained for 30 days
- Health checks run automatically every 15 minutes
- System automatically attempts recovery for known issues

---

## PART 3/3 END

---

## Summary and Conclusion

This comprehensive use case document covers all administrative functions in the GensanWorks system, organized into 12 major use cases:

**Part 1 - Authentication & User Management:**
1. Admin Authentication
2. Dashboard Summary
3. Manage Applicant Accounts
4. Manage Employer Accounts

**Part 2 - Job Posting & Application Management:**
5. Manage Job Postings
6. Manage Job Applications
7. Manage Referrals

**Part 3 - Analytics, Reporting & System Administration:**
8. View Analytics and Dashboards
9. Generate and Manage Reports
10. Manage System Configuration
11. Manage Notifications and Communications
12. System Health Monitoring

### Key Characteristics of These Use Cases:

- **Comprehensive Coverage**: All admin functions from authentication to system monitoring
- **Detailed Workflows**: Step-by-step main flows and sub-use cases
- **Error Handling**: Alternative flows for exceptions and edge cases
- **Business Rules**: Governance and policy enforcement
- **Audit Trail**: Logging and compliance requirements
- **Scalability**: Bulk operations and performance considerations
- **Security**: Access control, validation, and data protection
- **Integration**: External system connections and data exchange
- **Reporting**: Multiple report types for different stakeholders
- **User Experience**: Notifications, feedback, and guidance

### Implementation Notes:

These use cases serve as:
- Requirements specification for development
- Test case basis for QA
- Training material for admin users
- Documentation for system audits
- Reference for maintenance and enhancement

Each use case should be implemented with proper:
- Input validation
- Error handling
- Logging and audit trails
- User feedback (notifications, confirmations)
- Performance optimization
- Security controls

---

**Document Version:** 1.0  
**Last Updated:** November 28, 2025  
**Author:** GensanWorks Development Team  
**Status:** Complete
