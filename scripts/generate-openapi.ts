import fs from "fs";
import path from "path";
import YAML from "yaml";
import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import {
  authSettingsSchema,
  generalSettingsSchema,
  loginSchema,
  changePasswordSchema,
  applicantSchema,
  applicantCreateSchema,
  employerSchema,
  employerCreateSchema,
  jobCreateSchema,
  jobTableSchema,
  referralSchema,
  noteSchema,
  notificationSchema,
  applicationSchema,
  jobseekerCreateSchema,
  adminCreateSchema,
  referralFiltersSchema,
  notesFiltersSchema,
  adminAccessRequestSchema,
} from "../shared/schema";

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
const registerSchema = (name: string, schema: z.ZodTypeAny) => {
  registry.register(name, schema);
};

const schemaMap: Record<string, z.ZodTypeAny> = {
  AuthSettings: authSettingsSchema,
  GeneralSettings: generalSettingsSchema,
  LoginRequest: loginSchema,
  ChangePassword: changePasswordSchema,
  Applicant: applicantSchema,
  ApplicantCreate: applicantCreateSchema,
  Employer: employerSchema,
  EmployerCreate: employerCreateSchema,
  Job: jobTableSchema,
  JobCreate: jobCreateSchema,
  Referral: referralSchema,
  ReferralFilters: referralFiltersSchema,
  Note: noteSchema,
  NotesFilters: notesFiltersSchema,
  Notification: notificationSchema,
  Application: applicationSchema,
  JobseekerCreate: jobseekerCreateSchema,
  AdminCreate: adminCreateSchema,
  AdminAccessRequest: adminAccessRequestSchema,
};

Object.entries(schemaMap).forEach(([name, schema]) => registerSchema(name, schema));

// Common error response schema
const errorResponseSchema = z.object({
  code: z.string().optional(),
  message: z.string(),
  field: z.string().optional(),
});
registerSchema("ErrorResponse", errorResponseSchema);

