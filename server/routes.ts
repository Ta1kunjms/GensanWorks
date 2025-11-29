import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { eq, and } from "drizzle-orm";
import { storage } from "./storage";
import {
  getAdminByEmailWithPassword,
  getEmployerByEmailWithPassword,
  getJobseekerByEmailWithPassword,
  initStorageWithDatabase,
} from "./db-helpers";
import { 
  verifyPassword, 
  hashPassword, 
  validateEmail,
  validatePassword,
  createErrorResponse,
  ErrorCodes,
  JWTPayload
} from "./auth";
import {
  authMiddleware,
  roleMiddleware,
  adminOnly,
} from "./middleware";
import {
  referralFiltersSchema,
  notesFiltersSchema,
  jobseekerCreateSchema,
  employerCreateSchema,
  jobCreateSchema,
  adminCreateSchema,
  loginSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import { initializeDatabase, getDatabase } from "./database";
import { applicantsTable, employersTable, jobVacanciesTable, jobsTable, applicationsTable, adminsTable, referralsTable, messagesTable, notificationsTable } from "./unified-schema";
import { computeProfileCompleteness } from "./utils/status";
import { authSettingsSchema } from "@shared/schema";
import { passport, initGoogleOAuth } from "./auth";
import { generateToken } from "./auth";

// ============ HELPER FUNCTIONS ============

function sendValidationError(res: Response, message: string, field?: string) {
  return res.status(400).json(
    createErrorResponse(
      ErrorCodes.MISSING_FIELD,
      message,
      field
    )
  );
}

// Generic timestamp formatter for any object with createdAt/updatedAt
function formatTimestamps(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  let createdAt = obj.createdAt;
  let updatedAt = obj.updatedAt;
  const now = new Date().toISOString();
  
  // Format createdAt safely
  try {
    if (!createdAt) {
      createdAt = now;
    } else if (createdAt instanceof Date) {
      try {
        const time = createdAt.getTime();
        if (isNaN(time)) {
          createdAt = now;
        } else {
          createdAt = createdAt.toISOString();
        }
      } catch (e) {
        // toISOString failed, use now
        createdAt = now;
      }
    } else if (typeof createdAt === 'number') {
      const date = new Date(createdAt);
      try {
        if (isNaN(date.getTime())) {
          createdAt = now;
        } else {
          createdAt = date.toISOString();
        }
      } catch (e) {
        createdAt = now;
      }
    } else if (typeof createdAt === 'string') {
      // Validate it can be parsed
      const parsed = new Date(createdAt);
      try {
        if (isNaN(parsed.getTime())) {
          createdAt = now;
        } else if (!createdAt.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          createdAt = parsed.toISOString();
        }
      } catch (e) {
        createdAt = now;
      }
    } else {
      createdAt = now;
    }
  } catch (e) {
    createdAt = now;
  }
  
  // Format updatedAt safely (use createdAt as fallback)
  try {
    if (!updatedAt) {
      updatedAt = createdAt;
    } else if (updatedAt instanceof Date) {
      try {
        const time = updatedAt.getTime();
        if (isNaN(time)) {
          updatedAt = createdAt;
        } else {
          updatedAt = updatedAt.toISOString();
        }
      } catch (e) {
        updatedAt = createdAt;
      }
    } else if (typeof updatedAt === 'number') {
      const date = new Date(updatedAt);
      try {
        if (isNaN(date.getTime())) {
          updatedAt = createdAt;
        } else {
          updatedAt = date.toISOString();
        }
      } catch (e) {
        updatedAt = createdAt;
      }
    } else if (typeof updatedAt === 'string') {
      // Validate it can be parsed
      const parsed = new Date(updatedAt);
      try {
        if (isNaN(parsed.getTime())) {
          updatedAt = createdAt;
        } else if (!updatedAt.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          updatedAt = parsed.toISOString();
        }
      } catch (e) {
        updatedAt = createdAt;
      }
    } else {
      updatedAt = createdAt;
    }
  } catch (e) {
    updatedAt = createdAt;
  }
  
  return {
    ...obj,
    createdAt,
    updatedAt,
  };
}

// Alias for backward compatibility
function formatJobTimestamps(job: any): any {
  return formatTimestamps(job);
}

function sendAuthError(res: Response, message: string) {
  return res.status(401).json(
    createErrorResponse(
      ErrorCodes.INVALID_CREDENTIALS,
      message
    )
  );
}

function sendError(res: Response, err: any) {
  if (err instanceof ZodError) {
    const firstError = err.errors[0];
    return sendValidationError(
      res,
      firstError.message,
      firstError.path.join(".")
    );
  }

  const message = err?.message || "Internal server error";
  return res.status(500).json(
    createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      message
    )
  );
}

