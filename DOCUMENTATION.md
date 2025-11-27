# 📖 GensanWorks - Complete Documentation

> Comprehensive technical documentation for the GensanWorks Employment Platform

**Version**: 1.0.0  
**Last Updated**: November 27, 2025  
**Repository**: [GensanWorks](https://github.com/Ta1kunjms/GensanWorks)

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack Details](#tech-stack-details)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Authentication & Authorization](#authentication--authorization)
7. [AI Job Matching](#ai-job-matching)
8. [Frontend Components](#frontend-components)
9. [Development Workflow](#development-workflow)
10. [Deployment Guide](#deployment-guide)
11. [Environment Variables](#environment-variables)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)
14. [Best Practices](#best-practices)
15. [FAQ](#faq)

---

## Project Overview

### What is GensanWorks?

GensanWorks is a modern, full-stack employment management platform designed specifically for General Santos City. It facilitates connections between job seekers and employers through intelligent AI-powered matching, comprehensive profile management, and real-time application tracking.

### Core Features

#### 🎯 **Multi-Role Architecture**
- **Admin Portal**: Full system management, analytics, and AI job matching
- **Employer Portal**: Job posting, applicant management, and hiring workflows
- **Job Seeker Portal**: Profile management, job search, and application tracking

#### 🤖 **AI-Powered Matching**
- Groq LLM (llama3-70b-8192) integration
- Intelligent candidate scoring based on multiple factors
- Match breakdown with strengths and concerns
- Adjustable matching thresholds

#### 📊 **Analytics & Reporting**
- Real-time dashboard with employment statistics
- Chart visualizations for trends
- NSRP-compliant reporting (SRS Form 2A)
- Referral slip generation

#### 🔐 **Security**
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Session management

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│  React 19 + TypeScript + Vite + Tailwind CSS           │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP/WebSocket
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   EXPRESS SERVER                         │
│  Node.js + Express 5 + TypeScript                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Middleware Layer                                  │ │
│  │  - Authentication (JWT)                           │ │
│  │  - CORS                                           │ │
│  │  - Body Parser                                    │ │
│  │  - Session Management                             │ │
│  │  - Error Handling                                 │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  API Routes (/api/*)                             │ │
│  │  - Auth Routes                                    │ │
│  │  - Applicant Routes                              │ │
│  │  - Employer Routes                               │ │
│  │  - Job Vacancy Routes                            │ │
│  │  - Application Routes                            │ │
│  │  - AI Matching Routes                            │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Business Logic Layer                             │ │
│  │  - Storage (Data Access)                         │ │
│  │  - AI Job Matcher (Groq)                         │ │
│  │  - Authentication Logic                          │ │
│  │  - Validation (Zod)                              │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────┘
                  │ Drizzle ORM
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   SQLite DATABASE                        │
│  app.db - Local file-based database                    │
│  Tables: applicants, employers, jobVacancies,          │
│          applications, admins, referrals, messages     │
└─────────────────────────────────────────────────────────┘

External Services:
┌───────────────────┐
│   Groq API        │  ← AI Matching Engine
│   (LLM Service)   │
└───────────────────┘
```

### Request Flow

1. **Client Request**: User interacts with React UI
2. **API Call**: React Query sends HTTP request to Express server
3. **Middleware**: Request passes through authentication/authorization
4. **Route Handler**: Appropriate route handler processes request
5. **Business Logic**: Storage layer queries database via Drizzle ORM
6. **Response**: JSON data returned to client
7. **UI Update**: React Query updates cache and re-renders components

### Monorepo Structure

```
GensanWorks/
├── client/          # Frontend application
├── server/          # Backend application
├── shared/          # Shared code (schemas, types)
├── migrations/      # Database migrations
└── scripts/         # Utility scripts
```

**Key Concept**: This is a monorepo with shared TypeScript types. Changes to `shared/schema.ts` affect both client and server.

---

## Tech Stack Details

### Frontend Stack

#### **React 19.0**
- **Why**: Latest version with improved performance and concurrent features
- **Usage**: UI component library
- **Key Files**: `client/src/App.tsx`, `client/src/main.tsx`

#### **TypeScript 5.7**
- **Why**: Type safety, better developer experience, catch errors at compile time
- **Usage**: Throughout entire codebase
- **Config**: `tsconfig.json`

#### **Vite 6.0**
- **Why**: Fast HMR (Hot Module Replacement), optimized builds
- **Usage**: Development server and production bundler
- **Config**: `vite.config.ts`
- **Dev Mode**: Runs in middleware mode with Express

#### **Tailwind CSS 3.4**
- **Why**: Utility-first CSS, rapid UI development
- **Usage**: All component styling
- **Config**: `tailwind.config.ts`
- **Key Classes**: Responsive design, dark mode support

#### **Shadcn UI (Radix UI)**
- **Why**: Accessible, customizable components
- **Usage**: Button, Card, Dialog, Select, etc.
- **Location**: `client/src/components/ui/`

#### **React Query (TanStack Query)**
- **Why**: Data fetching, caching, synchronization
- **Usage**: All API calls
- **Config**: `client/src/lib/queryClient.ts`
- **Pattern**: 
  ```typescript
  const { data, isLoading } = useQuery({
    queryKey: ['/api/endpoint'],
    queryFn: () => authFetch('/api/endpoint').then(r => r.json())
  });
  ```

#### **Wouter**
- **Why**: Lightweight routing (2KB vs React Router's 40KB)
- **Usage**: Client-side routing
- **Pattern**: `<Route path="/admin/dashboard" component={Dashboard} />`

#### **Chart.js + react-chartjs-2**
- **Why**: Rich data visualizations
- **Usage**: Dashboard charts, analytics
- **Components**: Line, Bar, Pie, Doughnut charts

#### **Lucide React**
- **Why**: Beautiful, consistent icons
- **Usage**: UI icons throughout app
- **Example**: `<User className="h-4 w-4" />`

### Backend Stack

#### **Node.js + Express 5.0**
- **Why**: Mature ecosystem, excellent for APIs
- **Usage**: Web server, API endpoints
- **Entry**: `server/index.ts`

#### **Drizzle ORM 0.40**
- **Why**: TypeScript-first ORM, great DX
- **Usage**: Database queries, migrations
- **Schema**: `server/unified-schema.ts`
- **Config**: `drizzle.config.ts`

#### **SQLite**
- **Why**: Serverless, zero-config, file-based
- **Usage**: Primary database (`app.db`)
- **Pros**: Easy deployment, no separate DB server
- **Cons**: Not for high-concurrency production

#### **Passport.js**
- **Why**: Flexible authentication middleware
- **Usage**: Login strategies
- **File**: `server/auth.ts`

#### **Zod**
- **Why**: Runtime type validation
- **Usage**: API request/response validation
- **Location**: `shared/schema.ts`
- **Pattern**: Schema-first development

#### **Groq SDK**
- **Why**: Fast, efficient LLM inference
- **Usage**: AI job matching
- **Model**: llama3-70b-8192
- **File**: `server/ai-job-matcher.ts`

#### **WebSocket (ws)**
- **Why**: Real-time updates
- **Usage**: Live notifications, status updates
- **File**: `server/websocket.ts`

### Development Tools

#### **tsx**
- **Why**: Execute TypeScript directly in Node.js
- **Usage**: `npm run dev` uses tsx to run `server/index.ts`

#### **esbuild**
- **Why**: Extremely fast bundler
- **Usage**: Production server bundling
- **Command**: `npm run build`

#### **Drizzle Kit**
- **Why**: Database migration management
- **Usage**: `npm run db:push`, `npm run db:migrate`

#### **Jest**
- **Why**: Comprehensive testing framework
- **Usage**: Unit and integration tests
- **Config**: `jest.config.js`

---

## Database Schema

### Tables Overview

The database uses SQLite with Drizzle ORM. Schema defined in `server/unified-schema.ts`.

### **applicantsTable**

Stores job seeker information.

```typescript
{
  id: string (primary key)
  firstName: string
  surname: string
  middleName: string | null
  email: string (unique)
  password: string (hashed)
  contactNumber: string
  sex: string
  age: number | null
  dateOfBirth: string | null
  barangay: string
  municipality: string
  province: string
  
  // NSRP fields (JSON arrays)
  education: JSON | null
  technicalTraining: JSON | null
  workExperience: JSON | null
  otherSkills: JSON | null
  otherSkillsSpecify: string | null
  preferredOccupations: JSON | null
  professionalLicenses: JSON | null
  
  // Legacy fields
  educationalAttainment: string | null
  course: string | null
  otherSkillsTraining: string | null
  preferredOccupation: string | null
  
  // Employment
  employmentStatus: string
  employmentType: string | null
  isOfw: boolean
  disability: string | null
  activelyLookingForWork: boolean
  willingToWorkImmediately: boolean
  whenCanStart: string | null
  expectedSalary: number | null
  
  // Profile
  profilePicture: string | null
  resume: string | null
  skills: JSON | null
  
  // Timestamps
  createdAt: string
  updatedAt: string
}
```

**Key Relationships**:
- Has many `applications`
- Referenced in `referrals`

**Indexes**: 
- `email` (unique)
- `employmentStatus`

### **employersTable**

Stores employer/company information.

```typescript
{
  id: string (primary key)
  companyName: string
  companyAddress: string
  businessPermitNumber: string | null
  industryCategory: string | null
  contactPerson: string
  email: string (unique)
  password: string (hashed)
  phoneNumber: string
  
  // Profile
  companyLogo: string | null
  companyDescription: string | null
  website: string | null
  
  // Timestamps
  createdAt: string
  updatedAt: string
  lastLogin: string | null
}
```

**Key Relationships**:
- Has many `jobVacancies`

**Indexes**:
- `email` (unique)

### **jobVacanciesTable**

Stores job postings.

```typescript
{
  id: string (primary key)
  employerId: string (foreign key → employers.id)
  
  // Job details
  positionTitle: string
  department: string | null
  industryCategory: string
  numberOfVacancies: number
  vacantPaidPositions: number | null
  educationLevel: string
  salaryMin: number | null
  salaryMax: number | null
  salaryPeriod: string | null
  
  // Requirements
  requiredSkills: JSON | null
  experienceRequired: string | null
  otherQualifications: string | null
  
  // Job info
  jobDescription: string
  employmentType: string
  workLocation: string
  benefits: JSON | null
  
  // Application
  applicationDeadline: string | null
  howToApply: string | null
  
  // Status
  status: string ('active', 'closed', 'archived')
  archived: boolean
  
  // Timestamps
  createdAt: string
  updatedAt: string
  postedDate: string
}
```

**Key Relationships**:
- Belongs to `employer`
- Has many `applications`

**Indexes**:
- `employerId`
- `status`
- `archived`

### **applicationsTable**

Tracks job applications.

```typescript
{
  id: string (primary key)
  jobVacancyId: string (foreign key → jobVacancies.id)
  applicantId: string (foreign key → applicants.id)
  
  // Application details
  status: string ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')
  appliedDate: string
  
  // Resume/cover letter
  resumeUrl: string | null
  coverLetter: string | null
  
  // Admin notes
  adminNotes: string | null
  
  // Timestamps
  createdAt: string
  updatedAt: string
}
```

**Key Relationships**:
- Belongs to `jobVacancy`
- Belongs to `applicant`

**Indexes**:
- `jobVacancyId`
- `applicantId`
- `status`
- Composite: `(jobVacancyId, applicantId)` (unique)

### **adminsTable**

Stores admin user accounts.

```typescript
{
  id: string (primary key)
  name: string
  email: string (unique)
  password: string (hashed)
  role: string ('admin', 'super_admin')
  
  // Timestamps
  createdAt: string
  updatedAt: string
  lastLogin: string | null
}
```

**Indexes**:
- `email` (unique)

### **referralsTable**

Tracks referral slips for job placements.

```typescript
{
  id: string (primary key)
  applicantId: string (foreign key → applicants.id)
  jobVacancyId: string (foreign key → jobVacancies.id)
  
  // Referral details
  referralNumber: string (unique)
  status: string ('pending', 'accepted', 'rejected', 'hired')
  referredBy: string (admin ID)
  notes: string | null
  
  // Timestamps
  createdAt: string
  updatedAt: string
}
```

**Key Relationships**:
- References `applicant`
- References `jobVacancy`

### **messagesTable**

Stores internal messaging between users.

```typescript
{
  id: string (primary key)
  senderId: string
  receiverId: string
  senderType: string ('admin', 'employer', 'jobseeker')
  receiverType: string
  
  // Message
  subject: string
  message: string
  
  // Status
  isRead: boolean
  
  // Timestamps
  createdAt: string
}
```

**Indexes**:
- `receiverId`
- `isRead`

---

## API Reference

All API endpoints are prefixed with `/api`.

### Authentication Endpoints

#### **POST /api/auth/signup**

Register a new user (jobseeker, employer, or admin).

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "jobseeker",  // or "employer" or "admin"
  
  // For jobseeker:
  "firstName": "John",
  "surname": "Doe",
  "contactNumber": "09123456789",
  "sex": "Male",
  "barangay": "Barangay Name",
  "municipality": "General Santos City",
  "province": "South Cotabato",
  
  // For employer:
  "companyName": "Tech Corp",
  "companyAddress": "123 Business St",
  "contactPerson": "Jane Smith",
  "phoneNumber": "09123456789"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "applicant_123",
    "email": "user@example.com",
    "role": "jobseeker"
  }
}
```

**Errors**:
- `400`: Validation error (missing fields, invalid email/password)
- `409`: Email already exists

---

#### **POST /api/auth/login**

Authenticate a user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "jobseeker"  // or "employer" or "admin"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "applicant_123",
    "email": "user@example.com",
    "role": "jobseeker",
    "firstName": "John",
    "surname": "Doe"
  }
}
```

**Errors**:
- `400`: Missing fields
- `401`: Invalid credentials

---

#### **GET /api/auth/me**

Get current authenticated user details.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "applicant_123",
  "email": "user@example.com",
  "role": "jobseeker",
  "firstName": "John",
  "surname": "Doe"
  // ... other user fields
}
```

**Errors**:
- `401`: Not authenticated

---

### Applicant Endpoints

#### **GET /api/applicants**

List all applicants (Admin only).

**Query Parameters**:
- `search` (string): Search by name or email
- `employmentStatus` (string): Filter by status
- `limit` (number): Results per page (default: 50)
- `offset` (number): Pagination offset

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response** (200):
```json
[
  {
    "id": "applicant_123",
    "firstName": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "contactNumber": "09123456789",
    "employmentStatus": "unemployed",
    "educationalAttainment": "Bachelor's Degree",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
  // ... more applicants
]
```

---

#### **GET /api/applicants/:id**

Get single applicant details.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "applicant_123",
  "firstName": "John",
  "surname": "Doe",
  "middleName": "Smith",
  "email": "john@example.com",
  "contactNumber": "09123456789",
  "sex": "Male",
  "age": 25,
  "dateOfBirth": "1999-05-15",
  "barangay": "Barangay Name",
  "municipality": "General Santos City",
  "province": "South Cotabato",
  
  "education": [
    {
      "level": "Bachelor's Degree",
      "school": "University Name",
      "course": "Computer Science",
      "yearGraduated": "2021"
    }
  ],
  
  "technicalTraining": [],
  "workExperience": [
    {
      "company": "Tech Corp",
      "position": "Junior Developer",
      "duration": "2 years",
      "responsibilities": "Developed web applications"
    }
  ],
  
  "skills": ["JavaScript", "React", "Node.js"],
  "employmentStatus": "employed",
  "expectedSalary": 25000,
  
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-11-27T14:30:00.000Z"
}
```

**Errors**:
- `404`: Applicant not found
- `403`: Unauthorized (can only view own profile unless admin)

---

#### **PUT /api/applicants/:id**

Update applicant profile.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body** (partial update allowed):
```json
{
  "contactNumber": "09987654321",
  "education": [...],
  "skills": ["JavaScript", "TypeScript", "Python"],
  "expectedSalary": 30000
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "applicant": { /* updated applicant object */ }
}
```

**Errors**:
- `403`: Unauthorized
- `404`: Applicant not found
- `400`: Validation error

---

### Employer Endpoints

#### **GET /api/employers**

List all employers (Admin only).

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response** (200):
```json
[
  {
    "id": "employer_123",
    "companyName": "Tech Corp",
    "email": "hr@techcorp.com",
    "industryCategory": "Information Technology",
    "contactPerson": "Jane Smith",
    "createdAt": "2025-01-10T08:00:00.000Z"
  }
]
```

---

#### **GET /api/employers/:id**

Get employer details.

**Response** (200):
```json
{
  "id": "employer_123",
  "companyName": "Tech Corp",
  "companyAddress": "123 Business St, Gensan",
  "industryCategory": "Information Technology",
  "contactPerson": "Jane Smith",
  "email": "hr@techcorp.com",
  "phoneNumber": "09123456789",
  "website": "https://techcorp.com",
  "companyDescription": "Leading tech company...",
  "createdAt": "2025-01-10T08:00:00.000Z"
}
```

---

#### **PUT /api/employers/:id**

Update employer profile.

**Request Body**:
```json
{
  "companyDescription": "Updated description",
  "website": "https://newtechcorp.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Employer profile updated",
  "employer": { /* updated employer */ }
}
```

---

### Job Vacancy Endpoints

#### **GET /api/job-vacancies**

List all job vacancies.

**Query Parameters**:
- `status` (string): Filter by status ('active', 'closed', 'archived')
- `employerId` (string): Filter by employer
- `search` (string): Search by position title
- `limit` (number): Results per page
- `offset` (number): Pagination offset

**Response** (200):
```json
{
  "vacancies": [
    {
      "id": "vacancy_123",
      "employerId": "employer_123",
      "positionTitle": "Senior Developer",
      "department": "Engineering",
      "industryCategory": "Information Technology",
      "numberOfVacancies": 3,
      "educationLevel": "Bachelor's Degree",
      "salaryMin": 40000,
      "salaryMax": 60000,
      "salaryPeriod": "monthly",
      "requiredSkills": ["React", "Node.js", "TypeScript"],
      "jobDescription": "We are looking for...",
      "employmentType": "Full-time",
      "workLocation": "General Santos City",
      "status": "active",
      "postedDate": "2025-11-20T09:00:00.000Z",
      "applicationDeadline": "2025-12-20T23:59:59.000Z"
    }
  ],
  "total": 25
}
```

---

#### **POST /api/job-vacancies**

Create a new job vacancy (Employer only).

**Headers**:
```
Authorization: Bearer <employer_token>
```

**Request Body**:
```json
{
  "positionTitle": "Senior Developer",
  "department": "Engineering",
  "industryCategory": "Information Technology",
  "numberOfVacancies": 3,
  "vacantPaidPositions": 3,
  "educationLevel": "Bachelor's Degree",
  "salaryMin": 40000,
  "salaryMax": 60000,
  "salaryPeriod": "monthly",
  "requiredSkills": ["React", "Node.js", "TypeScript"],
  "experienceRequired": "3+ years",
  "jobDescription": "Detailed job description...",
  "employmentType": "Full-time",
  "workLocation": "General Santos City",
  "applicationDeadline": "2025-12-20"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Job vacancy created",
  "vacancy": { /* created vacancy object */ }
}
```

---

#### **PUT /api/job-vacancies/:id**

Update job vacancy (Employer/Admin only).

**Request Body** (partial):
```json
{
  "status": "closed",
  "numberOfVacancies": 5
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Job vacancy updated",
  "vacancy": { /* updated vacancy */ }
}
```

---

#### **DELETE /api/job-vacancies/:id**

Archive job vacancy (soft delete).

**Response** (200):
```json
{
  "success": true,
  "message": "Job vacancy archived"
}
```

---

### Application Endpoints

#### **GET /api/applications**

List applications.

**Query Parameters**:
- `jobVacancyId` (string): Filter by job
- `applicantId` (string): Filter by applicant
- `status` (string): Filter by status

**Response** (200):
```json
[
  {
    "id": "application_123",
    "jobVacancyId": "vacancy_123",
    "applicantId": "applicant_123",
    "status": "pending",
    "appliedDate": "2025-11-25T10:00:00.000Z",
    "jobTitle": "Senior Developer",
    "applicantName": "John Doe",
    "companyName": "Tech Corp"
  }
]
```

---

#### **POST /api/applications**

Submit a job application (Job Seeker only).

**Headers**:
```
Authorization: Bearer <jobseeker_token>
```

**Request Body**:
```json
{
  "jobVacancyId": "vacancy_123",
  "coverLetter": "I am excited to apply..."
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Application submitted",
  "application": { /* application object */ }
}
```

**Errors**:
- `409`: Already applied to this job
- `404`: Job vacancy not found

---

#### **PUT /api/applications/:id**

Update application status (Employer/Admin only).

**Request Body**:
```json
{
  "status": "shortlisted",
  "adminNotes": "Strong candidate"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Application updated",
  "application": { /* updated application */ }
}
```

---

### AI Job Matching

#### **GET /api/jobs/:jobId/match**

Get AI-powered candidate matches for a job (Admin only).

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `minScore` (number): Minimum match percentage (default: 50)
- `maxResults` (number): Maximum results to return (default: 20)

**Response** (200):
```json
{
  "jobId": "vacancy_123",
  "jobTitle": "Senior Developer",
  "matches": [
    {
      "applicantId": "applicant_456",
      "applicantName": "John Doe",
      "score": 8.5,
      "percentage": 85,
      "recommendation": "Highly Recommended",
      "breakdown": {
        "skillsMatch": 0.9,
        "educationMatch": 0.85,
        "locationMatch": 1.0,
        "salaryMatch": 0.8,
        "availabilityMatch": 1.0,
        "experienceMatch": 0.75,
        "demographicMatch": 0.9
      },
      "matchedSkills": ["React", "Node.js", "TypeScript"],
      "missingSkills": ["Docker", "Kubernetes"],
      "strengths": [
        "Strong technical skill match",
        "Located in General Santos City",
        "Available immediately"
      ],
      "concerns": [
        "Salary expectation slightly above range"
      ]
    }
  ],
  "total": 15,
  "criteria": {
    "minScore": 50,
    "maxResults": 20
  }
}
```

**How It Works**:
1. Fetches job requirements from database
2. Retrieves all active job-seeking applicants
3. Sends data to Groq LLM for intelligent analysis
4. LLM scores each candidate on 7 factors
5. Returns ranked matches with detailed breakdown

**AI Model**: llama3-70b-8192 (Groq)

---

### Dashboard & Analytics

#### **GET /api/dashboard/summary**

Get dashboard statistics (Admin only).

**Response** (200):
```json
{
  "totalApplicants": 1250,
  "activeJobVacancies": 45,
  "totalApplications": 3200,
  "employedThisMonth": 32,
  "employmentRate": 68.5,
  "recentActivities": [
    {
      "type": "application",
      "message": "John Doe applied for Senior Developer",
      "timestamp": "2025-11-27T14:25:00.000Z"
    }
  ]
}
```

---

#### **GET /api/dashboard/charts/employment-status**

Get employment status distribution for charts.

**Response** (200):
```json
{
  "labels": ["Employed", "Unemployed", "Self-employed", "OFW"],
  "data": [450, 320, 180, 300]
}
```

---

## Authentication & Authorization

### JWT Token Structure

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**:
```json
{
  "id": "applicant_123",
  "email": "user@example.com",
  "role": "jobseeker",
  "iat": 1700000000,
  "exp": 1700086400
}
```

**Token Expiration**: 24 hours

### Role-Based Access Control

| Endpoint | Admin | Employer | Job Seeker |
|----------|-------|----------|------------|
| GET /api/applicants | ✅ | ❌ | ❌ (own only) |
| GET /api/employers | ✅ | ❌ (own only) | ❌ |
| POST /api/job-vacancies | ✅ | ✅ | ❌ |
| POST /api/applications | ❌ | ❌ | ✅ |
| GET /api/jobs/:id/match | ✅ | ❌ | ❌ |
| GET /api/dashboard/* | ✅ | ❌ | ❌ |

### Middleware

**Authentication Middleware** (`authMiddleware`):
- Verifies JWT token from `Authorization: Bearer <token>` header
- Decodes token and attaches user info to `req.user`
- Returns 401 if token is missing or invalid

**Role Middleware** (`roleMiddleware(role)`):
- Checks if `req.user.role` matches required role
- Returns 403 if role doesn't match

**Usage Example**:
```typescript
router.get('/api/admin/users', 
  authMiddleware,
  roleMiddleware('admin'),
  (req, res) => {
    // Handler code
  }
);
```

---

## AI Job Matching

### Overview

The AI matching system uses Groq's llama3-70b-8192 model to intelligently match candidates to job openings.

### File Location

`server/ai-job-matcher.ts`

### How It Works

1. **Input Collection**:
   - Job requirements (skills, education, salary, location, etc.)
   - Applicant profiles (education, experience, skills, availability)

2. **LLM Prompt Engineering**:
   - Detailed system prompt emphasizing objectivity
   - Structured output format (JSON)
   - Scoring criteria explanation

3. **Groq API Call**:
   ```typescript
   const completion = await groq.chat.completions.create({
     messages: [{ role: "system", content: systemPrompt }],
     model: "llama3-70b-8192",
     temperature: 0.3, // Low temperature for consistency
     response_format: { type: "json_object" }
   });
   ```

4. **Response Parsing**:
   - Extract match scores and breakdowns
   - Generate recommendations
   - Identify strengths and concerns

### Scoring Factors

Each candidate is scored on 7 factors (0.0 to 1.0):

1. **Skills Match** (30% weight):
   - Technical skills overlap
   - Required vs. available skills

2. **Education Match** (20% weight):
   - Education level requirement
   - Relevant degree/course

3. **Location Match** (10% weight):
   - Geographic proximity
   - Willingness to relocate

4. **Salary Match** (15% weight):
   - Expected vs. offered salary
   - Alignment of expectations

5. **Availability Match** (10% weight):
   - Can start immediately
   - Notice period

6. **Experience Match** (10% weight):
   - Years of relevant experience
   - Industry experience

7. **Demographic Match** (5% weight):
   - Age appropriateness
   - Other demographic factors

**Total Score** = Weighted average of factors

**Percentage** = (Total Score / 10) × 100

### Recommendation Categories

- **Highly Recommended**: 80%+
- **Recommended**: 65-79%
- **Consider**: 50-64%
- **Not Suitable**: <50%

### Example Usage

```typescript
import { matchApplicantsToJob } from './ai-job-matcher';

const matches = await matchApplicantsToJob(jobId, {
  minScore: 50,
  maxResults: 20
});
```

### Environment Setup

Add to `.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

---

## Frontend Components

### Component Structure

```
client/src/components/
├── ui/                    # Shadcn UI primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
├── app-sidebar.tsx        # Main navigation sidebar
├── ai-job-matching-modal.tsx  # AI matching results display
├── view-applicant-modal.tsx   # Applicant profile viewer
├── add-job-posting-modal.tsx  # Job creation form
└── ...
```

### Key Components

#### **AppSidebar**
- Navigation menu for all user roles
- Dynamic menu items based on role
- Collapsible sections
- Active route highlighting

**Usage**:
```tsx
import { AppSidebar } from "@/components/app-sidebar";

<AppSidebar userRole="admin" />
```

#### **AIJobMatchingModal**
- Displays AI matching results
- Expandable match details
- Score visualizations
- Match breakdown charts

**Props**:
```typescript
interface AIJobMatchingModalProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}
```

#### **ViewApplicantModal**
- Comprehensive applicant profile view
- Education, skills, experience display
- Download resume
- Action buttons (referral, contact)

**Props**:
```typescript
interface ViewApplicantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: Applicant;
}
```

### State Management

**React Query** handles all server state:

```typescript
// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/applicants'],
  queryFn: () => authFetch('/api/applicants').then(r => r.json())
});

// Mutate data
const mutation = useMutation({
  mutationFn: (data) => authFetch('/api/applicants', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  onSuccess: () => {
    queryClient.invalidateQueries(['/api/applicants']);
  }
});
```

### Form Handling

Using `react-hook-form` with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobCreateSchema } from '@shared/schema';

const form = useForm({
  resolver: zodResolver(jobCreateSchema),
  defaultValues: {
    positionTitle: '',
    numberOfVacancies: 1,
    // ...
  }
});

const onSubmit = form.handleSubmit((data) => {
  // Submit data
});
```

---

## Development Workflow

### Daily Development

1. **Start dev server**:
   ```bash
   npm run dev
   ```
   - Server runs on port 5000
   - Vite HMR for instant client updates
   - Server requires manual restart for backend changes

2. **Check types**:
   ```bash
   npm run check
   ```
   - Runs TypeScript compiler
   - Catches type errors across codebase

3. **Database changes**:
   ```bash
   # After modifying unified-schema.ts
   npm run db:push
   ```

### Adding a New Feature

#### Example: Add a "Certifications" field to applicants

1. **Update Database Schema** (`server/unified-schema.ts`):
   ```typescript
   export const applicantsTable = sqliteTable("applicants", {
     // ... existing fields
     certifications: text("certifications"), // Add this
   });
   ```

2. **Push Schema Changes**:
   ```bash
   npm run db:push
   ```

3. **Update Zod Schema** (`shared/schema.ts`):
   ```typescript
   export const applicantSchema = z.object({
     // ... existing fields
     certifications: z.array(z.object({
       name: z.string(),
       issuer: z.string(),
       dateObtained: z.string()
     })).optional()
   });
   ```

4. **Update Storage Layer** (`server/storage.ts`):
   ```typescript
   // Add certifications to queries/inserts
   ```

5. **Update API Routes** (`server/routes.ts`):
   ```typescript
   // Include certifications in responses
   ```

6. **Update Frontend** (`client/src/`):
   - Add certifications form input
   - Display certifications in profile view
   - Update TypeScript types

7. **Test**:
   ```bash
   npm run check
   npm run dev
   # Manual testing in browser
   ```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-certifications

# Make changes and commit
git add .
git commit -m "feat: add certifications field to applicant profiles"

# Push to GitHub
git push origin feature/add-certifications

# Create Pull Request on GitHub
```

### Code Style

- Use **TypeScript** for all new files
- Follow existing naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for components and types
  - `UPPER_SNAKE_CASE` for constants
- Use **Zod schemas** for validation
- Comment complex logic
- Keep functions small and focused

---

## Deployment Guide

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```
   
   This runs:
   - `vite build` → Builds client to `dist/public`
   - `esbuild server/index.ts` → Bundles server to `dist/index.js`

2. **Verify build output**:
   ```
   dist/
   ├── index.js           # Bundled server
   └── public/            # Built client
       ├── index.html
       ├── assets/
       └── ...
   ```

3. **Run production server**:
   ```bash
   npm start
   ```
   
   Runs `node dist/index.js`

### Environment Variables

Create `.env` file:

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=./app.db

# Authentication
JWT_SECRET=your_secure_random_string_here
BCRYPT_SALT_ROUNDS=10

# AI Matching
GROQ_API_KEY=your_groq_api_key_here

# Session
SESSION_SECRET=another_secure_random_string
```

**Security Notes**:
- Never commit `.env` to version control
- Use strong, random secrets in production
- Rotate secrets periodically

### Deployment Options

#### **Option 1: VPS (DigitalOcean, Linode, etc.)**

1. **Set up server**:
   ```bash
   # SSH into server
   ssh user@your-server-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

2. **Clone and build**:
   ```bash
   git clone https://github.com/Ta1kunjms/GensanWorks.git
   cd GensanWorks
   npm install
   npm run build
   ```

3. **Configure environment**:
   ```bash
   nano .env
   # Add production variables
   ```

4. **Start with PM2**:
   ```bash
   pm2 start dist/index.js --name gensanworks
   pm2 save
   pm2 startup
   ```

5. **Set up Nginx reverse proxy**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### **Option 2: Docker**

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=/app/data/app.db
      - JWT_SECRET=${JWT_SECRET}
      - GROQ_API_KEY=${GROQ_API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

Deploy:
```bash
docker-compose up -d
```

#### **Option 3: Cloud Platforms**

**Vercel/Netlify**: Not suitable (requires serverless architecture)

**Railway/Render**:
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

**Heroku**:
```bash
heroku create gensanworks
heroku config:set JWT_SECRET=xxx GROQ_API_KEY=yyy
git push heroku main
```

### Database Migration

For production, consider migrating from SQLite to PostgreSQL for better concurrency:

1. **Install PostgreSQL**:
   ```bash
   sudo apt-get install postgresql
   ```

2. **Update** `drizzle.config.ts`:
   ```typescript
   import { defineConfig } from 'drizzle-kit';

   export default defineConfig({
     schema: './server/unified-schema.ts',
     out: './migrations',
     driver: 'pg',
     dbCredentials: {
       connectionString: process.env.DATABASE_URL!
     }
   });
   ```

3. **Update connection** in `server/database.ts`:
   ```typescript
   import { drizzle } from 'drizzle-orm/node-postgres';
   import { Pool } from 'pg';

   const pool = new Pool({
     connectionString: process.env.DATABASE_URL
   });

   export const db = drizzle(pool);
   ```

---

## Environment Variables

### Complete List

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `5000` | Server port |
| `DATABASE_URL` | No | `./app.db` | Database connection |
| `JWT_SECRET` | **Yes** | - | Secret for JWT signing |
| `JWT_EXPIRES_IN` | No | `24h` | JWT expiration time |
| `BCRYPT_SALT_ROUNDS` | No | `10` | Bcrypt salt rounds |
| `SESSION_SECRET` | No | - | Express session secret |
| `GROQ_API_KEY` | **Yes** | - | Groq API key for AI matching |
| `CORS_ORIGIN` | No | `*` | CORS allowed origins |

### Development `.env` Example

```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=./app.db
JWT_SECRET=dev_secret_key_change_in_production
BCRYPT_SALT_ROUNDS=10
GROQ_API_KEY=gsk_...
SESSION_SECRET=dev_session_secret
```

### Production `.env` Example

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/gensanworks
JWT_SECRET=r4nd0m_s3cur3_k3y_h3r3
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=12
GROQ_API_KEY=gsk_prod_key_here
SESSION_SECRET=another_random_secure_string
CORS_ORIGIN=https://gensanworks.com
```

---

## Testing

### Test Structure

```
tests/
├── integration.test.ts    # API integration tests
└── unit/
    ├── auth.test.ts       # Auth logic tests
    └── matcher.test.ts    # AI matcher tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test integration.test.ts

# Watch mode
npm test -- --watch
```

### Writing Tests

Example integration test:

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../server';

describe('Applicant API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login and get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'jobseeker'
      });
    
    authToken = res.body.token;
  });

  it('should get applicant profile', async () => {
    const res = await request(app)
      .get('/api/applicants/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email');
  });

  it('should update applicant profile', async () => {
    const res = await request(app)
      .put('/api/applicants/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        contactNumber: '09999999999'
      });

    expect(res.status).toBe(200);
    expect(res.body.applicant.contactNumber).toBe('09999999999');
  });
});
```

---

## Troubleshooting

### Common Issues

#### **Port 5000 Already in Use**

**Symptom**: `EADDRINUSE: address already in use 127.0.0.1:5000`

**Solution**:
```bash
# Windows PowerShell
Get-Process node | Stop-Process -Force

