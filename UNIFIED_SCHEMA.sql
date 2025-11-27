/**
 * ============================================================================
 * GENSAN WORKS ADMIN - UNIFIED DATABASE SCHEMA
 * ============================================================================
 * 
 * This is the SINGLE SOURCE OF TRUTH for all database structures.
 * All tables are defined here in one place for easy debugging and maintenance.
 * 
 * SUPPORTS:
 * - SQLite (Development)
 * - PostgreSQL (Production)
 * 
 * ============================================================================
 * TABLE STRUCTURE OVERVIEW
 * ============================================================================
 * 
 * 1. ADMINS
 *    - Admin user authentication and management
 *    - Fields: id, name, email, passwordHash, role, timestamps
 * 
 * 2. USERS
 *    - Jobseekers, Freelancers, and Employers
 *    - Fields: id, name, email, passwordHash, role, company, profileData, timestamps
 * 
 * 3. APPLICANTS
 *    - NSRP Form applicant registrations with detailed personal information
 *    - Fields: id, surname, firstName, middleName, suffix, dateOfBirth, sex, 
 *              religion, civilStatus, height, contactNumber, email, disability,
 *              address, location (barangay/municipality/province), employment info,
 *              education (JSON), technicalTraining (JSON), languageProficiency (JSON),
 *              workExperience (JSON), skills (JSON), timestamps
 * 
 * 4. EMPLOYERS
 *    - SRS Form 2: Employer establishment information
 *    - Fields: id, establishmentName, address, contactNumber, email, 
 *              employeeCount, vacancies, industryType (JSON),
 *              company info (TIN, business permit), contact persons (chairperson, secretary),
 *              form metadata, isManpowerAgency, archived status, timestamps
 * 
 * 5. JOB_VACANCIES
 *    - SRS Form 2A: Job vacancy postings
 *    - Fields: id, employerId, establishmentName, positionTitle, numberOfVacancies,
 *              industryType (JSON), educationRequired, skillRequired, experience,
 *              agePreference, salaryRange, benefits (JSON), jobDescription,
 *              form metadata, timestamps
 * 
 * 6. REFERRALS
 *    - Referral slip tracking (applicant → job vacancy)
 *    - Fields: referralId, applicantId, applicant (name), employerId, employer (name),
 *              vacancyId, vacancy (title), barangay, jobCategory, dateReferred,
 *              status (Pending/Hired/Rejected/For Interview/Withdrawn),
 *              feedback, referralSlipNumber, PESO officer info, timestamps
 * 
 * 7. NOTES
 *    - Simple note-taking system for administrators
 *    - Fields: id, title, body, timestamps
 * 
 * 8. JOBS (Legacy)
 *    - Legacy job postings (kept for backward compatibility)
 *    - Fields: id, employerId, title, description, location, salaryRange, status, timestamps
 * 
 * 9. APPLICATIONS
 *    - Job application tracking
 *    - Fields: id, jobId, applicantName, employerId, resumeUrl, 
 *              status (pending/reviewed/accepted/rejected/Hired/Rejected/For Interview/Withdrawn),
 *              notes, feedback, timestamps
 * 
 * 10. SESSIONS
 *     - Express session storage for authentication
 *     - Fields: sid (session ID), sess (JSON session data), expire (timestamp)
 * 
 * ============================================================================
 * RELATIONSHIP DIAGRAM
 * ============================================================================
 * 
 * ADMINS
 *   └─ (manages) APPLICANTS, EMPLOYERS, JOB_VACANCIES, REFERRALS, NOTES
 * 
 * USERS
 *   ├─ (jobseeker) → APPLICANTS
 *   └─ (employer) → EMPLOYERS
 * 
 * APPLICANTS
 *   └─ (referred to) → REFERRALS
 * 
 * EMPLOYERS
 *   ├─ (posts) → JOB_VACANCIES
 *   └─ (receives) → REFERRALS
 * 
 * JOB_VACANCIES
 *   ├─ (from) → EMPLOYERS
 *   └─ (referenced in) → REFERRALS
 * 
 * REFERRALS
 *   ├─ (from) → APPLICANTS
 *   ├─ (to) → EMPLOYERS
 *   └─ (for) → JOB_VACANCIES
 * 
 * ============================================================================
 */

