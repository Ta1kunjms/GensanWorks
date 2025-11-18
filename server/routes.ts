import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { referralFiltersSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/summary - Returns summary metrics for dashboard cards
  app.get("/api/summary", async (_req, res) => {
    try {
      const data = await storage.getSummaryData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch summary data" });
    }
  });

  // GET /api/recent-activities - Returns recent activity feed
  app.get("/api/recent-activities", async (_req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent activities" });
    }
  });

  // GET /api/charts/bar - Returns bar chart data for applicants by barangay
  app.get("/api/charts/bar", async (_req, res) => {
    try {
      const data = await storage.getBarChartData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bar chart data" });
    }
  });

  // GET /api/charts/doughnut - Returns doughnut chart data for jobseeker vs freelancer
  app.get("/api/charts/doughnut", async (_req, res) => {
    try {
      const data = await storage.getDoughnutChartData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doughnut chart data" });
    }
  });

  // GET /api/charts/line - Returns line chart data for monthly referrals trend
  app.get("/api/charts/line", async (_req, res) => {
    try {
      const data = await storage.getLineChartData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch line chart data" });
    }
  });

  // GET /api/referrals - Returns referral table data with optional filters
  app.get("/api/referrals", async (req, res) => {
    try {
      const filters = referralFiltersSchema.parse({
        barangay: req.query.barangay as string | undefined,
        employer: req.query.employer as string | undefined,
        jobCategory: req.query.jobCategory as string | undefined,
        dateRange: req.query.dateRange as string | undefined,
        status: req.query.status as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      });

      const referrals = await storage.getReferrals(filters);
      res.json(referrals);
    } catch (error) {
      res.status(400).json({ error: "Invalid filter parameters" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