# Or change port
PORT=3000 npm run dev
```

---

#### **Database Locked Error**

**Symptom**: `database is locked` errors

**Cause**: SQLite doesn't handle high concurrency well

**Solutions**:
1. Ensure only one process is accessing the database
2. Use `PRAGMA busy_timeout = 5000` in SQLite connection
3. Migrate to PostgreSQL for production

---

#### **Vite HMR Not Working**

**Symptom**: Changes not reflecting in browser

**Solutions**:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Restart dev server
4. Check browser console for errors

---

#### **TypeScript Errors After Update**

**Symptom**: Type errors after pulling latest changes

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run check
```

---

#### **AI Matching Not Working**

**Symptom**: AI matching returns errors

**Causes & Solutions**:
1. **Missing GROQ_API_KEY**: Add to `.env`
2. **Invalid API Key**: Generate new key from Groq dashboard
3. **Rate Limit**: Groq has rate limits, wait and retry
4. **Network Issues**: Check internet connection

---

#### **Authentication Failures**

**Symptom**: Login returns 401 or token invalid

**Solutions**:
1. **Expired Token**: Tokens expire after 24h, login again
2. **Wrong JWT_SECRET**: Ensure `.env` JWT_SECRET matches
3. **Database Out of Sync**: Re-seed database with `npm run db:reseed`

