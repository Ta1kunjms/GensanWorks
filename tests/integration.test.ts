/**
 * Integration Tests for GensanWorks Admin Portal
 * These tests verify key endpoints and workflows
 */

import { describe, it, expect } from '@jest/globals';

// Mock fetch for testing
const API_BASE = 'http://localhost:5000/api';

describe('Authentication Tests', () => {
  
  it('should have a health endpoint', async () => {
    const response = await fetch(`${API_BASE}/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  it('should reject login with invalid credentials', async () => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'wrongpassword',
      }),
    });
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should reject signup with weak password', async () => {
    const response = await fetch(`${API_BASE}/auth/signup/jobseeker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
        role: 'jobseeker',
      }),
    });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('MISSING_FIELD');
  });

  it('should reject signup with invalid email', async () => {
    const response = await fetch(`${API_BASE}/auth/signup/jobseeker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        password: 'ValidPass123!',
        role: 'jobseeker',
      }),
    });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.field).toBe('email');
  });
});

describe('Admin Routes Tests', () => {
  let adminToken: string;

  beforeAll(async () => {
    // Login as admin to get token
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gensanworks.com',
        password: 'AdminPassword123!',
      }),
    });
    const data = await response.json();
    adminToken = data.token;
  });

  it('should get admin stats when authenticated', async () => {
    const response = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalJobseekers');
    expect(data).toHaveProperty('totalEmployers');
    expect(data).toHaveProperty('totalJobs');
  });

  it('should reject admin endpoints without token', async () => {
    const response = await fetch(`${API_BASE}/admin/stats`);
    expect(response.status).toBe(401);
  });

  it('should list users for admin', async () => {
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should list jobs for admin', async () => {
    const response = await fetch(`${API_BASE}/admin/jobs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('Jobs CRUD Tests', () => {
  let employerToken: string;
  let employerId: string;
  let jobId: string;

  beforeAll(async () => {
    // Login as employer
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employer1@company.com',
        password: 'EmployerPass123!',
      }),
    });
    const data = await response.json();
    employerToken = data.token;
    employerId = data.user.id;
  });

  it('should list public jobs', async () => {
    const response = await fetch(`${API_BASE}/jobs`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should create a job as employer', async () => {
    const response = await fetch(`${API_BASE}/employer/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`,
      },
      body: JSON.stringify({
        title: 'Test Job Position',
        description: 'This is a test job posting',
      }),
    });
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.title).toBe('Test Job Position');
    jobId = data.id;
  });

  it('should list employer jobs', async () => {
    const response = await fetch(`${API_BASE}/employer/jobs`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.some(job => job.employerId === employerId)).toBe(true);
  });

  it('should reject job creation by non-employer', async () => {
    // Login as jobseeker
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jobseeker1@email.com',
        password: 'JobseekerPass123!',
      }),
    });
    const userData = await loginResponse.json();

    const response = await fetch(`${API_BASE}/employer/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.token}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Job',
        description: 'This should fail',
      }),
    });
    expect(response.status).toBe(403);
  });
});

describe('Jobseeker Routes Tests', () => {
  let jobseekerToken: string;
  let jobseekerUserId: string;

  beforeAll(async () => {
    // Login as jobseeker
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jobseeker1@email.com',
        password: 'JobseekerPass123!',
      }),
    });
    const data = await response.json();
    jobseekerToken = data.token;
    jobseekerUserId = data.user.id;
  });

  it('should apply to a job as jobseeker', async () => {
    // First get a job ID
    const jobsResponse = await fetch(`${API_BASE}/jobs`);
    const jobs = await jobsResponse.json();
    
    if (jobs.length > 0) {
      const jobId = jobs[0].id;
      
      const response = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jobseekerToken}` },
      });
      expect([201, 400]).toContain(response.status); // 201 created or 400 already applied
    }
  });

  it('should list jobseeker applications', async () => {
    const response = await fetch(`${API_BASE}/jobseeker/applications`, {
      headers: { Authorization: `Bearer ${jobseekerToken}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should reject application from non-jobseeker', async () => {
    // Login as admin
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gensanworks.com',
        password: 'AdminPassword123!',
      }),
    });
    const userData = await loginResponse.json();

    const jobsResponse = await fetch(`${API_BASE}/jobs`);
    const jobs = await jobsResponse.json();
    
    if (jobs.length > 0) {
      const response = await fetch(`${API_BASE}/jobs/${jobs[0].id}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userData.token}` },
      });
      expect(response.status).toBe(403);
    }
  });
});

describe('Current User Tests', () => {
  it('should get current user info with valid token', async () => {
    // Login first
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gensanworks.com',
        password: 'AdminPassword123!',
      }),
    });
    const userData = await loginResponse.json();

    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${userData.token}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user).toHaveProperty('id');
    expect(data.user).toHaveProperty('email');
    expect(data.user).toHaveProperty('role');
  });

  it('should reject /auth/me without token', async () => {
    const response = await fetch(`${API_BASE}/auth/me`);
    expect(response.status).toBe(401);
  });
});

console.log(`
✅ Test Suite Ready

To run these tests:
1. Start the dev server: npm run dev
2. In another terminal: npm test

Note: These are integration tests that require the server to be running.
Make sure to seed the database first: npm run db:seed
`);
