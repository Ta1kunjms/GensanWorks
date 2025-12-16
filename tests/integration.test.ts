/**
 * Integration Tests for GensanWorks Admin Portal
 * These tests verify key endpoints and workflows
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { startServer, stopServer } from '../server/index';

// Ensure the Express server is running for fetch-based tests
// Prefer an ephemeral port (0) to avoid collisions with dev servers; allow override via TEST_PORT
const REQUESTED_PORT = process.env.TEST_PORT ? Number(process.env.TEST_PORT) : 0;
process.env.PORT = String(REQUESTED_PORT);

let serverInstance: Server | null = null;
let apiBase = '';
beforeAll(async () => {
  serverInstance = await startServer();
  const address = serverInstance.address() as AddressInfo | null;
  const resolvedPort = address?.port || REQUESTED_PORT || 5000;
  apiBase = `http://127.0.0.1:${resolvedPort}/api`;
});

afterAll(async () => {
  await stopServer();
  serverInstance = null;
});

describe('Authentication Tests', () => {
  
  it('should have a health endpoint', async () => {
    const response = await fetch(`${apiBase}/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  it('should reject login with invalid credentials', async () => {
    const response = await fetch(`${apiBase}/auth/login`, {
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
    const response = await fetch(`${apiBase}/auth/signup/jobseeker`, {
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
    const response = await fetch(`${apiBase}/auth/signup/jobseeker`, {
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
    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@local.test',
        password: 'adminpass',
      }),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
    expect(data.token).toBeDefined();
    adminToken = data.token;
  });

  it('should get admin stats when authenticated', async () => {
    const response = await fetch(`${apiBase}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('totalJobseekers');
    expect(data).toHaveProperty('totalEmployers');
    expect(data).toHaveProperty('totalJobs');
  });

  it('should reject admin endpoints without token', async () => {
    const response = await fetch(`${apiBase}/admin/stats`);
    expect(response.status).toBe(401);
  });

  it('should list users for admin', async () => {
    const response = await fetch(`${apiBase}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should list jobs for admin', async () => {
    const response = await fetch(`${apiBase}/admin/jobs`, {
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
    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employer01@gensanworks-demo.ph',
        password: 'EmployerDemoPass123!',
      }),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.id).toBeDefined();
    employerToken = data.token;
    employerId = data.user.id;
  });

  it('should list public jobs', async () => {
    const response = await fetch(`${apiBase}/jobs`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should create a job as employer', async () => {
    const response = await fetch(`${apiBase}/employer/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`,
      },
      body: JSON.stringify({
        positionTitle: 'Test Job Position',
        description: 'This is a test job posting',
        barangay: 'Lagao',
        municipality: 'General Santos City',
        province: 'South Cotabato',
      }),
    });
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toBeDefined();
    expect(data.job).toBeDefined();
    expect(data.job.positionTitle).toBe('Test Job Position');
    expect(data.job.id).toBeDefined();
    jobId = data.job.id;
  });

  it('should list employer jobs', async () => {
    const response = await fetch(`${apiBase}/employer/jobs`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    if (data.length === 0) {
      throw new Error('No jobs returned for employer.');
    }
    expect(data.some((job: any) => job && job.employerId === employerId)).toBe(true);
  });

  it('should reject job creation by non-employer', async () => {
    // Login as jobseeker
    const loginResponse = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'applicant001@demo.gensanworks.com',
        password: 'JobseekerDemoPass123!',
      }),
    });
    expect(loginResponse.status).toBe(200);
    const userData = await loginResponse.json();
    expect(userData).toBeDefined();
    expect(userData.token).toBeDefined();

    const response = await fetch(`${apiBase}/employer/jobs`, {
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
  let employerToken: string;
  let createdJobId: string | undefined;

  beforeAll(async () => {
    // Login as jobseeker
    const jobseekerResponse = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'applicant001@demo.gensanworks.com',
        password: 'JobseekerDemoPass123!',
      }),
    });
    expect(jobseekerResponse.status).toBe(200);
    const jobseekerData = await jobseekerResponse.json();
    expect(jobseekerData).toBeDefined();
    expect(jobseekerData.token).toBeDefined();
    jobseekerToken = jobseekerData.token;

    // Login as employer
    const employerResponse = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employer01@gensanworks-demo.ph',
        password: 'EmployerDemoPass123!',
      }),
    });
    expect(employerResponse.status).toBe(200);
    const employerData = await employerResponse.json();
    expect(employerData).toBeDefined();
    expect(employerData.token).toBeDefined();
    employerToken = employerData.token;

    // Create a job as employer (ensure at least one job exists)
    const createJobResponse = await fetch(`${apiBase}/employer/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`,
      },
      body: JSON.stringify({
        positionTitle: 'Integration Test Job',
        description: 'Job for integration test',
        barangay: 'Lagao',
        municipality: 'General Santos City',
        province: 'South Cotabato',
      }),
    });
    expect([201, 400]).toContain(createJobResponse.status); // 201 created, 400 if duplicate
    if (createJobResponse.status === 201) {
      const jobData = await createJobResponse.json();
      expect(jobData).toBeDefined();
      expect(jobData.job).toBeDefined();
      expect(jobData.job.id).toBeDefined();
      createdJobId = jobData.job.id;
    }
  });

  it('should apply to a job as jobseeker', async () => {
    // First get a job ID
    const jobsResponse = await fetch(`${apiBase}/jobs`);
    expect(jobsResponse.status).toBe(200);
    const jobs = await jobsResponse.json();
    expect(Array.isArray(jobs)).toBe(true);
    if (jobs.length > 0) {
      const jobId = jobs[0]?.id;
      expect(jobId).toBeDefined();
      const response = await fetch(`${apiBase}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jobseekerToken}` },
      });
      expect([201, 400]).toContain(response.status); // 201 created or 400 already applied
    } else {
      throw new Error('No jobs available to apply for.');
    }
  });

  it('should list jobseeker applications', async () => {
    const response = await fetch(`${apiBase}/jobseeker/applications`, {
      headers: { Authorization: `Bearer ${jobseekerToken}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should reject application from non-jobseeker', async () => {
    // Login as admin
    const loginResponse = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@local.test',
        password: 'adminpass',
      }),
    });
    expect(loginResponse.status).toBe(200);
    const userData = await loginResponse.json();
    expect(userData).toBeDefined();
    expect(userData.token).toBeDefined();

    const jobsResponse = await fetch(`${apiBase}/jobs`);
    expect(jobsResponse.status).toBe(200);
    const jobs = await jobsResponse.json();
    expect(Array.isArray(jobs)).toBe(true);
    if (jobs.length > 0) {
      const jobId = jobs[0]?.id;
      expect(jobId).toBeDefined();
      const response = await fetch(`${apiBase}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userData.token}` },
      });
      expect(response.status).toBe(403);
    } else {
      throw new Error('No jobs available to test non-jobseeker application.');
    }
  });
});

describe('Current User Tests', () => {
  it('should get current user info with valid token', async () => {
    // Login first
    const loginResponse = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@local.test',
        password: 'adminpass',
      }),
    });
    const userData = await loginResponse.json();

    const response = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${userData.token}` },
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user).toHaveProperty('id');
    expect(data.user).toHaveProperty('email');
    expect(data.user).toHaveProperty('role');
  });

  it('should reject /auth/me without token', async () => {
    const response = await fetch(`${apiBase}/auth/me`);
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