-- ============================================================================
-- 1. ADMINS TABLE
-- ============================================================================
-- Purpose: Store admin user credentials for system administration
-- Used by: Authentication system, admin login
-- 
CREATE TABLE admins (
    -- Primary identifier for admin user
    id TEXT PRIMARY KEY,
    
    -- Admin's full name
    name TEXT NOT NULL,
    
    -- Email address (unique login identifier)
    email TEXT NOT NULL UNIQUE,
    
    -- Bcrypt hashed password for security
    password_hash TEXT NOT NULL,
    
    -- Role of the admin (always "admin" for now, extensible for future roles)
    role TEXT NOT NULL DEFAULT 'admin',
    
    -- Timestamp when admin account was created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Timestamp when admin account was last updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);


-- ============================================================================
-- 2. USERS TABLE
-- ============================================================================
-- Purpose: Store user accounts for jobseekers, freelancers, and employers
-- Used by: Authentication system, user management
-- 
CREATE TABLE users (
    -- Primary identifier for user
    id TEXT PRIMARY KEY,
    
    -- User's full name
    name TEXT NOT NULL,
    
    -- Email address (unique login identifier)
    email TEXT NOT NULL UNIQUE,
    
    -- Bcrypt hashed password for security
    password_hash TEXT NOT NULL,
    
    -- User role: 'jobseeker', 'freelancer', or 'employer'
    role TEXT NOT NULL CHECK(role IN ('jobseeker', 'freelancer', 'employer')),
    
    -- Company name (optional, mainly for employers)
    company TEXT,
    
    -- Additional profile data stored as JSON
    -- Structure depends on user role
    -- Example: {"phone": "09123456789", "address": "..."}
    profile_data JSON,
    
    -- Timestamp when user account was created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Timestamp when user account was last updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for role-based queries (e.g., "get all employers")
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);