const routesPath = path.resolve(process.cwd(), "server/routes.ts");
const source = fs.readFileSync(routesPath, "utf8");
const routeRegex = /app\.(get|post|put|patch|delete)\(\s*["'`](.*?)["'`]/g;

const isPublicRoute = (route: string, method: string) => {
  if (!route.startsWith("/api")) return true;
  if (route.startsWith("/api/auth/login")) return true;
  if (route.includes("/auth/signup")) return true;
  if (route.includes("/auth/google")) return true;
  if (route.includes("/public/")) return true;
  if (route.includes("/health")) return true;
  if (route.startsWith("/api/summary")) return true;
  if (route.startsWith("/api/recent-activities")) return true;
  if (route.startsWith("/api/charts")) return true;
  if (route.startsWith("/api/referrals")) return true;
  if (route.startsWith("/api/notes")) return true;
  if (route.startsWith("/api/job-vacancies")) return true;
  if (route === "/api/jobs" && method.toLowerCase() === "get") return true;
  return false;
};

const defaultSchema = z
  .object({})
  .passthrough()
  .openapi({ title: "GenericResponse" });

const anySchema = z.object({}).passthrough();

const healthSchema = z.object({ status: z.string() });

const skillsReportSchema = z.object({
  topSkills: z.array(anySchema).default([]),
  expectedSkillsShortage: z.array(anySchema).default([]),
});

const adminAccessRequestCreateSchema = adminAccessRequestSchema.omit({
  id: true,
  status: true,
  createdAt: true,
});

const adminAccessRequestResponseSchema = adminAccessRequestSchema.partial().extend({
  id: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

type RouteMethod = "get" | "post" | "put" | "patch" | "delete";

type RouteShape = {
  requestBody?: z.ZodTypeAny;
  response?: z.ZodTypeAny | { [status: string]: z.ZodTypeAny };
  query?: z.ZodTypeAny;
  params?: string[];
  description?: string;
  authRequired?: boolean;
};

const routeShapes: Array<{
  methods: RouteMethod[];
  path: RegExp;
  shape: RouteShape;
}> = [
  {
    methods: ["get"],
    path: /^\/api\/settings\/general\/public$/, // public settings
    shape: { response: generalSettingsSchema, authRequired: false },
  },
  {
    methods: ["get"],
    path: /^\/api\/health$/,
    shape: { response: healthSchema, authRequired: false },
  },
  {
    methods: ["get", "put"],
    path: /^\/api\/settings\/general$/,
    shape: { requestBody: generalSettingsSchema, response: generalSettingsSchema },
  },
  {
    methods: ["get", "put"],
    path: /^\/api\/settings\/auth$/,
    shape: { requestBody: authSettingsSchema, response: authSettingsSchema },
  },
  {
    methods: ["get"],
    path: /^\/api\/settings\/auth\/public$/,
    shape: { response: authSettingsSchema, authRequired: false },
  },
  {
    methods: ["post"],
    path: /^\/api\/auth\/login$/,
    shape: { requestBody: loginSchema, response: z.object({ token: z.string().optional(), user: anySchema }) },
  },
  {
    methods: ["get"],
    path: /^\/api\/auth\/me$/,
    shape: { response: z.object({ user: anySchema.optional() }) },
  },
  {
    methods: ["post"],
    path: /^\/api\/auth\/logout$/,
    shape: { response: z.object({ success: z.boolean().optional() }), authRequired: false },
  },
  {
    methods: ["post"],
    path: /^\/api\/auth\/signup\/jobseeker$/,
    shape: { requestBody: jobseekerCreateSchema, response: z.object({ user: anySchema }), authRequired: false },
  },
  {
    methods: ["post"],
    path: /^\/api\/auth\/signup\/employer$/,
    shape: { requestBody: employerCreateSchema, response: z.object({ user: anySchema }), authRequired: false },
  },
  {
    methods: ["post"],
    path: /^\/api\/auth\/signup\/admin$/,
    shape: { requestBody: adminCreateSchema, response: z.object({ user: anySchema }), authRequired: false },
  },
  {
    methods: ["get"],
    path: /^\/api\/messages$/,
    shape: { response: z.array(anySchema) },
  },
  {
    methods: ["post"],
    path: /^\/api\/messages$/,
    shape: {
      requestBody: z.object({ toUserId: z.string(), body: z.string() }),
      response: anySchema,
    },
  },
  {
    methods: ["get"],
    path: /^\/api\/messages\/conversation\/[^/]+$/,
    shape: { response: z.array(anySchema), params: ["userId"] },
  },
  {
    methods: ["patch"],
    path: /^\/api\/messages\/[^/]+\/read$/,
    shape: { response: z.object({ success: z.boolean().optional() }), params: ["id"] },
  },
  {
    methods: ["get"],
    path: /^\/api\/messages\/unread\/count$/,
    shape: { response: z.object({ count: z.number() }) },
  },
  {
    methods: ["get"],
    path: /^\/auth\/google$/,
    shape: { response: defaultSchema, authRequired: false },
  },
  {
    methods: ["get"],
    path: /^\/auth\/google\/callback$/,
    shape: { response: defaultSchema, authRequired: false },
  },
  {
    methods: ["get"],
    path: /^\/api\/summary$/,
    shape: { response: anySchema, authRequired: false },
  },
  {
    methods: ["get"],
    path: /^\/api\/recent-activities$/,
    shape: { response: z.array(anySchema), authRequired: false },
  },
  {
    methods: ["get"],
    path: /^\/api\/chats|^\/api\/charts\//,
    shape: { response: anySchema, authRequired: false },
  },
  {
    methods: ["get"],
    path: /^\/api\/referrals$/,
    shape: { response: z.array(referralSchema), query: referralFiltersSchema, authRequired: false },
  },
  {
    methods: ["get"],
    path: /^\/api\/notes$/,
    shape: { response: z.array(noteSchema), query: notesFiltersSchema, authRequired: false },
  },
  {
    methods: ["get"],
    path: /^\/api\/job-vacancies$/,
    shape: { response: z.array(jobTableSchema), authRequired: false },
  },
  {
    methods: ["get"],
    path: /^\/api\/jobs$/,
    shape: { response: z.array(jobTableSchema), authRequired: false },
  },
  {
    methods: ["post"],
    path: /^\/api\/jobs$/,
    shape: { requestBody: jobCreateSchema, response: jobTableSchema },
  },
  {
    methods: ["get"],
    path: /^\/api\/jobs\/archived$/,
    shape: { response: z.array(jobTableSchema) },
  },
  {
    methods: ["patch"],
    path: /^\/api\/jobs\/[^/]+\/archive$/,
    shape: { response: jobTableSchema, params: ["jobId"] },
  },
  {
    methods: ["patch"],
    path: /^\/api\/jobs\/[^/]+\/unarchive$/,
    shape: { response: jobTableSchema, params: ["jobId"] },
  },
  {
    methods: ["put", "delete"],
    path: /^\/api\/jobs\/[^/]+$/,
    shape: { requestBody: jobCreateSchema, response: jobTableSchema, params: ["jobId"] },
  },
  {
    methods: ["post"],
    path: /^\/api\/jobs\/[^/]+\/apply$/,
    shape: { response: applicationSchema, params: ["jobId"] },
  },
  {
    methods: ["get"],
    path: /^\/api\/applicants$/,
    shape: {
      response: z.array(applicantSchema),
      query: z.object({ status: z.string().optional(), limit: z.number().optional(), offset: z.number().optional() }).partial(),
    },
  },
  {
    methods: ["get", "put", "delete"],
    path: /^\/api\/applicants\/[^/]+$/,
    shape: { requestBody: applicantSchema.partial(), response: applicantSchema, params: ["id"] },
  },
  {
    methods: ["post"],
    path: /^\/api\/applicants\/bulk-delete$/,
    shape: { requestBody: z.object({ ids: z.array(z.string()) }), response: z.object({ success: z.boolean().optional() }) },
  },
  {
    methods: ["get"],
    path: /^\/api\/employers$/,
    shape: { response: z.array(employerSchema.partial()) },
  },
  {
    methods: ["post"],
    path: /^\/api\/employers$/,
    shape: { requestBody: employerCreateSchema, response: employerSchema },
  },
  {
    methods: ["get", "put", "delete"],
    path: /^\/api\/employers\/[^/]+$/,
    shape: { requestBody: employerSchema.partial(), response: employerSchema, params: ["id"] },
  },
  {
    methods: ["patch"],
    path: /^\/api\/employers\/[^/]+\/archive$/,
    shape: { response: employerSchema, params: ["id"] },
  },
  {
    methods: ["patch"],
    path: /^\/api\/employers\/[^/]+\/requirements\/submit-all$/,
    shape: { params: ["id"], response: z.object({ success: z.boolean().optional(), requirements: anySchema.optional() }) },
  },
  {
    methods: ["post"],
    path: /^\/api\/employers\/check-duplicate$/,
    shape: { requestBody: z.object({ establishmentName: z.string().optional(), email: z.string().optional() }), response: z.object({ duplicate: z.boolean() }) },
  },
  {
    methods: ["post"],
    path: /^\/api\/employers\/bulk-delete$/,
    shape: { requestBody: z.object({ ids: z.array(z.string()) }), response: z.object({ deleted: z.number().optional() }) },
  },
  {
    methods: ["get"],
    path: /^\/api\/employer\/profile$/,
    shape: { response: employerSchema },
  },
  {
    methods: ["put"],
    path: /^\/api\/employer\/profile$/,
    shape: { requestBody: employerSchema.partial(), response: employerSchema },
  },
  {
    methods: ["get", "post"],
    path: /^\/api\/employer\/jobs$/,
    shape: { requestBody: jobCreateSchema, response: z.array(jobTableSchema) },
  },
  {
    methods: ["put", "delete"],
    path: /^\/api\/employer\/jobs\/[^/]+$/,
    shape: { requestBody: jobCreateSchema, response: jobTableSchema, params: ["jobId"] },
  },
  {
    methods: ["patch"],
    path: /^\/api\/employer\/jobs\/[^/]+\/archive$/,
    shape: { response: jobTableSchema, params: ["jobId"] },
  },
  {
    methods: ["get"],
    path: /^\/api\/jobseeker\/applications$/,
    shape: { response: z.array(applicationSchema) },
  },
  {
    methods: ["get"],
    path: /^\/api\/jobseeker\/dashboard$/,
    shape: { response: anySchema },
  },
  {
    methods: ["get"],
    path: /^\/api\/employer\/dashboard$/,
    shape: {
      response: z.object({
        totalJobPostings: z.number(),
        activeJobPostings: z.number(),
        totalApplications: z.number(),
        pendingApplications: z.number(),
        shortlistedCandidates: z.number(),
        hiredCandidates: z.number(),
        recentApplications: z.array(anySchema),
      }),
    },
  },
  {
    methods: ["post"],
    path: /^\/api\/jobseeker\/profile-image$/,
    shape: {
      requestBody: z.object({ image: z.string(), fileName: z.string().optional(), mimeType: z.string().optional() }),
      response: z.object({ imageUrl: z.string().optional() }),
    },
  },
  {
    methods: ["post"],
    path: /^\/api\/jobseeker\/change-password$/,
    shape: { requestBody: changePasswordSchema, response: z.object({ success: z.boolean().optional() }) },
  },
  {
    methods: ["delete"],
    path: /^\/api\/account$/,
    shape: { response: z.object({ message: z.string().optional() }) },
  },
  {
    methods: ["put"],
    path: /^\/api\/employer\/applications\/[^/]+$/,
    shape: { requestBody: z.object({ status: z.string().optional(), notes: z.string().optional() }), response: z.object({ success: z.boolean().optional() }), params: ["id"] },
  },
  {
    methods: ["get"],
    path: /^\/api\/admin\/stats$/,
    shape: { response: anySchema },
  },
  {
    methods: ["post"],
    path: /^\/api\/admin\/create-admin-user$/,
    shape: {
      requestBody: adminCreateSchema.extend({ requestId: z.string().optional() }),
      response: z.object({
        message: z.string(),
        admin: anySchema.optional(),
        action: z.enum(["created", "updated"]).optional(),
      }),
    },
  },
  {
    methods: ["get"],
    path: /^\/api\/admin\/dashboard$/,
    shape: { response: anySchema },
  },
  {
    methods: ["get"],
    path: /^\/api\/admin\/system-alerts$/,
    shape: { response: anySchema },
  },
  {
    methods: ["get"],
    path: /^\/api\/admin\/stakeholders$/,
    shape: { response: anySchema },
  },
  {
    methods: ["patch"],
    path: /^\/api\/admin\/jobs\/[^/]+\/status$/,
    shape: {
      params: ["id"],
      requestBody: z.object({ status: z.string() }),
      response: z.object({ message: z.string(), job: jobTableSchema.optional() }),
    },
  },
  {
    methods: ["get"],
    path: /^\/api\/admin\/access-requests$/,
    shape: {
      query: z.object({ status: z.string().optional() }).partial(),
      response: z.array(adminAccessRequestResponseSchema),
    },
  },
  {
    methods: ["post"],
    path: /^\/api\/admin\/access-requests$/,
    shape: { requestBody: adminAccessRequestCreateSchema, response: adminAccessRequestResponseSchema },
  },
  {
    methods: ["post"],
    path: /^\/api\/admin\/access-requests\/[^/]+\/approve$/,
    shape: { params: ["id"], response: adminAccessRequestResponseSchema },
  },
  {
    methods: ["post"],
    path: /^\/api\/admin\/access-requests\/[^/]+\/reject$/,
    shape: { params: ["id"], response: adminAccessRequestResponseSchema },
  },
  {
    methods: ["get"],
    path: /^\/api\/admin\/applications$/,
    shape: { response: z.array(applicationSchema) },
  },
  {
    methods: ["get"],
    path: /^\/api\/reports\/skills$/,
    shape: { query: z.object({ startDate: z.string().optional(), endDate: z.string().optional() }), response: skillsReportSchema },
  },
  {
    methods: ["get"],
    path: /^\/api\/jobs\/[^/]+\/match$/,
    shape: {
      params: ["jobId"],
      query: z.object({ minScore: z.coerce.number().optional(), maxResults: z.coerce.number().optional(), includeInsights: z.string().optional() }),
      response: z.object({
        jobId: z.string(),
        jobTitle: z.string(),
        matches: z.array(anySchema),
        total: z.number(),
        criteria: z.object({ minScore: z.number(), maxResults: z.number() }),
      }),
    },
  },
  {
    methods: ["get"],
    path: /^\/api\/jobs\/[^/]+\/applicant\/[^/]+\/ai-insights$/,
    shape: {
      params: ["jobId", "applicantId"],
      response: z.object({
        aiComment: z.string().optional(),
        whyQualified: z.string().optional(),
        hiringRecommendation: z.string().optional(),
        potentialRole: z.string().optional(),
        developmentAreas: anySchema.optional(),
      }),
    },
  },
  {
    methods: ["get"],
    path: /^\/api\/admin\/users$/,
    shape: { response: z.array(anySchema) },
  },
  {
    methods: ["delete", "put", "patch"],
    path: /^\/api\/admin\/users\/[^/]+$/,
    shape: { response: anySchema, params: ["id"], requestBody: anySchema.optional() },
  },
  {
    methods: ["put"],
    path: /^\/api\/admin\/users\/[^/]+\/suspend$/,
    shape: { params: ["id"], requestBody: z.object({ suspended: z.boolean().optional() }), response: z.object({ message: z.string() }) },
  },
  {
    methods: ["get"],
    path: /^\/api\/admin\/jobs$/,
    shape: { response: z.array(jobTableSchema) },
  },
  {
    methods: ["post"],
    path: /^\/api\/admin\/jobs$/,
    shape: { requestBody: jobCreateSchema, response: jobTableSchema },
  },
  {
    methods: ["put", "delete"],
    path: /^\/api\/admin\/jobs\/[^/]+$/,
    shape: { requestBody: jobCreateSchema, response: jobTableSchema, params: ["id"] },
  },
  {
    methods: ["get"],
    path: /^\/api\/admin\/applicants$/,
    shape: { response: z.array(applicantSchema) },
  },
  {
    methods: ["get"],
    path: /^\/api\/admin\/employers$/,
    shape: { response: z.array(employerSchema) },
  },
  {
    methods: ["get"],
    path: /^\/api\/public\/impact$/,
    shape: {
      response: z.object({
        avgTimeToInterview: z.string(),
        avgSalary: z.string(),
        satisfactionRate: z.string(),
        yearsOfService: z.number(),
      }),
      authRequired: false,
    },
  },
  {
    methods: ["get"],
    path: /^\/api\/notifications\/stream$/,
    shape: { response: z.string().openapi({ type: "string", format: "event-stream" }) },
  },
  {
    methods: ["get"],
    path: /^\/api\/notifications$/,
    shape: { response: z.array(notificationSchema) },
  },
  {
    methods: ["post"],
    path: /^\/api\/notifications$/,
    shape: { requestBody: z.object({ role: z.string().nullable().optional(), userId: z.string().nullable().optional(), type: z.string().optional(), message: z.string() }), response: notificationSchema },
  },
  {
    methods: ["patch"],
    path: /^\/api\/notifications\/[^/]+\/read$/,
    shape: { params: ["id"], response: z.object({ id: z.string(), read: z.boolean() }) },
  },
];

const discovered: { method: string; path: string }[] = [];
let match: RegExpExecArray | null;
while ((match = routeRegex.exec(source)) !== null) {
  const method = match[1].toLowerCase();
  const routePath = match[2];
  discovered.push({ method, path: routePath });
}

const unique = Array.from(
  new Map(discovered.map((r) => [`${r.method}:${r.path}`, r])).values()
);

const unmatchedRoutes: { method: string; path: string }[] = [];

unique.forEach(({ method, path: routePath }) => {
  const matchShape = routeShapes.find((rs) => rs.methods.includes(method as RouteMethod) && rs.path.test(routePath));
  if (!matchShape) unmatchedRoutes.push({ method, path: routePath });
  const requiresAuth = matchShape?.shape.authRequired ?? !isPublicRoute(routePath, method);
  const responses: Record<string, any> = {};

  const shapeResponses = matchShape?.shape.response;
  if (shapeResponses && typeof shapeResponses === "object" && !(shapeResponses as any)._def) {
    Object.entries(shapeResponses as Record<string, z.ZodTypeAny>).forEach(([status, schema]) => {
      responses[status] = {
        description: "Success",
        content: {
          "application/json": { schema },
        },
      };
    });
  } else {
    const successSchema = (shapeResponses as z.ZodTypeAny) || defaultSchema;
    responses["200"] = {
      description: "Success",
      content: {
        "application/json": { schema: successSchema },
      },
    };
  }

  responses["400"] = {
    description: "Bad Request",
    content: { "application/json": { schema: errorResponseSchema } },
  };

  if (requiresAuth) {
    responses["401"] = { description: "Unauthorized", content: { "application/json": { schema: errorResponseSchema } } };
  }

  registry.registerPath({
    method: method as any,
    path: routePath,
    summary: `${method.toUpperCase()} ${routePath}`,
    description: "Auto-generated from server/routes.ts. Refine in scripts/generate-openapi.ts if needed.",
    security: requiresAuth ? [{ sessionCookie: [] }] : undefined,
    responses,
    request:
      matchShape?.shape.requestBody || matchShape?.shape.query
        ? {
            body: matchShape?.shape.requestBody
              ? {
                  content: {
                    "application/json": {
                      schema: matchShape.shape.requestBody,
                    },
                  },
                }
              : undefined,
            query: matchShape?.shape.query,
          }
        : undefined,
    parameters:
      matchShape?.shape.params
        ? (
            (matchShape?.shape.params || []).map((name) => ({
              name,
              in: "path" as const,
              required: true,
              schema: { type: "string" as const },
            })) as any[]
          )
        : undefined,
  });
});

const generator = new OpenApiGeneratorV31(registry.definitions);

const document = generator.generateDocument({
  openapi: "3.1.0",
  info: {
    title: "GensanWorks API",
    version: "1.0.0",
    description:
      "Generated from Zod schemas in shared/schema.ts and routes discovered in server/routes.ts.",
  },
  servers: [
    { url: "http://localhost:5000", description: "Local development" },
  ],
  security: [{ sessionCookie: [] }],
});

document.components = document.components || {};
document.components.securitySchemes = {
  sessionCookie: {
    type: "apiKey",
    in: "cookie",
    name: "connect.sid",
  },
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
};
const outputPath = path.resolve(process.cwd(), "openapi.yaml");
fs.writeFileSync(outputPath, YAML.stringify(document), "utf8");
console.log(`[openapi] Wrote spec with ${unique.length} routes to ${outputPath}`);
if (unmatchedRoutes.length) {
  console.log(`[openapi] Routes using GenericResponse (add to routeShapes for better typing): ${unmatchedRoutes.length}`);
  unmatchedRoutes.forEach((r) => console.log(` - ${r.method.toUpperCase()} ${r.path}`));
}