---

#### **Database Schema Mismatch**

**Symptom**: Errors about missing columns

**Solution**:
```bash
# Push latest schema
npm run db:push

# If persistent, backup data and recreate
mv app.db app.db.backup
npm run db:push
npm run db:seed-1232
```

---

#### **Build Failures**

**Symptom**: `npm run build` fails

**Common Causes**:
1. **TypeScript Errors**: Run `npm run check` first
2. **Missing Dependencies**: Run `npm install`
3. **Out of Memory**: Increase Node memory:
   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 npm run build
   ```

---

### Debug Mode

Enable detailed logging:

```typescript
// In server/index.ts
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

---

## Best Practices

### Code Organization

1. **Zod-First Development**:
   - Define schemas in `shared/schema.ts` first
   - Use schemas for both validation and TypeScript types
   - Single source of truth for data shapes

2. **Component Structure**:
   - Keep components small (<300 lines)
   - Extract reusable logic to custom hooks
   - Use Shadcn UI components as base

3. **API Design**:
   - RESTful conventions
   - Consistent response formats
   - Proper HTTP status codes
   - Comprehensive error messages

4. **Database Access**:
   - All queries in `storage.ts`
   - Use Drizzle's query builder
   - Avoid raw SQL unless necessary

### Security Best Practices

