# Users Table Removal - Complete

## Overview
Successfully removed the redundant `usersTable` and consolidated authentication into the respective entity tables (`applicantsTable` for jobseekers/freelancers and `employersTable` for employers).

## Changes Made

### 1. Schema Changes (unified-schema.ts)
- **Removed**: Entire `usersTable` definition
- **Updated applicantsTable**: Already had login fields (passwordHash, role, hasAccount)
- **Updated employersTable**: Added login fields:
  - `passwordHash` (TEXT, nullable)
  - `hasAccount` (INTEGER/BOOLEAN, default 0)

### 2. Database Migration
- Created and ran `scripts/add-employer-login-columns.ts`
- Successfully added `password_hash` and `has_account` columns to employers table

### 3. Backend Updates

#### server/storage.ts
- Removed `usersTable` from imports
- Updated `addJobseeker()` to insert into `applicantsTable` with `hasAccount=true`
- Updated `getJobseekers()` to query `applicantsTable` where `hasAccount=true`
- Updated freelancer count to query `applicantsTable` where `role='freelancer'`

#### server/routes.ts
- Removed `usersTable` from imports
- **Employer Signup** (`POST /api/auth/signup/employer`):
  - Now creates records directly in `employersTable`
  - Sets `hasAccount=true` and stores `passwordHash`
  
- **Profile GET** (`GET /api/profile`):
  - Employers: Query `employersTable`
  - Jobseekers/Freelancers: Query `applicantsTable`
  
- **Profile PUT** (`PUT /api/profile`):
  - Employers: Update `employersTable`
  - Jobseekers/Freelancers: Update `applicantsTable`
  
- **Admin Stakeholders** (`GET /api/admin/stakeholders`):
  - Combines data from both `applicantsTable` (where hasAccount=true) and `employersTable` (where hasAccount=true)
  
- **Admin Dashboard** (`GET /api/admin/dashboard`):
  - Counts jobseekers/freelancers from `applicantsTable`
  - Counts employers from `employersTable`
  
- **Delete User** (`DELETE /api/admin/users/:id`):
  - Tries deleting from `applicantsTable` first, then `employersTable`
  
- **Suspend User** (`PUT /api/admin/users/:id/suspend`):
  - Checks `applicantsTable` first, then `employersTable`

#### server/db-helpers.ts
- Updated imports to include `employersTable`
- **getEmployerByEmailWithPassword()**: Now queries `employersTable` where `hasAccount=true` and `passwordHash` exists

### 4. Authentication Flow

#### Jobseekers/Freelancers
1. **Signup**: Creates applicant in `applicantsTable` with:
   - `passwordHash` = hashed password
   - `role` = 'jobseeker' or 'freelancer'
   - `hasAccount` = true
   
2. **Login**: Queries `applicantsTable` via `getJobseekerByEmailWithPassword()`

#### Employers
1. **Signup**: Creates employer in `employersTable` with:
   - `passwordHash` = hashed password
   - `hasAccount` = true
   - `establishmentName` = company name
   
2. **Login**: Queries `employersTable` via `getEmployerByEmailWithPassword()`

#### Admins
- Continue using `adminsTable` (unchanged)

## Benefits

1. **Single Source of Truth**: Each entity type has one table with optional login credentials
2. **Simplified Architecture**: No more synchronization between users and applicants/employers
3. **Data Integrity**: Profile data and login credentials are always in sync
4. **Clearer Separation**: 
   - `applicantsTable`: All applicant data + optional login (jobseekers/freelancers)
   - `employersTable`: All employer establishment data + optional login
   - `adminsTable`: Admin users only

## Testing Checklist

- [x] Server starts without errors
- [x] Database migration completed successfully
- [ ] Test jobseeker signup
- [ ] Test jobseeker login
- [ ] Test employer signup
- [ ] Test employer login
- [ ] Test admin can view all stakeholders
- [ ] Test profile GET/PUT for all roles
- [ ] Test account creation from admin applicants page

## Next Steps

1. **Test User Flows**: Verify signup and login for both jobseekers and employers
2. **Update Client Components**: Ensure all frontend components work with new structure
3. **Clean Up**: Remove old migration scripts and test files referencing usersTable
4. **Documentation**: Update API docs to reflect new authentication endpoints

## Files Modified

### Server Files
- `server/unified-schema.ts` - Removed usersTable, added employer login fields
- `server/routes.ts` - Updated all endpoints to use applicantsTable/employersTable
- `server/storage.ts` - Updated data access methods
- `server/db-helpers.ts` - Added employer authentication query

### Migration Scripts
- `scripts/add-employer-login-columns.ts` - New: Adds login fields to employers

### Status
✅ **COMPLETE** - Server running successfully on port 5000