-- ============================================================================
-- 3. APPLICANTS TABLE
-- ============================================================================
-- Purpose: Store NSRP Form applicant registration data with personal details
-- Used by: Applicant management, referral system, dashboard statistics
-- 
CREATE TABLE applicants (
    -- Primary identifier for applicant
    id TEXT PRIMARY KEY,
    
    -- Surname / Last name
    surname TEXT NOT NULL,
    
    -- First name
    first_name TEXT NOT NULL,
    
    -- Middle name (optional)
    middle_name TEXT,
    
    -- Name suffix (e.g., "Jr.", "Sr.", "III")
    suffix TEXT,
    
    -- Date of birth in ISO format (YYYY-MM-DD)
    date_of_birth TEXT,
    
    -- Sex/Gender (e.g., "Male", "Female")
    sex TEXT,
    
    -- Religion affiliation
    religion TEXT,
    
    -- Civil status (e.g., "Single", "Married", "Divorced", "Widowed")
    civil_status TEXT,
    
    -- Height (can be in cm or feet'inches format)
    height TEXT,
    
    -- Contact phone number
    contact_number TEXT,
    
    -- Email address for contact
    email TEXT,
    
    -- Disability information (if any)
    disability TEXT,
    
    -- Street address
    address TEXT,
    
    -- Barangay (village-level administrative division in Philippines)
    barangay TEXT,
    
    -- Municipality/City
    municipality TEXT,
    
    -- Province
    province TEXT,
    
    -- Current employment status (e.g., "Employed", "Unemployed", "Self-employed")
    employment_status TEXT,
    
    -- Type of employment (e.g., "Full-time", "Part-time", "Casual", "Contract")
    employment_type TEXT,
    
    -- Is Overseas Filipino Worker (OFW)?
    is_ofw BOOLEAN DEFAULT false,
    
    -- Is beneficiary of 4Ps (Pantawid Pamilyangsang Pilipino Program)?
    is_4ps_beneficiary BOOLEAN DEFAULT false,
    
    -- Education records stored as JSON array
    -- Structure: [{ level, schoolName, yearGraduated, honors }, ...]
    -- Example: [{"level": "Bachelor's", "schoolName": "UP", "yearGraduated": 2020, "honors": "Cum Laude"}]
    education JSON,
    
    -- Technical training records stored as JSON array
    -- Structure: [{ trainingName, provider, yearCompleted, certificate }, ...]
    technical_training JSON,
    
    -- Language proficiency records stored as JSON array
    -- Structure: [{ language, proficiency }, ...]
    -- Example: [{"language": "English", "proficiency": "Fluent"}, {"language": "Filipino", "proficiency": "Native"}]
    language_proficiency JSON,
    
    -- Work experience records stored as JSON array
    -- Structure: [{ company, position, startYear, endYear, description }, ...]
    work_experience JSON,
    
    -- Skills list stored as JSON array
    -- Structure: [{ skill, proficiency }, ...]
    -- Example: [{"skill": "Project Management", "proficiency": "Intermediate"}]
    skills JSON,
    
    -- Timestamp when applicant was registered
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Timestamp when applicant info was last updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for faster name lookups
CREATE INDEX IF NOT EXISTS idx_applicants_surname ON applicants(surname);

-- Index for employment status queries (e.g., "get all employed applicants")
CREATE INDEX IF NOT EXISTS idx_applicants_employment_status ON applicants(employment_status);

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_applicants_barangay ON applicants(barangay);


-- ============================================================================
-- 4. EMPLOYERS TABLE
-- ============================================================================
-- Purpose: Store SRS Form 2 employer establishment information
-- Used by: Employer management, job vacancy posting, referral system
-- 
CREATE TABLE employers (
    -- Primary identifier for employer
    id TEXT PRIMARY KEY,
    
    -- Legal establishment name
    establishment_name TEXT NOT NULL,
    
    -- House number, street, or village address
    house_street_village TEXT,
    
    -- Barangay (village-level administrative division in Philippines)
    barangay TEXT,
    
    -- Municipality/City
    municipality TEXT,
    
    -- Province
    province TEXT,
    
    -- Contact phone number
    contact_number TEXT,
    
    -- Email address for contact
    email TEXT,
    
    -- Number of currently paid employees
    number_of_paid_employees INTEGER,
    
    -- Number of vacant positions available
    number_of_vacant_positions INTEGER,
    
    -- Industry type stored as JSON array
    -- Structure: ["Manufacturing", "IT", "Retail", ...]
    industry_type JSON,
    
    -- Is the employer an SRS subscriber?
    srs_subscriber BOOLEAN DEFAULT false,
    
    -- Company TIN (Tax Identification Number)
    company_tin TEXT,
    
    -- Business permit number
    business_permit_number TEXT,
    
    -- BIR 2303 form number
    bir2303_number TEXT,
    
    -- Name of chairperson/owner/head
    chairperson_name TEXT,
    
    -- Contact number of chairperson
    chairperson_contact TEXT,
    
    -- Name of secretary/representative
    secretary_name TEXT,
    
    -- Contact number of secretary
    secretary_contact TEXT,
    
    -- Name of person who prepared the form
    prepared_by_name TEXT,
    
    -- Designation of person who prepared the form
    prepared_by_designation TEXT,
    
    -- Contact number of person who prepared the form
    prepared_by_contact TEXT,
    
    -- Date form was accomplished (ISO format: YYYY-MM-DD)
    date_accomplished TEXT,
    
    -- Additional remarks or notes
    remarks TEXT,
    
    -- Is this a manpower/recruitment agency?
    is_manpower_agency BOOLEAN DEFAULT false,
    
    -- DOLE (Department of Labor and Employment) certification number (if applicable)
    dole_certification_number TEXT,
    
    -- Is this employer archived/inactive?
    archived BOOLEAN DEFAULT false,
    
    -- Timestamp when employer was archived (NULL if still active)
    archived_at TIMESTAMP,
    
    -- Timestamp when employer record was created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Timestamp when employer record was last updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for faster establishment name lookups
CREATE INDEX IF NOT EXISTS idx_employers_establishment ON employers(establishment_name);

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_employers_barangay ON employers(barangay);

-- Index for archived status (to quickly filter active employers)
CREATE INDEX IF NOT EXISTS idx_employers_archived ON employers(archived);


-- ============================================================================
-- 5. JOB_VACANCIES TABLE
-- ============================================================================
-- Purpose: Store SRS Form 2A job vacancy postings from employers
-- Used by: Job posting management, vacancy listings, referral system
-- 
CREATE TABLE job_vacancies (
    -- Primary identifier for job vacancy
    id TEXT PRIMARY KEY,
    
    -- ID of the employer posting this vacancy
    employer_id TEXT NOT NULL,
    
    -- Name of the establishment (denormalized from employers table for quick access)
    establishment_name TEXT NOT NULL,
    
    -- Job position title (e.g., "Software Engineer", "Nurse", "Accountant")
    position_title TEXT NOT NULL,
    
    -- Number of positions available for this vacancy
    number_of_vacancies INTEGER,
    
    -- Industry type stored as JSON array
    -- Structure: ["Manufacturing", "IT", "Retail", ...]
    industry_type JSON,
    
    -- Minimum education required (e.g., "High School", "Bachelor's Degree", "Master's Degree")
    minimum_education_required TEXT,
    
    -- Main skill or specialization required
    main_skill_or_specialization TEXT,
    
    -- Years of experience required
    years_of_experience_required INTEGER,
    
    -- Age preference/requirement (e.g., "18-30", "No age limit")
    age_preference TEXT,
    
    -- Starting salary or wage (numeric value)
    starting_salary_or_wage REAL,
    
    -- Salary period type (e.g., "Monthly", "Daily", "Hourly")
    salary_type TEXT,
    
    -- Current job status (e.g., "Active", "Filled", "Closed", "On Hold")
    job_status TEXT,
    
    -- Benefits offered stored as JSON array
    -- Structure: [{"benefit": "Health Insurance"}, {"benefit": "13th Month Pay"}, ...]
    benefits JSON,
    
    -- Additional requirements or qualifications
    additional_requirements TEXT,
    
    -- Full job description
    job_description TEXT,
    
    -- Name of person who prepared the form
    prepared_by_name TEXT,
    
    -- Designation of person who prepared the form
    prepared_by_designation TEXT,
    
    -- Contact number of person who prepared the form
    prepared_by_contact TEXT,
    
    -- Date form was accomplished (ISO format: YYYY-MM-DD)
    date_accomplished TEXT,
    
    -- Timestamp when vacancy was posted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Timestamp when vacancy was last updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for faster employer lookups (to find all vacancies from a specific employer)
CREATE INDEX IF NOT EXISTS idx_vacancies_employer_id ON job_vacancies(employer_id);

-- Index for job status queries (e.g., "get all active vacancies")
CREATE INDEX IF NOT EXISTS idx_vacancies_status ON job_vacancies(job_status);

-- Index for position title searches
CREATE INDEX IF NOT EXISTS idx_vacancies_position ON job_vacancies(position_title);


-- ============================================================================
-- 6. REFERRALS TABLE
-- ============================================================================
-- Purpose: Track referral slips (applicant → job vacancy) for employment matching
-- Used by: Referral system, employment tracking, referral slip generation
-- 
CREATE TABLE referrals (
    -- Unique identifier for the referral
    referral_id TEXT PRIMARY KEY,
    
    -- ID of the applicant being referred
    applicant_id TEXT NOT NULL,
    
    -- Name of the applicant (denormalized for quick access)
    applicant TEXT NOT NULL,
    
    -- ID of the employer receiving the referral (optional, can be NULL)
    employer_id TEXT,
    
    -- Name of the employer (denormalized for quick access)
    employer TEXT,
    
    -- ID of the job vacancy being referred for (optional, can be NULL)
    vacancy_id TEXT,
    
    -- Title of the job vacancy (denormalized for quick access)
    vacancy TEXT,
    
    -- Barangay where the referral was made
    barangay TEXT,
    
    -- Job category or field
    job_category TEXT,
    
    -- Date the referral was made (ISO format: YYYY-MM-DD)
    date_referred TEXT,
    
    -- Current status of the referral
    -- Values: 'Pending', 'Hired', 'Rejected', 'For Interview', 'Withdrawn'
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Hired', 'Rejected', 'For Interview', 'Withdrawn')),
    
    -- Feedback from employer about the referral (optional)
    feedback TEXT,
    
    -- Unique referral slip number for official documentation
    referral_slip_number TEXT UNIQUE,
    
    -- Name of the PESO (Public Employment Service Office) officer who made the referral
    peso_officer_name TEXT,
    
    -- Designation of the PESO officer
    peso_officer_designation TEXT,
    
    -- Timestamp when referral was created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Timestamp when referral was last updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for applicant lookups (to find all referrals for a specific applicant)
CREATE INDEX IF NOT EXISTS idx_referrals_applicant_id ON referrals(applicant_id);

-- Index for employer lookups (to find all referrals sent to a specific employer)
CREATE INDEX IF NOT EXISTS idx_referrals_employer_id ON referrals(employer_id);

-- Index for status queries (e.g., "get all hired referrals")
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Index for referral slip number lookups
CREATE INDEX IF NOT EXISTS idx_referrals_slip_number ON referrals(referral_slip_number);


-- ============================================================================
-- 7. NOTES TABLE
-- ============================================================================
-- Purpose: Simple note-taking system for administrators
-- Used by: Admin notes, documentation, system notes
-- 
CREATE TABLE notes (
    -- Primary identifier for the note
    id TEXT PRIMARY KEY,
    
    -- Title of the note
    title TEXT NOT NULL,
    
    -- Body content of the note
    body TEXT NOT NULL,
    
    -- Timestamp when note was created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Timestamp when note was last updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for faster note searches
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);


-- ============================================================================
-- 8. JOBS TABLE (LEGACY)
-- ============================================================================
-- Purpose: Legacy job postings (kept for backward compatibility with older code)
-- Used by: Legacy job posting system
-- Note: Consider consolidating with JOB_VACANCIES for future versions
-- 
CREATE TABLE jobs (
    -- Primary identifier for the job
    id TEXT PRIMARY KEY,
    
    -- ID of the employer posting the job
    employer_id TEXT NOT NULL,
    
    -- Job title
    title TEXT NOT NULL,
    
    -- Job description
    description TEXT NOT NULL,
    
    -- Job location
    location TEXT,
    
    -- Minimum salary
    salary_min INTEGER,
    
    -- Maximum salary
    salary_max INTEGER,
    
    -- Job status: 'active', 'closed', or 'draft'
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'closed', 'draft')),
    
    -- Timestamp when job was posted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Timestamp when job was last updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for employer lookups
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);

-- Index for job status queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);


-- ============================================================================
-- 9. APPLICATIONS TABLE
-- ============================================================================
-- Purpose: Track job applications from applicants to employers
-- Used by: Application management, employment tracking
-- 
CREATE TABLE applications (
    -- Primary identifier for the application
    id TEXT PRIMARY KEY,
    
    -- ID of the job being applied for
    job_id TEXT NOT NULL,
    
    -- Name of the applicant (denormalized for quick access)
    applicant_name TEXT,
    
    -- ID of the employer receiving the application (optional)
    employer_id TEXT,
    
    -- URL to the applicant's resume/CV
    resume_url TEXT,
    
    -- Status of the application
    -- Values: 'pending', 'reviewed', 'accepted', 'rejected', 'Hired', 'Rejected', 'For Interview', 'Withdrawn'
    status TEXT NOT NULL DEFAULT 'pending' CHECK(
        status IN ('pending', 'reviewed', 'accepted', 'rejected', 'Hired', 'Rejected', 'For Interview', 'Withdrawn')
    ),
    
    -- Notes about the application
    notes TEXT,
    
    -- Feedback from employer
    feedback TEXT,
    
    -- Timestamp when application was submitted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Timestamp when application was last updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for job lookups (to find all applications for a specific job)
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);

-- Index for employer lookups
CREATE INDEX IF NOT EXISTS idx_applications_employer_id ON applications(employer_id);

-- Index for application status queries
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);


-- ============================================================================
-- 10. SESSIONS TABLE
-- ============================================================================
-- Purpose: Store Express session data for user authentication
-- Used by: Authentication system, user sessions
-- Note: Managed by express-session middleware
-- 
CREATE TABLE sessions (
    -- Session ID (unique identifier for each session)
    sid TEXT PRIMARY KEY,
    
    -- Session data stored as JSON
    -- Contains: userId, userName, role, loginTime, etc.
    sess JSON NOT NULL,
    
    -- Timestamp when session expires (UNIX timestamp in milliseconds)
    expire INTEGER NOT NULL
);

-- Index for efficient session cleanup (to find expired sessions)
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);