1. **Authentication**:
   - Always validate JWT tokens
   - Use strong JWT secrets (min 32 characters)
   - Implement token refresh for better UX

2. **Authorization**:
   - Check user roles before sensitive operations
   - Validate user owns resource before allowing edits
   - Use middleware for consistent checks

3. **Input Validation**:
   - Validate all inputs with Zod
   - Sanitize user-provided content
   - Prevent SQL injection (use ORM)

4. **Passwords**:
   - Minimum 8 characters, complexity requirements
   - Bcrypt with salt rounds 10-12
   - Never log or expose passwords

### Performance Optimization

1. **Frontend**:
   - Use React Query for caching
   - Lazy load routes and heavy components
   - Optimize images and assets
   - Minimize bundle size

2. **Backend**:
   - Add database indexes on frequently queried fields
   - Implement pagination for large datasets
   - Cache expensive operations
   - Use connection pooling for production DB

3. **Database**:
   - Index foreign keys
   - Avoid N+1 queries
   - Use database-level constraints
   - Regular VACUUM for SQLite

### Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set strong JWT_SECRET and SESSION_SECRET
- [ ] Configure CORS for production domain
- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm start`
- [ ] Set up database backups
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring and error tracking
- [ ] Document deployment procedures
- [ ] Test all critical user flows
- [ ] Verify AI matching works with production API key

---

## FAQ

### General Questions

**Q: Can I use this for other cities?**  
A: Yes! The system is generic. Just update branding and location data.

**Q: Does this require internet?**  
A: Yes, for AI matching (Groq API). Local dev works offline except for AI features.

**Q: Can I self-host this?**  
A: Absolutely. See [Deployment Guide](#deployment-guide).

**Q: What's the database size limit?**  
A: SQLite can handle up to 281 TB, but consider PostgreSQL for 10,000+ users.

### Technical Questions

**Q: Why SQLite instead of PostgreSQL?**  
A: Simplicity for development and small deployments. Migrate to PostgreSQL for production scale.

**Q: Can I add more user roles?**  
A: Yes, update `role` field in database and add role checks in middleware.

**Q: How do I add more AI models?**  
A: Modify `server/ai-job-matcher.ts` to use different Groq models or other LLM providers.

**Q: Is WebSocket necessary?**  
A: No, it's optional for real-time features. App works fine without it.

**Q: Can I use this commercially?**  
A: Yes, it's MIT licensed. See [LICENSE](LICENSE) file.

### Development Questions

**Q: How do I reset the database?**  
A: `npm run db:push && npm run db:reseed`

**Q: How do I add a new page?**  
A: Create file in `client/src/pages/`, add route in `App.tsx`.

**Q: How do I customize the theme?**  
A: Edit `tailwind.config.ts` and `client/src/index.css`.

**Q: Can I use a different UI library?**  
A: Yes, but Shadcn UI is deeply integrated. Migration would be significant effort.

---

## Additional Resources

### Official Documentation

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn UI Components](https://ui.shadcn.com)
- [Zod Documentation](https://zod.dev)
- [Groq API Reference](https://console.groq.com/docs)

### Community & Support

- **GitHub Issues**: [Report bugs](https://github.com/Ta1kunjms/GensanWorks/issues)
- **Discussions**: [Ask questions](https://github.com/Ta1kunjms/GensanWorks/discussions)
- **Email**: support@gensanworks.com

---

## Changelog

### Version 1.0.0 (November 2025)
- Initial release
- AI-powered job matching with Groq LLM
- Multi-role system (Admin, Employer, Job Seeker)
- NSRP-compliant applicant profiles
- Comprehensive dashboard and analytics
- Real-time WebSocket support
- Referral slip generation
- Stakeholder reporting

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) file for full details.

**Summary**: You can use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.

---

<div align="center">

**📖 End of Documentation**

For quick reference, see [`.github/copilot-instructions.md`](.github/copilot-instructions.md)

[⬆ Back to Top](#-gensanworks---complete-documentation)

</div>