// ============ REGISTER ROUTES ============

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize database on startup
  try {
    await initializeDatabase();
    console.log("✓ Database initialized successfully");
  } catch (error) {
    console.error("✗ Failed to initialize database:", error);
  }
  
  // ============ PUBLIC ROUTES ============

  // GET /api/health - Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ============ SETTINGS: AUTH PROVIDERS ============
  // Read current auth settings
  app.get("/api/settings/auth", async (_req, res) => {
    try {
      const current = await storage.getAuthSettings?.();
      res.json(current ?? { providers: [] });
    } catch (e) {
      sendError(res, e);
    }
  });

  // Update auth settings
  app.put("/api/settings/auth", async (req, res) => {
    try {
      const parsed = authSettingsSchema.parse(req.body);
      const updated = await storage.updateAuthSettings?.(parsed);
      // Re-initialize Google OAuth strategy if Google is enabled
      if (updated?.providers?.some((p: any) => p.id === "google" && p.enabled)) {
        if (typeof initGoogleOAuth === "function") {
          initGoogleOAuth();
        }
      }
      res.json(updated ?? parsed);
    } catch (e) {
      sendError(res, e);
    }
  });

  // ============ OAUTH: GOOGLE (stub) ============
  app.get("/auth/google", async (req, res, next) => {
    try {
      const settings = await storage.getAuthSettings?.();
      const google = settings?.providers.find(p => p.id === 'google');
      if (!google?.enabled) {
        return res.status(400).json({ error: "Google sign-in is not enabled" });
      }
      const role = (req.query.role as string) || "jobseeker";
      // Use OAuth 'state' to carry the target role
      (passport.authenticate("google", {
        scope: ["profile", "email"],
        state: role,
        session: false,
      }) as any)(req, res, next);
    } catch (e) {
      sendError(res, e);
    }
  });

  app.get("/auth/google/callback", (req, res, next) => {
    (passport.authenticate("google", { session: false }, async (err: any, user: any, info: any) => {
      if (err) return sendError(res, err);
      if (!user) return res.status(401).json({ error: info || "Authentication failed" });
      const role = (req.query.state as string) || "jobseeker";

      // Link or provision user in database according to role
      try {
        const db = getDatabase();
        const email = user.email || "";
        const displayName = user.name || "Google User";
        let idForJwt = email || user.profile?.id || "google-user";

        if (role === "admin") {
          const existing = await db.select().from(adminsTable).where(eq(adminsTable.email, email));
          if (existing.length === 0) {
            const newId = crypto.randomUUID();
            await db.insert(adminsTable).values({ id: newId, email, name: displayName, createdAt: new Date(), updatedAt: new Date() });
            idForJwt = newId;
          } else {
            idForJwt = existing[0].id;
          }
        } else if (role === "employer") {
          const existing = await db.select().from(employersTable).where(eq(employersTable.email, email));
          if (existing.length === 0) {
            const newId = crypto.randomUUID();
            // Use displayName or a fallback for establishment_name
            const establishmentName = displayName || "Google Employer";
            await db.insert(employersTable).values({
              id: newId,
              email,
              name: displayName,
              establishmentName,
              createdAt: new Date(),
              updatedAt: new Date(),
              hasAccount: true
            });
            idForJwt = newId;
          } else {
            idForJwt = existing[0].id;
          }
        } else {
          // jobseeker/freelancer
          const existing = await db.select().from(applicantsTable).where(eq(applicantsTable.email, email));
          if (existing.length === 0) {
            const newId = crypto.randomUUID();
            // Split displayName into firstName and surname (fallback if not possible)
            let firstName = displayName;
            let surname = "GoogleUser";
            if (displayName && displayName.includes(" ")) {
              const parts = displayName.trim().split(" ");
              firstName = parts.slice(0, -1).join(" ") || displayName;
              surname = parts.slice(-1).join(" ") || "GoogleUser";
            }
            await db.insert(applicantsTable).values({
              id: newId,
              email,
              firstName,
              surname,
              hasAccount: true,
              role: role === "freelancer" ? "freelancer" : "jobseeker",
              createdAt: new Date(),
              updatedAt: new Date()
            });
            idForJwt = newId;
          } else {
            idForJwt = existing[0].id;
          }
        }

        // Issue JWT and redirect to client callback page
        const token = generateToken({
          id: idForJwt,
          email: email,
          role: role as any,
          name: displayName,
        });
        const redirectUrl = `/oauth/callback?token=${encodeURIComponent(token)}&name=${encodeURIComponent(displayName)}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`;
        res.redirect(redirectUrl);
      } catch (linkErr) {
        sendError(res, linkErr);
      }
    }) as any)(req, res, next);
  });

  // ============ PUBLIC STATISTICS FOR LANDING PAGE ============
  
  app.get("/api/public/stats", async (_req, res) => {
    try {
      const db = getDatabase();
      
      // Count jobseekers (applicants with accounts)
      const applicants = await db.query.applicantsTable.findMany();
      const jobseekers = applicants.filter((a: any) => a.hasAccount);
      
      // Count employers (employers with accounts)
      const employers = await db.query.employersTable.findMany();
      const activeEmployers = employers.filter((e: any) => e.hasAccount);
      
      // Count total applications (jobs matched)
      const applications = await db.query.applicationsTable.findMany();
      
      res.json({
        jobseekersRegistered: jobseekers.length,
        employersParticipating: activeEmployers.length,
        jobsMatched: applications.length,
      });
    } catch (error) {
      console.error("Failed to fetch public stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Get top skills in demand from applicants' skill data
  app.get("/api/public/skills", async (_req, res) => {
    try {
      const db = getDatabase();
      const applicants = await db.query.applicantsTable.findMany();
      
      // Count all skills
      const skillsMap = new Map<string, number>();
      
      applicants.forEach((applicant: any) => {
        if (applicant.otherSkills) {
          try {
            const skills = JSON.parse(applicant.otherSkills);
            skills.forEach((skill: string) => {
              const normalizedSkill = skill.trim();
              skillsMap.set(normalizedSkill, (skillsMap.get(normalizedSkill) || 0) + 1);
            });
          } catch {}
        }
      });
      
      // Convert to array and sort by count
      const skillsArray = Array.from(skillsMap.entries())
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count);
      
      // Calculate percentage based on total applicants
      const totalApplicants = applicants.length;
      const topSkills = skillsArray.slice(0, 10).map(item => ({
        skill: item.skill,
        percentage: Math.round((item.count / totalApplicants) * 100)
      }));
      
      res.json(topSkills);
    } catch (error) {
      console.error("Failed to fetch skills data:", error);
      res.status(500).json({ error: "Failed to fetch skills data" });
    }
  });

  // Get impact metrics and statistics
  app.get("/api/public/impact", async (_req, res) => {
    try {
      const db = getDatabase();
      
      const applicants = await db.query.applicantsTable.findMany();
      const applications = await db.query.applicationsTable.findMany();
      
      // Calculate average time to first interview (simulate with created dates)
      const avgTimeToInterview = "48 hrs"; // Can be calculated from application data
      
      // Calculate average salary from applicants' expected salary
      let totalSalary = 0;
      let salaryCount = 0;
      
      applicants.forEach((applicant: any) => {
        let education: any[] = [];
        if (applicant.education) {
          try {
            education = JSON.parse(applicant.education);
            if (!Array.isArray(education)) education = [];
          } catch (e) {
            education = [];
          }
        }
        education.forEach((edu: any) => {
          if (edu.expectedSalary) {
            const salary = parseInt(edu.expectedSalary);
            if (!isNaN(salary)) {
              totalSalary += salary;
              salaryCount++;
            }
          }
        });
      });
      
      const avgSalary = salaryCount > 0 ? Math.round(totalSalary / salaryCount / 1000) : 32;
      
      // Calculate satisfaction rate (based on successful applications)
      const successfulApps = applications.filter((app: any) => 
        app.status === 'hired' || app.status === 'accepted'
      ).length;
      const satisfactionRate = applications.length > 0 
        ? Math.round((successfulApps / applications.length) * 100) 
        : 94.5;
      
      res.json({
        avgTimeToInterview,
        avgSalary: `₱${avgSalary}K`,
        satisfactionRate: `${satisfactionRate}%`,
        yearsOfService: 25
      });
    } catch (error) {
      console.error("Failed to fetch impact data:", error);
      res.status(500).json({ error: "Failed to fetch impact data" });
    }
  });

  // ============ DASHBOARD DATA ROUTES (keep existing) ============

  app.get("/api/summary", async (req, res) => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      const data = await storage.getSummaryData(startDate, endDate);
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch summary data" });
    }
  });

  app.get("/api/recent-activities", async (_req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent activities" });
    }
  });

  // ================= NOTIFICATIONS + SSE =================
  const sseClients: Response[] = [];

  function broadcastNotification(event: string, payload: any) {
    const data = JSON.stringify(payload);
    sseClients.forEach((res) => {
      try {
        res.write(`event: ${event}\n`);
        res.write(`data: ${data}\n\n`);
      } catch {}
    });
  }

  // SSE stream
  app.get('/api/notifications/stream', authMiddleware, (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write('retry: 10000\n\n');
    sseClients.push(res);
    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx >= 0) sseClients.splice(idx, 1);
    });
  });

  // GET notifications from DB
  app.get('/api/notifications', authMiddleware, async (req: Request, res: Response) => {
    try {
      const db = getDatabase();
      const user = (req as any).user;
      const role = user?.role;
      const userId = user?.id;

      // Fetch notifications targeted to this user or role (or global role=null/userId=null)
      const rows = await db.select().from(notificationsTable);
      const filtered = rows.filter((n: any) => {
        if (n.userId && userId && n.userId === userId) return true;
        if (n.role && role && n.role === role) return true;
        if (!n.userId && !n.role) return true; // global broadcast
        return false;
      }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Seed sample if empty
      if (filtered.length === 0) {
        const seed = [
          { id: `seed_${Date.now()}_1`, userId: null, role, type: 'system', message: 'Welcome! Notifications are now live.', read: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ];
        for (const s of seed) {
          await db.insert(notificationsTable).values(s as any);
        }
        broadcastNotification('seed', seed);
        return res.json(seed);
      }

      res.json(filtered);
    } catch (e) {
      console.error('Failed fetching notifications', e);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // POST create notification (admin only for now)
  app.post('/api/notifications', authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
      const db = getDatabase();
      const { role, userId, type, message } = req.body;
      if (!message) return res.status(400).json({ error: 'Message required' });
      const now = new Date().toISOString();
      const notif = { id: `notif_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, role: role || null, userId: userId || null, type: type || 'system', message, read: false, createdAt: now, updatedAt: now };
      await db.insert(notificationsTable).values(notif as any);
      broadcastNotification('new', notif);
      res.status(201).json(notif);
    } catch (e) {
      console.error('Failed creating notification', e);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  // PATCH mark as read
  app.patch('/api/notifications/:id/read', authMiddleware, async (req: Request, res: Response) => {
    try {
      const db = getDatabase();
      const id = req.params.id;
      // naive update using raw sql since drizzle instance details may vary
      await db.execute(sql`UPDATE notifications SET read = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`);
      broadcastNotification('read', { id });
      res.json({ id, read: true });
    } catch (e) {
      console.error('Failed marking notification read', e);
      res.status(500).json({ error: 'Failed to mark notification read' });
    }
  });

  app.get("/api/charts/bar", async (req, res) => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      const data = await storage.getBarChartData(startDate, endDate);
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bar chart data" });
    }
  });

  app.get("/api/charts/doughnut", async (req, res) => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      const data = await storage.getDoughnutChartData(startDate, endDate);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doughnut chart data" });
    }
  });

  app.get("/api/charts/line", async (req, res) => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      const data = await storage.getLineChartData(startDate, endDate);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch line chart data" });
    }
  });

  // GET /api/charts/employment-status
  app.get("/api/charts/employment-status", async (req, res) => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      const db = getDatabase();
      if (!db) {
        return res.json({
          employed: 0,
          unemployed: 0,
          selfEmployed: 0,
          newEntrant: 0,
        });
      }

      // Fetch all applicants from database
      let applicants = await db.query.applicantsTable.findMany();
      
      // Filter by date range if provided
      if (startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');
        
        applicants = applicants.filter((app: any) => {
          const createdDate = app.createdAt ? new Date(app.createdAt) : null;
          return createdDate && createdDate >= start && createdDate <= end;
        });
      }
      
      // Initialize counters
      let employed = 0;
      let unemployed = 0;
      let selfEmployed = 0;
      let newEntrant = 0;

      // Count by employment status (match all variations)
      applicants.forEach((applicant: any) => {
        const status = (applicant.employmentStatus || '').toLowerCase().trim().replace(/[-_]+/g, ' ');
        
        // Match employment status values with flexible matching for variations
        // Normalize: remove hyphens, underscores
        if (status.includes('wage') && status.includes('employ')) {
          employed++;
        } else if (status.includes('unemployed') || status.includes('underemployed')) {
          unemployed++;
        } else if (status.includes('self') && status.includes('employ')) {
          selfEmployed++;
        } else if (status.includes('new entrant') || status.includes('fresh graduate')) {
          newEntrant++;
        }
      });

      res.json({
        employed,
        unemployed,
        selfEmployed,
        newEntrant,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employment status data" });
    }
  });

  app.get("/api/referrals", async (req, res) => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      const filters = referralFiltersSchema.parse({
        barangay: req.query.barangay as string | undefined,
        employer: req.query.employer as string | undefined,
        jobCategory: req.query.jobCategory as string | undefined,
        dateRange: req.query.dateRange as string | undefined,
        status: req.query.status as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      });

      const db = getDatabase();
      
      let referrals: any[] = [];
      try {
        referrals = await db.select().from(referralsTable);
      } catch (tableError) {
        // Table doesn't exist yet, use storage as fallback
        console.warn("referralsTable not found, using storage fallback");
        referrals = await storage.getReferrals(filters);
      }
      
      // Filter by date range if provided
      if (startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00.000Z');
        const end = new Date(endDate + 'T23:59:59.999Z');
        
        referrals = referrals.filter((ref: any) => {
          const refDate = ref.dateReferred ? new Date(ref.dateReferred) : null;
          return refDate && refDate >= start && refDate <= end;
        });
      }
      
      // Apply status filter if provided
      if (filters.status) {
        referrals = referrals.filter((ref: any) => 
          ref.status?.toLowerCase() === filters.status?.toLowerCase()
        );
      }
      
      // Apply barangay filter if provided
      if (filters.barangay) {
        referrals = referrals.filter((ref: any) => 
          ref.barangay?.toLowerCase() === filters.barangay?.toLowerCase()
        );
      }
      
      // Apply employer filter if provided
      if (filters.employer) {
        referrals = referrals.filter((ref: any) => 
          ref.employer?.toLowerCase().includes(filters.employer?.toLowerCase())
        );
      }
      
      // Apply job category filter if provided
      if (filters.jobCategory) {
        referrals = referrals.filter((ref: any) => 
          ref.jobCategory?.toLowerCase() === filters.jobCategory?.toLowerCase()
        );
      }
      
      // Apply pagination
      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      const paginatedReferrals = referrals.slice(offset, offset + limit);
      
      res.status(200).json(referrals);
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.get("/api/notes", async (req, res) => {
    try {
      const filters = notesFiltersSchema.parse({
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      });

      const notes = await storage.getNotes(filters);
      res.json(notes);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // ============ MESSAGES ROUTES ============

  // GET /api/messages - Get messages for current user (inbox/sent)
  app.get("/api/messages", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const type = req.query.type || 'inbox'; // inbox | sent | all

      const db = getDatabase();
      const { messagesTable } = await import("./unified-schema");
      
      let messages: any[] = [];

      if (type === 'inbox') {
        messages = await db.select().from(messagesTable).where(eq(messagesTable.receiverId, userId));
      } else if (type === 'sent') {
        messages = await db.select().from(messagesTable).where(eq(messagesTable.senderId, userId));
      } else {
        // Get all messages (both sent and received)
        const received = await db.select().from(messagesTable).where(eq(messagesTable.receiverId, userId));
        const sent = await db.select().from(messagesTable).where(eq(messagesTable.senderId, userId));
        messages = [...received, ...sent];
      }

      // Sort by most recent first
      messages.sort((a, b) => {
        const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });

      res.json(messages);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/messages/conversation/:userId - Get conversation with a specific user
  app.get("/api/messages/conversation/:userId", authMiddleware, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = req.params.userId;

      const db = getDatabase();
      const { messagesTable } = await import("./unified-schema");

      // Get all messages between these two users
      const messages = await db.select().from(messagesTable).where(
        and(
          eq(messagesTable.senderId, currentUserId),
          eq(messagesTable.receiverId, otherUserId)
        )
      );

      const messages2 = await db.select().from(messagesTable).where(
        and(
          eq(messagesTable.senderId, otherUserId),
          eq(messagesTable.receiverId, currentUserId)
        )
      );

      const allMessages = [...messages, ...messages2];

      // Sort by oldest first (chronological order for conversations)
      allMessages.sort((a, b) => {
        const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return timeA - timeB;
      });

      res.json(allMessages);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // POST /api/messages - Send a new message
  app.post("/api/messages", authMiddleware, async (req: any, res) => {
    try {
      const { receiverId, receiverRole, subject, content } = req.body;
      const senderId = req.user.id;
      const senderRole = req.user.role;

      if (!receiverId || !content) {
        return sendValidationError(res, "Receiver ID and content are required");
      }

      const db = getDatabase();
      const { messagesTable } = await import("./unified-schema");

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      const [newMessage] = await db.insert(messagesTable).values({
        id: messageId,
        senderId,
        senderRole,
        receiverId,
        receiverRole: receiverRole || 'employer',
        subject: subject || null,
        content,
        isRead: false,
        createdAt: now,
        updatedAt: now,
      }).returning();

      // Notify recipient via WebSocket
      const { notifyNewMessage } = await import("./websocket");
      notifyNewMessage(receiverId, newMessage);

      res.status(201).json(newMessage);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // PATCH /api/messages/:id/read - Mark message as read
  app.patch("/api/messages/:id/read", authMiddleware, async (req: any, res) => {
    try {
      const messageId = req.params.id;
      const userId = req.user.id;

      const db = getDatabase();
      const { messagesTable } = await import("./unified-schema");

      // Only allow receiver to mark as read
      const message = await db.select().from(messagesTable).where(eq(messagesTable.id, messageId));
      
      if (!message || message.length === 0) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message[0].receiverId !== userId) {
        return res.status(403).json({ error: "Not authorized to mark this message as read" });
      }

      await db.update(messagesTable)
        .set({ isRead: true, updatedAt: new Date() })
        .where(eq(messagesTable.id, messageId));

      // Notify sender via WebSocket
      const { notifyMessageRead } = await import("./websocket");
      notifyMessageRead(message[0].senderId, messageId);

      res.json({ success: true, message: "Message marked as read" });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/messages/unread/count - Get unread message count
  app.get("/api/messages/unread/count", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;

      const db = getDatabase();
      const { messagesTable } = await import("./unified-schema");

      const unreadMessages = await db.select().from(messagesTable).where(
        and(
          eq(messagesTable.receiverId, userId),
          eq(messagesTable.isRead, false)
        )
      );

      res.json({ count: unreadMessages.length });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // ============ AUTH ROUTES ============

  // POST /api/auth/signup/jobseeker
  app.post("/api/auth/signup/jobseeker", async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ 
          error: { 
            message: "First name, last name, email, and password are required" 
          } 
        });
      }

      // Trim email to remove whitespace
      const trimmedEmail = email?.trim();

      if (!validateEmail(trimmedEmail)) {
        return res.status(400).json({ 
          error: { 
            message: "Invalid email format" 
          } 
        });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: { 
            message: passwordValidation.errors.join("; ") 
          } 
        });
      }

      // Check if email already exists in applicants table
      const db = getDatabase();
      const existingApplicant = await db.query.applicantsTable.findFirst({
        where: (table: any) => eq(table.email, trimmedEmail),
      });

      if (existingApplicant) {
        return res.status(400).json({ 
          error: { 
            message: "Email already registered" 
          } 
        });
      }

      const hash = await hashPassword(password);
      
      // Create applicant with login credentials
      const applicantId = `applicant_${Date.now()}`;
      const userRole = role || "jobseeker";
      const now = new Date();
      const fullName = `${firstName} ${lastName}`.trim();
      
      await db.insert(applicantsTable).values({
        id: applicantId,
        firstName: firstName,
        surname: lastName,
        email: trimmedEmail,
        passwordHash: hash,
        role: userRole,
        hasAccount: true,
        employmentType: userRole === "freelancer" ? "Freelancer" : "Jobseeker",
        employmentStatus: "New Entrant",
        municipality: "General Santos City",
        province: "South Cotabato",
        createdAt: now,
        updatedAt: now,
      });

      const token = generateToken({
        id: applicantId,
        email: trimmedEmail,
        role: userRole as any,
        name: fullName,
      });

      res.json({
        token,
        user: {
          id: applicantId,
          name: fullName,
          email: trimmedEmail,
          role: userRole,
        },
      });
    } catch (error: any) {
      console.error("Jobseeker signup error:", error);
      return res.status(500).json({ 
        error: { 
          message: error.message || "Signup failed" 
          } 
      });
    }
  });

  // POST /api/auth/signup/employer
  app.post("/api/auth/signup/employer", async (req: Request, res: Response) => {
    try {
      const { name, email, password, company } = req.body;

      if (!name || !email || !password || !company) {
        return res.status(400).json({ 
          error: { 
            message: "Name, email, password, and company are required" 
          } 
        });
      }

      // Trim email to remove whitespace
      const trimmedEmail = email?.trim();

      if (!validateEmail(trimmedEmail)) {
        return res.status(400).json({ 
          error: { 
            message: "Invalid email format" 
          } 
        });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: { 
            message: passwordValidation.errors.join("; ") 
          } 
        });
      }

      // Check if email already exists
      const db = getDatabase();
      const existingEmployer = await db.query.employersTable.findFirst({
        where: (table: any) => eq(table.email, trimmedEmail),
      });

      if (existingEmployer) {
        return res.status(400).json({ 
          error: { 
            message: "Email already registered" 
          } 
        });
      }

      const hash = await hashPassword(password);
      
      // Create employer account directly in employers table
      const employerId = `EMP-${Date.now()}`;
      
      await db.insert(employersTable).values({
        id: employerId,
        establishmentName: company,
        email: trimmedEmail,
        passwordHash: hash,
        hasAccount: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const token = generateToken({
        id: employerId,
        email: trimmedEmail,
        role: "employer",
        name: name,
      });

      res.json({
        token,
        user: {
          id: employerId,
          name: name,
          email: trimmedEmail,
          role: "employer",
        },
      });
    } catch (error: any) {
      console.error("Employer signup error:", error);
      return res.status(500).json({ 
        error: { 
          message: error.message || "Signup failed" 
        } 
      });
    }
  });

  // POST /api/auth/signup/admin (controlled - for setup only)
  app.post("/api/auth/signup/admin", async (req: Request, res: Response) => {
    try {
      const payload = adminCreateSchema.parse(req.body);

      if (!validateEmail(payload.email)) {
        return sendValidationError(res, "Invalid email format", "email");
      }

      const passwordValidation = validatePassword(payload.password);
      if (!passwordValidation.isValid) {
        return sendValidationError(
          res,
          passwordValidation.errors.join("; "),
          "password"
        );
      }

      const hash = await hashPassword(payload.password);
      const created = await storage.addAdmin({
        name: payload.name,
        email: payload.email,
        passwordHash: hash,
      });

      const token = generateToken({
        id: created.id,
        email: created.email,
        role: "admin",
        name: created.name,
      });

      res.json({
        token,
        user: {
          id: created.id,
          name: created.name,
          email: created.email,
          role: "admin",
        },
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // POST /api/auth/login - Universal login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const payload = loginSchema.parse(req.body);

      if (!payload.email || !payload.password) {
        return sendValidationError(
          res,
          "Email and password are required",
          "email"
        );
      }

      // Initialize database connection
      await initStorageWithDatabase();

      // Try jobseeker login first
      let user = await getJobseekerByEmailWithPassword(payload.email);
      if (user && user.passwordHash) {
        const isValid = await verifyPassword(
          payload.password,
          user.passwordHash
        );
        if (isValid) {
          const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          });
          return res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }
      }

      // Try employer login
      user = await getEmployerByEmailWithPassword(payload.email);
      if (user && user.passwordHash) {
        const isValid = await verifyPassword(
          payload.password,
          user.passwordHash
        );
        if (isValid) {
          const token = generateToken({
            id: user.id,
            email: user.email,
            role: "employer",
            name: user.name,
          });
          return res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: "employer",
            },
          });
        }
      }

      // Try admin login
      user = await getAdminByEmailWithPassword(payload.email);
      if (user && user.passwordHash) {
        const isValid = await verifyPassword(
          payload.password,
          user.passwordHash
        );
        if (isValid) {
          const token = generateToken({
            id: user.id,
            email: user.email,
            role: "admin",
            name: user.name,
          });
          return res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: "admin",
            },
          });
        }
      }

      return sendAuthError(res, "Invalid email or password");
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/auth/me - Get current user info (requires token)
  app.get("/api/auth/me", authMiddleware, async (req: any, res: Response) => {
    try {
      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
        },
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // POST /api/auth/logout
  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  });

  // ============ ADMIN ROUTES ============

  // GET /api/admin/stats
  app.get("/api/admin/stats", authMiddleware, adminOnly, async (_req, res) => {
    try {
      const jobseekers = await storage.getJobseekers();
      const employers = await storage.getEmployers();
      const jobs = await storage.getJobPosts();
      const applications = await (storage as any).getAllApplications?.();

      res.json({
        totalJobseekers: jobseekers.length,
        totalEmployers: employers.length,
        totalJobs: jobs.length,
        totalApplications: applications?.length || 0,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/admin/users
  app.get("/api/admin/users", authMiddleware, adminOnly, async (req, res) => {
    try {
      const role = req.query.role as string | undefined;
      const jobseekers = await storage.getJobseekers();
      const employers = await storage.getEmployers();

      let users: any[] = [];
      if (!role || role === "jobseeker") {
        users = users.concat(
          jobseekers.map((j) => ({
            ...j,
            type: "jobseeker",
          }))
        );
      }
      if (!role || role === "employer") {
        users = users.concat(
          employers.map((e) => ({
            ...e,
            type: "employer",
          }))
        );
      }

      res.json(users);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // PUT /api/admin/users/:id
  app.put("/api/admin/users/:id", authMiddleware, adminOnly, async (req, res) => {
    try {
      // Implementation for updating user by admin
      res.json({ message: "User updated" });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // DELETE /api/admin/users/:id
  app.delete("/api/admin/users/:id", authMiddleware, adminOnly, async (req, res) => {
    try {
      // Implementation for deleting user by admin
      res.json({ message: "User deleted" });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/admin/jobs
  app.get("/api/admin/jobs", authMiddleware, async (_req, res) => {
    try {
      const jobs = await storage.getJobPosts();
      res.json(jobs);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // PUT /api/admin/jobs/:id
  app.put("/api/admin/jobs/:id", authMiddleware, adminOnly, async (req, res) => {
    try {
      // Implementation for updating job by admin
      res.json({ message: "Job updated" });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // DELETE /api/admin/jobs/:id
  app.delete("/api/admin/jobs/:id", authMiddleware, adminOnly, async (req, res) => {
    try {
      // Implementation for deleting job by admin
      res.json({ message: "Job deleted" });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/admin/applications
  app.get(
    "/api/admin/applications",
    authMiddleware,
    adminOnly,
    async (_req, res) => {
      try {
        const applications = await (storage as any).getAllApplications?.();
        res.json(applications || []);
      } catch (error) {
        return sendError(res, error);
      }
    }
  );

  // GET /api/job-vacancies/open - Get all open job vacancies for referral slip generation
  app.get("/api/job-vacancies/open", async (_req, res) => {
    try {
      const db = getDatabase();
      const allVacancies = await db.select().from(jobVacanciesTable);
      
      // Filter for open vacancies (jobStatus is not "Closed" or similar, or has available vacancies)
      const openVacancies = (allVacancies || [])
        .filter((v: any) => !v.archived)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Most recent first
        });
      
      // Map and return with strict SRS Form 2A fields
      const mappedVacancies = openVacancies.map((v: any) => {
        let industryCodes: string[] = [];
        if (typeof v.industryCodes === 'string') {
          try { industryCodes = JSON.parse(v.industryCodes); } catch {}
        } else if (Array.isArray(v.industryCodes)) {
          industryCodes = v.industryCodes;
        }
        return {
          id: v.id,
          positionTitle: v.positionTitle,
          establishmentName: v.establishmentName,
          industryCodes,
          startingSalaryOrWage: v.startingSalaryOrWage,
          minimumEducationRequired: v.minimumEducationRequired,
          mainSkillOrSpecialization: v.mainSkillOrSpecialization,
          yearsOfExperienceRequired: v.yearsOfExperienceRequired,
          jobStatus: v.jobStatus,
          agePreference: v.agePreference,
          createdAt: v.createdAt,
          employerId: v.employerId,
        };
      });
      
      res.json(mappedVacancies);
    } catch (error: any) {
      console.error("Error fetching job vacancies:", error);
      res.status(500).json({ 
        error: "Failed to fetch job vacancies",
        message: error.message 
      });
    }
  });

  // ============ EMPLOYER ROUTES ============

  // POST /api/employer/jobs - Create a job
  app.post("/api/employer/jobs", authMiddleware, async (req: any, res: Response) => {
    try {
      if (req.user.role !== "employer") {
        return res.status(403).json(
          createErrorResponse(
            ErrorCodes.FORBIDDEN,
            "Only employers can create jobs"
          )
        );
      }

      const payload = jobCreateSchema.parse(req.body);
      const created = await storage.addJobPost(
        req.user.id,
        req.user.name || "",
        payload
      );

      res.status(201).json(created);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/employer/jobs - List employer's jobs
  app.get("/api/employer/jobs", authMiddleware, async (req: any, res) => {
    try {
      if (req.user.role !== "employer") {
        return res.status(403).json(
          createErrorResponse(
            ErrorCodes.FORBIDDEN,
            "Only employers can view their jobs"
          )
        );
      }

      const jobs = await storage.getJobPosts();
      const myJobs = jobs.filter((j) => j.employerId === req.user.id);

      res.json(myJobs);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // PUT /api/employer/jobs/:id - Update a job
  app.put(
    "/api/employer/jobs/:id",
    authMiddleware,
    async (req: any, res) => {
      try {
        if (req.user.role !== "employer") {
          return res.status(403).json(
            createErrorResponse(
              ErrorCodes.FORBIDDEN,
              "Only employers can update jobs"
            )
          );
        }

        // Implementation for updating job
        res.json({ message: "Job updated" });
      } catch (error) {
        return sendError(res, error);
      }
    }
  );

  // GET /api/employer/applications - List applications for employer's jobs
  app.get("/api/employer/applications", authMiddleware, async (req: any, res) => {
    try {
      if (req.user.role !== "employer") {
        return res.status(403).json(
          createErrorResponse(
            ErrorCodes.FORBIDDEN,
            "Only employers can view applications"
          )
        );
      }

      const jobs = await storage.getJobPosts();
      const myJobIds = jobs
        .filter((j) => j.employerId === req.user.id)
        .map((j) => j.id);

      const applications = await (storage as any).getAllApplications?.();
      const myApplications = applications?.filter((a: any) =>
        myJobIds.includes(a.jobId)
      );

      res.json(myApplications || []);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // ============ JOBSEEKER ROUTES ============

  // GET /api/jobs/:id - Get a single job by ID (checks both jobsTable and jobVacanciesTable)
  app.get("/api/jobs/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const jobId = req.params.id;
      const db = getDatabase();
      console.log(`[GET /api/jobs/:id] requested id=`, jobId);

      // Try jobsTable first
      const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
      if (job) {
        console.log(`[GET /api/jobs/:id] found in jobsTable:`, job.id);
        return res.json(job);
      }

      // Try jobVacanciesTable
      const [vacancy] = await db.select().from(jobVacanciesTable).where(eq(jobVacanciesTable.id, jobId));
      if (vacancy) {
        console.log(`[GET /api/jobs/:id] found in jobVacanciesTable:`, vacancy.id);
        // Transform vacancy to match job structure for matching algorithm
        const transformedJob = {
          id: vacancy.id,
          title: vacancy.positionTitle,
          description: `${vacancy.dutyFunction || ''}\n${vacancy.otherDutyFunction || ''}`.trim(),
          requirements: `Minimum Education: ${vacancy.minimumEducationRequired || 'N/A'}\nExperience: ${vacancy.yearsOfExperienceRequired || 0} years`,
          skills: vacancy.mainSkillOrSpecialization,
          location: `${vacancy.barangay || ''}, ${vacancy.municipality || 'General Santos City'}`.trim(),
          salaryMin: vacancy.startingSalaryOrWage,
          salaryMax: vacancy.maximumSalaryOrWage,
          salaryPeriod: vacancy.salaryType || 'Monthly',
          employmentType: vacancy.typeOfEmployment || 'Full-Time',
          educationLevel: vacancy.minimumEducationRequired,
          experienceRequired: `${vacancy.yearsOfExperienceRequired || 0} years`,
          industry: vacancy.industry || 'General',
          numberOfPositions: vacancy.numberOfVacancies || 1,
          status: vacancy.jobStatus || 'active',
          createdAt: vacancy.createdAt,
        };
        return res.json(transformedJob);
      }
      console.warn(`[GET /api/jobs/:id] not found in either table:`, jobId);
      return res.status(404).json({ error: "Job not found" });
    } catch (error) {
      console.error("Error fetching job:", error);
      return sendError(res, error);
    }
  });

  // GET /api/applicants/:id - Get a single applicant by ID
  app.get("/api/applicants/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const applicantId = req.params.id;
      const db = getDatabase();
      
      const [applicant] = await db.select().from(applicantsTable).where(eq(applicantsTable.id, applicantId));
      
      if (!applicant) {
        return res.status(404).json({ error: "Applicant not found" });
      }

      res.json(applicant);
    } catch (error) {
      console.error("Error fetching applicant:", error);
      return sendError(res, error);
    }
  });

  // GET /api/jobs - List all public jobs (excluding archived jobs)
  app.get("/api/jobs", async (_req, res) => {
    try {
      try {
        const db = getDatabase();
        let jobs = await db.select().from(jobsTable);
        
        // If database is empty, try storage fallback
        if (!jobs || jobs.length === 0) {
          const storageJobs = await storage.getJobPosts();
          // Filter out archived jobs
          const activeJobs = storageJobs.filter((j: any) => !j.archived);
          return res.json({ jobs: activeJobs || [] });
        }
        
        // Filter out archived jobs from database results and format timestamps
        // Handle missing archived column gracefully for backward compatibility
        const activeJobs = jobs
          .filter((j: any) => !j.archived) // archived defaults to undefined/false
          .map((job: any) => ({
            ...formatJobTimestamps(job),
            archived: job.archived || false, // Ensure archived field exists
          }));
        res.json({ jobs: activeJobs });
      } catch (dbError) {
        // Fallback to storage
        console.error('Database select failed, using storage fallback:', dbError);
        const jobs = await storage.getJobPosts();
        // Filter out archived jobs
        const activeJobs = jobs.filter((j: any) => !j.archived);
        res.json({ jobs: activeJobs || [] });
      }
    } catch (error) {
      return sendError(res, error);
    }
  });

  // PATCH /api/jobs/:jobId/archive - Archive a job posting
  app.patch("/api/jobs/:jobId/archive", authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
      const jobId = req.params.jobId;

      try {
        const db = getDatabase();
        const now = new Date();
        const result = await db.update(jobsTable).set({ archived: true, archivedAt: now }).where(eq(jobsTable.id, jobId));
        
        if (!result || result.changes === 0) {
          // Try storage fallback
          const jobs = await storage.getJobPosts();
          const jobIndex = jobs.findIndex((j: any) => j.id === jobId);
          
          if (jobIndex === -1) {
            return res.status(404).json({ error: "Job not found" });
          }
          
          jobs[jobIndex].archived = true;
          (jobs[jobIndex] as any).archivedAt = now;
          return res.json({ message: "Job archived successfully" });
        }
        
        res.json({ message: "Job archived successfully" });
      } catch (dbError) {
        // Fallback to storage
        console.error('Database update failed, using storage fallback:', dbError);
        const jobs = await storage.getJobPosts();
        const jobIndex = jobs.findIndex((j: any) => j.id === jobId);
        
        if (jobIndex === -1) {
          return res.status(404).json({ error: "Job not found" });
        }
        
        jobs[jobIndex].archived = true;
        const now = new Date();
        (jobs[jobIndex] as any).archivedAt = now;
        res.json({ message: "Job archived successfully" });
      }
    } catch (error) {
      return sendError(res, error);
    }
  });

  // POST /api/jobs - Create a new job posting
  app.post("/api/jobs", authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
      const payload = jobCreateSchema.parse(req.body);
      
      try {
        const db = getDatabase();
        const now = new Date();
        
        const result = await db.insert(jobsTable).values({
          title: payload.title,
          description: payload.description,
          location: payload.location,
          salaryMin: payload.salaryMin,
          salaryMax: payload.salaryMax,
          salaryPeriod: payload.salaryPeriod || "monthly",
          salaryAmount: payload.salaryAmount,
          status: payload.status || "active",
          employerId: payload.employerId,
          createdAt: now,
          updatedAt: now,
        }).returning();

        console.log('Job created:', result[0]);
        
        res.status(201).json({
          success: true,
          message: "Job posting created successfully",
          job: formatJobTimestamps(result[0]),
        });
      } catch (dbError) {
        // Fallback to storage
        console.error('Database insert failed, falling back to storage:', dbError);
        
        // Use storage to properly save the complete job with all fields
        const fullJob = await storage.addJobPostFull({
          title: payload.title,
          description: payload.description,
          location: payload.location,
          salaryMin: payload.salaryMin,
          salaryMax: payload.salaryMax,
          salaryPeriod: payload.salaryPeriod || "monthly",
          salaryAmount: payload.salaryAmount,
          status: payload.status || "active",
          employerId: payload.employerId,
          salaryType: payload.salaryType,
          jobStatus: payload.jobStatus,
          minimumEducation: payload.minimumEducation,
          yearsOfExperience: payload.yearsOfExperience,
          skills: payload.skills,
        });

        res.status(201).json({
          success: true,
          message: "Job posting created successfully",
          job: fullJob,
        });
      }
    } catch (error) {
      return sendError(res, error);
    }
  });

  // DELETE /api/jobs/:jobId - Delete a job posting (permanent deletion from archive)
  app.delete("/api/jobs/:jobId", async (req: Request, res: Response) => {
    try {
      const jobId = req.params.jobId;
      await storage.deleteJobPost?.(jobId);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // PUT /api/jobs/:jobId - Update a job posting
  app.put("/api/jobs/:jobId", authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
      const jobId = req.params.jobId;
      const updateData = req.body;

      // Get all jobs from storage
      const jobs = await storage.getJobPosts();
      const jobIndex = jobs.findIndex((j: any) => j.id === jobId);
      
      if (jobIndex === -1) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Merge update data with existing job, preserving important fields
      const updatedJobs = [...jobs];
      updatedJobs[jobIndex] = {
        ...updatedJobs[jobIndex],
        ...updateData,
        id: jobId, // Ensure ID doesn't change
        createdAt: updatedJobs[jobIndex].createdAt, // Preserve creation date
        updatedAt: new Date().toISOString(),
      };

      // Write back to storage
      await storage.saveJobs(updatedJobs);
      res.json({ message: "Job updated successfully", job: updatedJobs[jobIndex] });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // PATCH /api/jobs/:jobId/archive - Archive a job posting
  app.patch("/api/jobs/:jobId/archive", async (req: Request, res: Response) => {
    try {
      const jobId = req.params.jobId;

      // Get all jobs from storage
      const jobs = await storage.getJobPosts();
      const jobIndex = jobs.findIndex((j: any) => j.id === jobId);
      
      if (jobIndex === -1) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Archive the job in storage
      const updatedJobs = [...jobs];
      updatedJobs[jobIndex] = {
        ...updatedJobs[jobIndex],
        archived: true,
        archivedAt: new Date().toISOString(),
      };

      // Write back to storage
      await storage.saveJobs(updatedJobs);
      
      res.json({ message: "Job archived successfully", job: updatedJobs[jobIndex] });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/jobs/archived - Get all archived jobs (both from jobsTable and jobVacanciesTable)
  app.get("/api/jobs/archived", async (_req, res) => {
    try {
      const db = getDatabase();
      
      // Get archived jobs from jobsTable
      // jobsTable does not have an 'archived' column in unified schema.
      // Return empty archived jobs to avoid invalid column reference.
      const archivedJobs: any[] = [];
      
      // Get archived vacancies from jobVacanciesTable
      const archivedVacancies = await db.select().from(jobVacanciesTable).where(eq(jobVacanciesTable.archived, true));
      
      // Combine and format for response
      const combinedArchived = [
        ...(archivedJobs || []).map((j: any) => ({
          ...j,
          type: 'job',
          title: j.title,
          location: j.location,
        })),
        ...(archivedVacancies || []).map((v: any) => ({
          ...v,
          type: 'vacancy',
          title: v.positionTitle,
          location: v.barangay || 'N/A',
        })),
      ];
      
      res.json({ jobs: combinedArchived });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/jobs/:jobId/match - AI-powered applicant matching for a job
  app.get("/api/jobs/:jobId/match", authMiddleware, async (req: Request, res: Response) => {
    try {
      const jobId = req.params.jobId;
      const minScore = parseInt(req.query.minScore as string) || 50;
      const maxResults = parseInt(req.query.maxResults as string) || Infinity; // No limit - show all qualified

      const db = getDatabase();
      
      // Try to get job from jobsTable first
      console.log(`[GET /api/jobs/:jobId/match] requested id=`, jobId, `minScore=`, minScore, `maxResults=`, maxResults);
      let [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
      let jobTitle = job?.title;

      // If not found, try jobVacanciesTable
      if (!job) {
        const [vacancy] = await db.select().from(jobVacanciesTable).where(eq(jobVacanciesTable.id, jobId));
        
        if (!vacancy) {
          console.warn(`[GET /api/jobs/:jobId/match] job not found in either table:`, jobId);
          return res.status(404).json({ error: "Job not found" });
        }

        // Transform vacancy to match job structure
        job = {
          id: vacancy.id,
          title: vacancy.positionTitle,
          description: `${vacancy.dutyFunction || ''}\n${vacancy.otherDutyFunction || ''}`.trim(),
          requirements: `Minimum Education: ${vacancy.minimumEducationRequired || 'N/A'}\nExperience: ${vacancy.yearsOfExperienceRequired || 0} years`,
          skills: vacancy.mainSkillOrSpecialization,
          location: `${vacancy.barangay || ''}, ${vacancy.municipality || 'General Santos City'}`.trim(),
          salaryMin: vacancy.startingSalaryOrWage,
          salaryMax: vacancy.maximumSalaryOrWage,
          salaryPeriod: vacancy.salaryType || 'Monthly',
          employmentType: vacancy.typeOfEmployment || 'Full-Time',
          educationLevel: vacancy.minimumEducationRequired,
          experienceRequired: `${vacancy.yearsOfExperienceRequired || 0} years`,
          industry: vacancy.industry || 'General',
          numberOfPositions: vacancy.numberOfVacancies || 1,
          status: vacancy.jobStatus || 'active',
        } as any;
        
        jobTitle = vacancy.positionTitle;
      }

      // Get all applicants
      const applicants = await db.select().from(applicantsTable);
      
      if (!applicants || applicants.length === 0) {
        return res.json({ 
          jobId,
          jobTitle: jobTitle || 'Unknown Job',
          matches: [], 
          total: 0,
          criteria: { minScore, maxResults }
        });
      }

      // Import AI matcher
      const { aiJobMatcher } = await import("./ai-job-matcher");
      
      // Run hybrid AI matching (fast pre-filter + smart evaluation)
      console.log(`[AI Matching] Starting hybrid matching for job ${jobId}...`);
      console.log(`[AI Matching] Job details:`, {
        title: job.title,
        skills: job.skills,
        location: job.location,
        salary: `${job.salaryMin}-${job.salaryMax} ${job.salaryPeriod}`,
        education: job.educationLevel,
        experience: job.experienceRequired
      });
      console.log(`[AI Matching] Total applicants:`, applicants.length);
      
      // Use AI only if reasonable number of applicants, otherwise pure rule-based
      const useAI = applicants.length <= 100; // AI for up to 100 applicants
      
      const startTime = Date.now();
      // Parse optional custom weights from query (?weights=%7B"skillsMatch":60,...%7D or CSV skillsMatch:60,educationMatch:10,...)
      let customWeights: any = undefined;
      if (req.query.weights) {
        try {
          const raw = req.query.weights as string;
          if (raw.trim().startsWith('{')) {
            customWeights = JSON.parse(raw);
          } else {
            customWeights = raw.split(',').reduce((acc, pair) => {
              const [k, v] = pair.split(':');
              if (k && v && !isNaN(Number(v))) acc[k.trim()] = Number(v);
              return acc;
            }, {} as Record<string, number>);
          }
        } catch (e) {
          console.warn('[AI Matching] Invalid weights parameter, ignoring:', req.query.weights);
          customWeights = undefined;
        }
      }

      const matches = await aiJobMatcher.matchApplicantsToJob(
        applicants as any,
        job as any,
        { minScore, maxResults, useAI: customWeights ? false : useAI, weights: customWeights }
      );
      const duration = Date.now() - startTime;

      console.log(`[AI Matching] ✓ Completed in ${duration}ms - Found ${matches.length} matches (minScore: ${minScore})`);
      if (matches.length > 0) {
        console.log(`[AI Matching] Top 3 matches:`, matches.slice(0, 3).map(m => ({
          name: m.applicantName,
          score: `${m.percentage}%`,
          recommendation: m.recommendation
        })));
        // Debug: Check if AI comments are present
        console.log(`[AI Matching] First match AI fields:`, {
          hasAiComment: !!matches[0].aiComment,
          hasWhyQualified: !!matches[0].whyQualified,
          hasHiringRec: !!matches[0].hiringRecommendation,
          aiCommentPreview: matches[0].aiComment?.substring(0, 50)
        });
      }

      res.json({
        jobId,
        jobTitle: jobTitle || 'Unknown Job',
        matches,
        total: matches.length,
        criteria: {
          minScore,
          maxResults,
          weights: customWeights || null,
        },
      });
    } catch (error) {
      console.error("AI matching error:", error);
      return sendError(res, error);
    }
  });

  // GET /api/jobs/:jobId/applicant/:applicantId/ai-insights - Get AI insights for specific applicant
  app.get("/api/jobs/:jobId/applicant/:applicantId/ai-insights", authMiddleware, async (req: Request, res: Response) => {
    try {
      const jobId = req.params.jobId;
      const applicantId = req.params.applicantId;

      const db = getDatabase();
      
      // Get job details
      let [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
      
      if (!job) {
        const [vacancy] = await db.select().from(jobVacanciesTable).where(eq(jobVacanciesTable.id, jobId));
        
        if (!vacancy) {
          return res.status(404).json({ error: "Job not found" });
        }

        job = {
          id: vacancy.id,
          title: vacancy.positionTitle,
          description: `${vacancy.dutyFunction || ''}\n${vacancy.otherDutyFunction || ''}`.trim(),
          requirements: `Minimum Education: ${vacancy.minimumEducationRequired || 'N/A'}`,
          skills: vacancy.mainSkillOrSpecialization,
          location: `${vacancy.barangay || ''}, ${vacancy.municipality || 'General Santos City'}`.trim(),
          salaryMin: vacancy.startingSalaryOrWage,
          salaryMax: vacancy.maximumSalaryOrWage,
          educationLevel: vacancy.minimumEducationRequired,
        } as any;
      }

      // Get applicant details
      const [applicant] = await db.select().from(applicantsTable).where(eq(applicantsTable.id, applicantId));
      
      if (!applicant) {
        return res.status(404).json({ error: "Applicant not found" });
      }

      // Import AI matcher and get insights
      const { aiJobMatcher } = await import("./ai-job-matcher");
      
      console.log(`[AI Insights] Generating for ${applicant.firstName} ${applicant.surname} → ${job.title}`);
      
      const matchResult = await aiJobMatcher.matchApplicantsToJob(
        [applicant] as any,
        job as any,
        { minScore: 0, maxResults: 1, useAI: true }
      );

      if (matchResult.length === 0) {
        return res.status(404).json({ error: "No match result generated" });
      }

      const insights = {
        aiComment: matchResult[0].aiComment,
        whyQualified: matchResult[0].whyQualified,
        hiringRecommendation: matchResult[0].hiringRecommendation,
        potentialRole: matchResult[0].potentialRole,
        developmentAreas: matchResult[0].developmentAreas,
      };

      console.log(`[AI Insights] ✓ Generated insights for ${applicant.firstName}`);
      
      res.json(insights);
    } catch (error) {
      console.error("AI insights error:", error);
      return sendError(res, error);
    }
  });

  // PATCH /api/jobs/:jobId/unarchive - Unarchive a job posting or vacancy
  app.patch("/api/jobs/:jobId/unarchive", async (req: Request, res: Response) => {
    try {
      const jobId = req.params.jobId;
      const db = getDatabase();

      // Try to unarchive as a job first
      let result = await db.update(jobsTable).set({ archived: false, archivedAt: null }).where(eq(jobsTable.id, jobId));
      
      if (result && result.changes > 0) {
        return res.json({ message: "Job unarchived successfully" });
      }

      // If not a job, try to unarchive as a vacancy
      result = await db.update(jobVacanciesTable).set({ archived: false, archivedAt: null }).where(eq(jobVacanciesTable.id, jobId));
      
      if (result && result.changes > 0) {
        return res.json({ message: "Job vacancy unarchived successfully" });
      }

      // If neither found, return error
      return res.status(404).json({ error: "Job or vacancy not found" });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // POST /api/jobs/:jobId/apply - Apply to a job
  app.post("/api/jobs/:jobId/apply", authMiddleware, async (req: any, res: Response) => {
    try {
      if (req.user.role !== "jobseeker" && req.user.role !== "freelancer") {
        return res.status(403).json({ error: "Only jobseekers can apply to jobs" });
      }

      const { jobId, coverLetter } = req.body;
      if (!jobId) {
        return res.status(400).json({ error: "Job ID is required" });
      }

      const db = getDatabase();
      const now = new Date();

      // Check if already applied
      const existingApp = await db.query.applicationsTable.findFirst({
        where: (table: any) => 
          eq(table.jobId, jobId) && eq(table.applicantId, req.user.id),
      });

      if (existingApp) {
        return res.status(400).json({ error: "You have already applied to this job" });
      }

      const result = await db
        .insert(applicationsTable)
        .values({
          jobId,
          applicantId: req.user.id,
          applicantName: req.user.name,
          status: "pending",
          coverLetter: coverLetter || "",
          createdAt: now,
        })
        .returning();

      return res.status(201).json({
        message: "Application submitted successfully",
        application: result[0],
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/jobseeker/applications - Get jobseeker's applications
  app.get("/api/jobseeker/applications", authMiddleware, async (req: any, res: Response) => {
    try {
      if (req.user.role !== "jobseeker" && req.user.role !== "freelancer") {
        return res.status(403).json({ error: "Only jobseekers can view their applications" });
      }

      const applications = await (storage as any).getApplicationsByJobseeker?.(
        req.user.id
      );
      res.json(applications || []);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/jobseeker/dashboard - Get jobseeker dashboard stats
  app.get("/api/jobseeker/dashboard", authMiddleware, async (req: any, res: Response) => {
    try {
      if (req.user.role !== "jobseeker" && req.user.role !== "freelancer") {
        return res.status(403).json({ error: "Access denied" });
      }

      const db = getDatabase();
      const applications = await db.query.applicationsTable.findMany({
        where: (table: any) => eq(table.applicantId, req.user.id),
      });

      const [applicant] = await db.select().from(applicantsTable).where(eq(applicantsTable.id, req.user.id));
      const profileCompleteness = computeProfileCompleteness(applicant || {});

      const stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter((a: any) => a.status === "pending").length,
        shortlistedApplications: applications.filter((a: any) => a.status === "shortlisted").length,
        acceptedApplications: applications.filter((a: any) => a.status === "accepted").length,
        rejectedApplications: applications.filter((a: any) => a.status === "rejected").length,
        profileCompleteness,
        recommendedJobs: [],
      };

      return res.json(stats);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // ============ EMPLOYER APPLICATION MANAGEMENT ROUTES ============

  // GET /api/employer/dashboard - Get employer dashboard stats
  app.get("/api/employer/dashboard", authMiddleware, async (req: any, res: Response) => {
    try {
      if (req.user.role !== "employer") {
        return res.status(403).json({ error: "Access denied" });
      }

      const db = getDatabase();
      const jobs = await db.query.jobsTable.findMany({
        where: (table: any) => eq(table.employerId, req.user.id),
      });

      const jobIds = jobs.map((j: any) => j.id);
      const allApplications = await db.query.applicationsTable.findMany();
      const myApplications = allApplications.filter((a: any) => jobIds.includes(a.jobId));

      const stats = {
        totalJobPostings: jobs.length,
        activeJobPostings: jobs.filter((j: any) => j.status === "active" && !j.archived).length,
        totalApplications: myApplications.length,
        pendingApplications: myApplications.filter((a: any) => a.status === "pending").length,
        shortlistedCandidates: myApplications.filter((a: any) => a.status === "shortlisted").length,
        hiredCandidates: myApplications.filter((a: any) => a.status === "accepted").length,
        recentApplications: myApplications.slice(0, 10),
      };

      return res.json(stats);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // PUT /api/employer/applications/:id - Update application status
  app.put("/api/employer/applications/:id", authMiddleware, async (req: any, res: Response) => {
    try {
      if (req.user.role !== "employer") {
        return res.status(403).json({ error: "Only employers can update applications" });
      }

      const applicationId = req.params.id;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const db = getDatabase();
      const now = new Date();

      await db
        .update(applicationsTable)
        .set({
          status,
          notes: notes || null,
          updatedAt: now,
        })
        .where(eq(applicationsTable.id, applicationId));

      return res.json({ message: "Application status updated successfully" });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // ============ ADMIN STAKEHOLDER MANAGEMENT ROUTES ============

  // GET /api/admin/stakeholders - Get all users (jobseekers, employers)
  app.get("/api/admin/stakeholders", authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
      const { role, search, limit = "20", offset = "0" } = req.query;

      const db = getDatabase();
      
      // Get jobseekers/freelancers from applicants table
      const applicants = await db.query.applicantsTable.findMany({
        where: (table: any) => eq(table.hasAccount, true),
      });
      
      // Get employers from employers table
      const employers = await db.query.employersTable.findMany({
        where: (table: any) => eq(table.hasAccount, true),
      });

      // Combine and format
      let users = [
        ...applicants.map((a: any) => ({
          id: a.id,
          name: `${a.firstName} ${a.surname}`,
          email: a.email,
          role: a.role,
          createdAt: a.createdAt,
        })),
        ...employers.map((e: any) => ({
          id: e.id,
          name: e.establishmentName,
          email: e.email,
          role: "employer",
          company: e.establishmentName,
          createdAt: e.createdAt,
        }))
      ];

      // Apply role filter
      if (role && role !== "all") {
        users = users.filter((u: any) => u.role === role);
      }

      // Apply search filter
      if (search) {
        const searchLower = (search as string).toLowerCase();
        users = users.filter((u: any) =>
          u.name?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower) ||
          u.company?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const paginatedUsers = users.slice(offsetNum, offsetNum + limitNum);

      return res.json({
        users: paginatedUsers,
        total: users.length,
        limit: limitNum,
        offset: offsetNum,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/admin/applicants - Get all NSRP applicants with filtering
  app.get("/api/admin/applicants", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { employmentStatus, barangay, employmentType, search, registeredFrom, registeredTo, sortBy = "createdAt", sortOrder = "desc", limit = "20", offset = "0" } = req.query;

      const db = getDatabase();
      let applicants = await db.query.applicantsTable.findMany();

      // Apply filters
      if (employmentStatus) {
        applicants = applicants.filter((a: any) => a.employmentStatus === employmentStatus);
      }

      if (barangay) {
        applicants = applicants.filter((a: any) => a.barangay === barangay);
      }

      if (employmentType) {
        applicants = applicants.filter((a: any) => a.employmentType === employmentType);
      }

      if (registeredFrom || registeredTo) {
        applicants = applicants.filter((a: any) => {
          if (!a.createdAt) return false;
          const created = new Date(a.createdAt);
          if (registeredFrom && created < new Date(registeredFrom as string)) return false;
          if (registeredTo && created > new Date(registeredTo as string)) return false;
          return true;
        });
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        applicants = applicants.filter((a: any) =>
          a.firstName?.toLowerCase().includes(searchLower) ||
          a.surname?.toLowerCase().includes(searchLower) ||
          a.email?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      // Sort applicants
      if (sortBy) {
        applicants = applicants.sort((a: any, b: any) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];
          // If sorting by date, convert to Date
          if (sortBy.toLowerCase().includes('date') || sortBy === 'createdAt') {
            aValue = aValue ? new Date(aValue) : new Date(0);
            bValue = bValue ? new Date(bValue) : new Date(0);
          }
          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const paginatedApplicants = applicants.slice(offsetNum, offsetNum + limitNum);

      return res.json({
        applicants: paginatedApplicants,
        total: applicants.length,
        limit: limitNum,
        offset: offsetNum,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/admin/employers - Get all employers with filtering
  app.get("/api/admin/employers", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { industryType, municipality, search, limit = "20", offset = "0" } = req.query;

      const db = getDatabase();
      let employers = await db.query.employersTable.findMany();

      // Apply filters
      if (industryType) {
        employers = employers.filter((e: any) =>
          e.industryType?.includes(industryType as string)
        );
      }

      if (municipality) {
        employers = employers.filter((e: any) => e.municipality === municipality);
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        employers = employers.filter((e: any) =>
          e.establishmentName?.toLowerCase().includes(searchLower) ||
          e.email?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const paginatedEmployers = employers.slice(offsetNum, offsetNum + limitNum);

      return res.json({
        employers: paginatedEmployers,
        total: employers.length,
        limit: limitNum,
        offset: offsetNum,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/admin/dashboard - Get comprehensive admin dashboard stats
  app.get("/api/admin/dashboard", authMiddleware, adminOnly, async (_req: Request, res: Response) => {
    try {
      const db = getDatabase();
      
      const applicants = await db.query.applicantsTable.findMany();
      const employers = await db.query.employersTable.findMany();
      const jobs = await db.query.jobsTable.findMany();
      const applications = await db.query.applicationsTable.findMany();

      const jobseekersWithAccounts = applicants.filter((a: any) => a.hasAccount && a.role === "jobseeker");
      const freelancersWithAccounts = applicants.filter((a: any) => a.hasAccount && a.role === "freelancer");
      const employersWithAccounts = employers.filter((e: any) => e.hasAccount);

      const stats = {
        totalUsers: jobseekersWithAccounts.length + freelancersWithAccounts.length + employersWithAccounts.length,
        totalJobseekers: jobseekersWithAccounts.length,
        totalFreelancers: freelancersWithAccounts.length,
        totalEmployers: employersWithAccounts.length,
        totalApplicants: applicants.length,
        totalEmployerEstablishments: employers.length,
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j: any) => j.status === "active" && !j.archived).length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((a: any) => a.status === "pending").length,
        recentActivity: [], // TODO: Implement activity log
      };

      return res.json(stats);
    } catch (error) {
      return sendError(res, error);
    }
  });

  // DELETE /api/admin/users/:id - Delete a user (admin only)
  app.delete("/api/admin/users/:id", authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const db = getDatabase();

      // Try deleting from applicants first
      const deletedApplicant = await db.delete(applicantsTable).where(eq(applicantsTable.id, userId));
      
      // If not found in applicants, try employers
      if (!deletedApplicant) {
        await db.delete(employersTable).where(eq(employersTable.id, userId));
      }

      return res.json({ message: "User deleted successfully" });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // PUT /api/admin/users/:id/suspend - Suspend/activate a user
  app.put("/api/admin/users/:id/suspend", authMiddleware, adminOnly, async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const { suspended } = req.body;
      const db = getDatabase();
      const now = new Date();

      // Try updating applicants first
      const applicant = await db.query.applicantsTable.findFirst({
        where: (table: any) => eq(table.id, userId),
      });

      if (applicant) {
        // For simplicity, we'll add a 'suspended' field later if needed
        // For now, just update the timestamp
        await db.update(applicantsTable).set({ updatedAt: now }).where(eq(applicantsTable.id, userId));
      } else {
        // Try employers
        await db.update(employersTable).set({ updatedAt: now }).where(eq(employersTable.id, userId));
      }

      return res.json({
        message: suspended ? "User suspended successfully" : "User activated successfully",
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  // GET /api/job-vacancies/:vacancyId/check-application - Check if user has already applied
  app.get("/api/job-vacancies/:vacancyId/check-application", authMiddleware, async (req: any, res) => {
    try {
      if (!["jobseeker", "freelancer"].includes(req.user.role)) {
        return res.json({ hasApplied: false });
      }

      const { vacancyId } = req.params;
      const db = getDatabase();

      const existingApplication = await db
        .select()
        .from(applicationsTable)
        .where(
          and(
            eq(applicationsTable.jobId, vacancyId),
            eq(applicationsTable.applicantId, req.user.id)
          )
        )
        .limit(1);

      res.json({ 
        hasApplied: existingApplication.length > 0,
        application: existingApplication[0] || null,
      });
    } catch (error: any) {
      return sendError(res, error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