-- ============================================================================
-- SUMMARY OF TABLES AND KEY FIELDS
-- ============================================================================
-- 
-- admins:          id, email (UNIQUE), password_hash, role, timestamps
-- users:           id, email (UNIQUE), password_hash, role, timestamps
-- applicants:      id, surname, firstName, employment_status, timestamps
-- employers:       id, establishment_name, location, archived, timestamps
-- job_vacancies:   id, employer_id, position_title, job_status, timestamps
-- referrals:       referral_id, applicant_id, employer_id, vacancy_id, status, timestamps
-- notes:           id, title, body, timestamps
-- jobs:            id, employer_id, title, status, timestamps
-- applications:    id, job_id, applicant_name, status, timestamps
-- sessions:        sid, sess (JSON), expire
-- 
-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================
-- 
-- 1. DENORMALIZATION: Some fields are denormalized (e.g., applicant name in referrals)
--    This is intentional for performance. When updating denormalized fields,
--    make sure to update both the original and all referencing records.
-- 
-- 2. JSON FIELDS: Several tables use JSON fields (education, skills, benefits, etc.)
--    These allow flexible storage of complex nested data without creating additional tables.
-- 
-- 3. TIMESTAMPS: All tables have created_at and updated_at timestamps.
--    These should be automatically managed by the application layer.
-- 
-- 4. STATUS FIELDS: Status enums are enforced at the database level using CHECK constraints.
--    This ensures data integrity.
-- 
-- 5. INDICES: Appropriate indices are created for commonly queried fields.
--    This improves query performance significantly.
-- 
-- 6. FOREIGN KEYS: Consider adding foreign key constraints in future versions:
--    - job_vacancies.employer_id → employers.id
--    - referrals.applicant_id → applicants.id
--    - referrals.employer_id → employers.id
--    - referrals.vacancy_id → job_vacancies.id
--    - jobs.employer_id → employers.id
--    - applications.job_id → jobs.id
-- 
-- ============================================================================
