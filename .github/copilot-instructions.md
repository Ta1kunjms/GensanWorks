Project: GensanWorks — quick AI helper notes

Purpose
- Help AI coding agents be immediately productive in this repo (fullstack Vite + Express + TypeScript).

Quick architecture (big picture)
- Mono-repo layout: `client/` (React + Vite app), `server/` (Express + API + Vite middleware), `shared/` (Zod schemas/types).
- Dev flow: `npm run dev` starts the Node server (`server/index.ts`) which mounts Vite in middleware mode. In dev the same port (default `PORT=5000`) serves both API and the client via Vite.
- Prod flow: `npm run build` runs `vite build` (client) then bundles the server with `esbuild` into `dist`. After build `npm start` runs `node dist/index.js`. The server expects built client files under the compiled `dist` `public` folder (see `server.vite.serveStatic`).

Important files to inspect (examples)
- Server entry and middleware: `server/index.ts` (logging middleware; error handler; conditional Vite setup). Example: logs API JSON responses and truncates long lines.
- Server + Vite integration: `server/vite.ts` (dev `middlewareMode` and `serveStatic` for production). Note: dev uses `vite.transformIndexHtml` to inject a cache-busting query param.
- Routes and API surface: `server/routes.ts` — endpoints: `/api/summary`, `/api/recent-activities`, `/api/charts/*`, `/api/referrals`.
- In-memory storage implementation: `server/storage.ts` (exports `storage` singleton). Use this for mocked data behavior and filter logic (status normalization, limit/offset).
- Shared schemas & types: `shared/schema.ts` — Zod schemas are the canonical source of truth for API payloads and filters (use `referralFiltersSchema` for parsing query params).
- Client entry and patterns: `client/src/App.tsx`, `client/src/main.tsx`. UI primitives and shared components live under `client/src/components/ui` (radix-based primitives and custom wrappers).

Project-specific conventions and patterns
- Aliases: Vite resolver aliases are used throughout. Key aliases:
  - `@` -> `client/src`
  - `@shared` -> `shared`
  - `@assets` -> `attached_assets`
  Use these when importing from server or client code (examples: `import { referralFiltersSchema } from "@shared/schema"`).
- Zod-first contract: `shared/schema.ts` defines Zod schemas and TypeScript types. Server routes parse/transform query params using these schemas (do not duplicate validation logic elsewhere).
- Single storage export: `server/storage.ts` exports a `storage` instance (MemStorage) implementing `IStorage`. Tests or features often replace this by swapping the instance — changing behavior at that single point affects all routes.
- Logging and response capture: server uses a middleware that captures `res.json(...)` output for `/api` routes — be mindful when changing response flow or streaming responses.

Build / run / debug commands
- Install: `npm install` (run from repo root).
- Development (recommended):
  - `npm run dev` — runs `tsx server/index.ts` with Vite middleware. Visit `http://localhost:5000` (port from `PORT` or default `5000`).
  - Behavior: edits to client files are hot-reloaded by Vite; server restarts aren't automatic for server-side TypeScript unless editor tooling restarts the process.
- Production build & run:
  - `npm run build` — runs `vite build` then bundles the server to `dist/` via `esbuild`.
  - `npm start` — runs the bundled `node dist/index.js` (server serves the client files from `dist/public`).
- Other scripts:
  - `npm run check` — TypeScript compile check (`tsc`).
  - `npm run db:push` — runs `drizzle-kit push` (database migrations; present if using Drizzle).

Integration points & external deps to watch
- Database / ORM: `drizzle-orm` + `drizzle-kit` referenced; migrations use `db:push`. There is currently an in-memory `MemStorage` in `server/storage.ts` used for demo/seed data.
- Auth/session: `passport`, `express-session`, `connect-pg-simple` and `memorystore` are present in `package.json` — if adding persistent sessions, check how `server/index.ts` and session stores integrate elsewhere.
- Client libs: React Query (`@tanstack/react-query`) is used (`client/lib/queryClient.ts`). Use it for caching API calls and follow existing query keys.

When changing API shapes
- Update `shared/schema.ts` first (Zod schemas + derived TypeScript types), then update `server/routes.ts` (parsing) and client fetchers that consume those endpoints.
- Favor `referralFiltersSchema` for query parsing to keep normalization centralised (server relies on it to map lower-case `status` to canonical case).

Notes for AI agents (how to make small, safe changes)
- Prefer localized edits: update `shared/schema.ts` and corresponding server and client files together.
- When modifying endpoints, run `npm run dev` and test the endpoint in-browser at `http://localhost:5000/api/...` — dev server uses Vite middleware for client files.
- For production-aimed changes, run `npm run build` and check `dist/` structure. `server/vite.ts` serves static from `public` relative to the compiled server, so ensure `vite build` output matches that path.

Examples to reference in PRs or fixes
- Add a new endpoint: follow `server/routes.ts` style, call `storage.*` and return JSON; use `referralFiltersSchema` if accepting query params.
- Add a new shared type: add a Zod schema to `shared/schema.ts`, export its TypeScript type, then update callers in `server` and `client`.

If something is unclear
- Tell me which endpoint, component, or workflow you want clarified and I will expand this file with concrete code snippets and commands.

Troubleshooting (quick fixes)
- Port in use: the server binds to `127.0.0.1:${process.env.PORT||5000}` — set `PORT` or stop other processes using the port.
- Missing `dist/public` in prod: run `npm run build` before `npm start`. `server/vite.ts` will throw if `dist/public` is absent.
- HMR not updating server code: Vite HMR only reloads client code. Restart the `npm run dev` process after changing server-side TS.
- Alias import errors: confirm `vite.config.ts` `resolve.alias` mapping (`@`, `@shared`, `@assets`) and that imports use those exact aliases.
- Zod validation errors: routes use `referralFiltersSchema`; invalid query params return HTTP 400 with a simple error message.

Quick examples
- Fetch summary: `curl http://localhost:5000/api/summary`
- Fetch referrals (limit + status):
  `curl "http://localhost:5000/api/referrals?status=hired&limit=5"`

PR checklist (minimal)
- **Schema:** Update `shared/schema.ts` first for any API shape change.
- **Server:** Update `server/routes.ts` to parse and validate inputs using the Zod schemas.
- **Storage:** If data shape changes, update `server/storage.ts` (the `storage` singleton) or implement a new storage adapter.
- **Client:** Update client fetchers / React Query keys under `client/` (`client/lib/queryClient.ts` and components that call APIs).
- **Sanity:** Run `npm run check` and smoke-test with `npm run dev` (open `http://localhost:5000`).

Switching from demo memory storage to a database
- The repo uses an in-memory `MemStorage` exported from `server/storage.ts`. To use a real DB:
  - Implement a new class that satisfies `IStorage` in `server/storage.ts` and swap the exported instance based on an env var.
  - Drizzle is present in `package.json` — use `drizzle-orm` and `drizzle-kit` and run `npm run db:push` for migrations.

If you'd like, I can also add a short code snippet showing how to add a new endpoint + Zod schema and a sample client fetcher.

Example: Add a new endpoint (`/api/notes`) — copy-paste-ready
 - Goal: demonstrate the Zod-first flow and where to change server, storage, and client.

1) `shared/schema.ts` — add a `noteSchema` and `notesFiltersSchema` (example):

```ts
// add to shared/schema.ts
export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
});
export type Note = z.infer<typeof noteSchema>;

export const notesFiltersSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});
```

2) `server/storage.ts` — add methods to the `IStorage` and `MemStorage` implementation:

```ts
// add to IStorage
getNotes(filters?: { limit?: number; offset?: number }): Promise<Note[]>;

// implement in MemStorage (seed simple notes array and filtering)
async getNotes(filters?: { limit?: number; offset?: number }) {
  let notes = this.notes || [];
  if (filters?.limit) notes = notes.slice(0, filters.limit);
  return notes;
}
```

3) `server/routes.ts` — register the route and parse query params with the Zod schema:

```ts
// GET /api/notes
app.get("/api/notes", async (req, res) => {
  try {
    const filters = notesFiltersSchema.parse({
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    });

    const notes = await storage.getNotes(filters);
    res.json(notes);
  } catch (e) {
    res.status(400).json({ error: "Invalid filter parameters" });
  }
});
```

4) Client fetcher example — `client/src/api/notes.ts`:

```ts
export async function fetchNotes(limit?: number) {
  const q = limit ? `?limit=${limit}` : "";
  const res = await fetch(`/api/notes${q}`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}
```

5) Quick test with curl:

```bash
curl "http://localhost:5000/api/notes?limit=5"
```

Notes:
- Keep the Zod schema in `shared/schema.ts` as the single source of truth. Update server and client only after changing schemas.
- This example is intentionally small and adds no auth; if you add protected endpoints integrate sessions/middleware accordingly.

## Comprehensive FAQ & Basic Questions

### Getting Started

**Q: How do I set up the project for the first time?**
A:
```bash
# 1. Clone/extract the repository
cd GensanWorksAdmin

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open browser and navigate to
http://localhost:5000
```
The browser will show the app; Vite will handle hot reloading for client-side changes.

**Q: What does `npm run dev` do?**
A: It starts a Node.js server running `server/index.ts` using `tsx` (TypeScript runner). The server:
- Runs Express on port 5000
- Mounts Vite in middleware mode to serve the React app with hot-reload
- Serves API endpoints from `server/routes.ts`
- Proxies API calls to the database/storage layer

**Q: Why are there multiple folders (client, server, shared)?**
A:
- `client/` — React/Vite frontend (everything users see in browser)
- `server/` — Node.js/Express backend (API endpoints, database logic)
- `shared/` — TypeScript schemas and types used by both client and server
- This structure allows code reuse and keeps concerns separated

**Q: What is TypeScript and why is it used?**
A: TypeScript is JavaScript with type checking. It catches errors at development time instead of runtime. The project uses `npm run check` to verify all types are correct before deployment.

---

### File Structure Questions

**Q: Where do I add a new React component?**
A: Add it under `client/src/components/`. Examples:
- `client/src/components/my-component.tsx` — standalone component
- `client/src/components/ui/my-button.tsx` — reusable UI element (usually from Shadcn)
- Import and use it in pages or other components with: `import { MyComponent } from "@/components/my-component"`

**Q: Where do I add a new page?**
A: Pages go in `client/src/pages/`. They're usually full-screen views:
- `client/src/pages/admin/dashboard.tsx`
- `client/src/pages/jobseeker/profile.tsx`
Route them in `client/src/App.tsx` using Wouter

**Q: Where do I modify the sidebar menu?**
A: Edit `client/src/components/app-sidebar.tsx`. Menu items are defined in the `menuItems` array. To add a link:
```tsx
{
  title: "My New Page",
  url: "/admin/my-page",
  icon: HomeIcon, // or any Lucide icon
}
```

**Q: Where is the API defined?**
A: API routes are in `server/routes.ts`. Each `app.get()`, `app.post()`, etc. defines an endpoint. Example:
```tsx
app.get("/api/my-data", (req, res) => {
  res.json({ message: "Hello" });
});
```
Visit `http://localhost:5000/api/my-data` to test.

**Q: Where are database queries?**
A: Database queries happen in `server/storage.ts`. The `MemStorage` class has methods like `getApplicants()`, `getReferrals()`. Each method queries the database and returns formatted JSON.

---

### Common Development Tasks

**Q: How do I add a new API endpoint?**
A: Follow this 3-step pattern:

1. **Add the route in `server/routes.ts`:**
```ts
app.get("/api/my-endpoint", async (req, res) => {
  try {
    const data = await storage.myMethod();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});
```

2. **Add a storage method in `server/storage.ts`:**
```ts
async myMethod() {
  // Query database or return mocked data
  return { result: "success" };
}
```

3. **Fetch it from the client component:**
```tsx
const { data } = useQuery("/api/my-endpoint");
return <div>{data?.result}</div>;
```

**Q: How do I modify an existing API response?**
A: 
1. Check `shared/schema.ts` — find the Zod schema for that endpoint
2. Update the schema to add/remove fields
3. Update the storage method in `server/storage.ts` to return the new shape
4. Update client components that consume it — TypeScript will alert you to breaking changes

**Q: How do I query the database for applicants?**
A: Use the Drizzle ORM in `server/storage.ts`:
```ts
import { db } from "./db"; // Drizzle database instance

// Get all applicants
const applicants = await db.query.applicantsTable.findMany();

// Filter by employment status
const employed = applicants.filter(a => a.employmentStatus === "employed");

// Get one applicant by ID
const applicant = await db.query.applicantsTable.findFirst({
  where: (table) => eq(table.id, applicantId)
});
```

**Q: How do I add a new form field to a component?**
A:
1. Add the field to the Zod schema in `shared/schema.ts`
2. Update the storage/database to accept it
3. Add the form input to the component:
```tsx
import { Input } from "@/components/ui/input";

<Input 
  placeholder="Enter value"
  value={formData.newField}
  onChange={(e) => setFormData({...formData, newField: e.target.value})}
/>
```

**Q: How do I add a chart or visualization?**
A: Charts use Chart.js (via `react-chartjs-2`). Example component in `client/src/components/employment-status-chart.tsx`. Pattern:
```tsx
import { Line } from "react-chartjs-2";

export function MyChart({ data }) {
  return (
    <Line
      data={{
        labels: ["Jan", "Feb", "Mar"],
        datasets: [{
          label: "Values",
          data: data,
          borderColor: "rgb(75, 192, 192)",
        }]
      }}
      options={{ responsive: true }}
    />
  );
}
```

---

### Data Flow & Debugging

**Q: How does data flow from the database to a React component?**
A:
1. React component calls `useQuery("/api/endpoint")`
2. HTTP GET request sent to server
3. Server route receives request and calls storage method
4. Storage method queries Drizzle ORM database
5. Database returns data, storage formats it
6. Server responds with JSON
7. React Query caches result and updates component
8. Component re-renders with new data

**Q: How do I debug a failing API endpoint?**
A:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Trigger the API call (click button, refresh page)
4. Look for your endpoint in the Network list
5. Click it and view Response tab to see error message
6. Check server console for logs (look at terminal running `npm run dev`)

**Q: What does "port 5000 already in use" mean?**
A: Another process is using port 5000. Solutions:
- Change port: `PORT=3000 npm run dev`
- Kill existing process: `Get-Process node | Stop-Process -Force` (PowerShell)
- Wait a few seconds and try again

**Q: How do I add console logging to debug?**
A:
```tsx
// Client-side (browser DevTools console)
console.log("Debug value:", myVariable);

// Server-side (terminal)
console.log("Server debug:", myVariable);
```
The server already has logging middleware that captures API responses.

**Q: Why is my change not showing up?**
A:
- Client code: Vite should auto-reload, try refreshing browser (Ctrl+R)
- Server code: You need to restart `npm run dev` process (stop and run again)
- Check browser console (F12) for errors
- Run `npm run check` to verify TypeScript compiles

---

### Database & Storage

**Q: What database is used?**
A: SQLite with Drizzle ORM. Database file is typically in a `db` folder. It's a file-based database (not centralized server).

**Q: Where are database tables defined?**
A: Table schemas are in migration files under `migrations/` folder and used via Drizzle. Current tables include: `applicantsTable`, `employersTable`, `jobPostingsTable`, etc.

**Q: How do I add a new table to the database?**
A:
1. Define the schema (usually in a migration file or `server/db.ts`)
2. Run `npm run db:push` to apply migrations
3. Update `server/storage.ts` to add query methods for the new table
4. Add Zod schemas in `shared/schema.ts` for the data types

**Q: How do I seed the database with initial data?**
A: See `scripts/seed.ts` for examples. Run it with:
```bash
npm run seed
```
This populates the database with test data.

**Q: What's the difference between MemStorage and actual database?**
A: 
- MemStorage (in-memory): Stores data only while the server runs; data is lost on restart
- Real database (SQLite): Data persists in files; survives server restarts
- The project uses real Drizzle database but still has MemStorage for fallback/testing

---

### Styling & UI

**Q: How do I add styling to a component?**
A: Use Tailwind CSS classes. Examples:
```tsx
<div className="p-4 bg-blue-500 text-white rounded-lg">
  Styled text
</div>
```
Common utilities:
- `p-4` = padding
- `m-2` = margin
- `bg-blue-500` = blue background
- `text-white` = white text
- `rounded-lg` = rounded corners
- `w-full` = full width
- `flex` = flexbox layout

**Q: Where are UI components defined?**
A: Shadcn UI components are in `client/src/components/ui/`. They're pre-built, accessible components (buttons, inputs, dialogs, etc.). Import and use:
```tsx
import { Button } from "@/components/ui/button";
<Button>Click me</Button>
```

**Q: How do I make a responsive design?**
A: Use Tailwind breakpoints:
```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive columns
</div>
```
- `md:` applies at medium screens (tablets)
- `lg:` applies at large screens (desktops)

**Q: How do I add dark mode?**
A: Tailwind dark mode classes use `dark:` prefix:
```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Adapts to dark mode
</div>
```

---

### Performance & Optimization

**Q: Why is React Query used?**
A: React Query handles:
- Caching API responses (avoid refetching)
- Automatic refetching when needed
- Loading/error states
- Background synchronization
Example: `const { data, isLoading, error } = useQuery("/api/endpoint");`

**Q: How do I prevent unnecessary re-renders?**
A:
- Use `useCallback()` for event handlers
- Use `useMemo()` for expensive calculations
- Use `React.memo()` for components that don't need to re-render
```tsx
const MyComponent = React.memo(({ props }) => {
  return <div>{props.value}</div>;
});
```

**Q: How do I optimize bundle size?**
A: Run `npm run build` and check output. Vite automatically splits code. Avoid importing large libraries in multiple places.

---

### Testing & Quality

**Q: How do I run tests?**
A: Integration tests are in `tests/integration.test.ts`. Run with:
```bash
npm test
```

**Q: How do I verify my code compiles?**
A: Run TypeScript check:
```bash
npm run check
```
Fix any errors before committing.

**Q: How do I test an API endpoint manually?**
A: Use curl or browser:
```bash
# Test GET endpoint
curl http://localhost:5000/api/summary

# Test with query params
curl "http://localhost:5000/api/referrals?status=hired&limit=5"

# Test POST endpoint
curl -X POST http://localhost:5000/api/applicants \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
```

---

### Common Errors & Fixes

**Error: "Cannot find module @"**
- Cause: Import path is wrong
- Fix: Check `vite.config.ts` for alias definitions, ensure you're using `@` correctly

**Error: "Property does not exist"**
- Cause: TypeScript type mismatch
- Fix: Run `npm run check` to see all type errors, update code to match schema

**Error: "EADDRINUSE: address already in use"**
- Cause: Port 5000 already has a process
- Fix: `PORT=3000 npm run dev` or kill Node process

**Error: "Cannot POST /api/endpoint"**
- Cause: Endpoint doesn't exist or method is wrong
- Fix: Check `server/routes.ts`, ensure `app.post()` is defined for that path

**Error: "Zod validation error"**
- Cause: Invalid data sent to API
- Fix: Check what fields endpoint expects in `shared/schema.ts`, send correct data types

**Blank page after build**
- Cause: Built client files not in correct location
- Fix: Run `npm run build`, check `dist/public` folder exists with `index.html`

---

### Deployment & Production

**Q: How do I build for production?**
A:
```bash
npm run build
```
This creates a `dist/` folder with bundled server and client files.

**Q: How do I run the production build locally?**
A:
```bash
npm start
```
The server will run `dist/index.js` and serve the bundled client files from `dist/public`.

**Q: What environment variables are used?**
A:
- `PORT` — Server port (default 5000)
- `NODE_ENV` — "development" or "production" (Vite sets automatically)
- Database URL (if using external database instead of SQLite)

**Q: What gets deployed?**
A: The `dist/` folder contains everything needed:
- `dist/index.js` — bundled server code
- `dist/public/` — bundled React app (HTML, JS, CSS)
- Everything is self-contained; just run `node dist/index.js`

---

### Extending the Project

**Q: How do I add a new user role?**
A:
1. Update auth logic in `server/auth.ts` to recognize new role
2. Add new routes/pages for that role in `client/src/pages/`
3. Update sidebar in `app-sidebar.tsx` to show role-specific menu items
4. Add Zod schemas in `shared/schema.ts` for new role's data

**Q: How do I add authentication/login?**
A: The project uses Passport.js. Check `server/auth.ts` for strategy setup. Sessions are handled via `express-session`.

**Q: How do I add a new data export format (CSV, PDF)?**
A:
1. Install library: `npm install pdfkit` (example)
2. Create endpoint in `server/routes.ts` that generates file
3. Return as blob from client component
4. Use `FileSaver.js` to download: `saveAs(blob, "export.pdf")`

**Q: How do I add email notifications?**
A:
1. Install email lib: `npm install nodemailer`
2. Add endpoint in `server/routes.ts` to send email
3. Call from client when needed (on form submit, etc.)

---

### Quick Command Reference

```bash
# Development
npm run dev              # Start dev server on port 5000
npm run check           # Type-check all TypeScript
npm run build           # Build for production

# Database
npm run db:push         # Apply Drizzle migrations
npm run seed            # Populate database with test data

# Production
npm start               # Run bundled production build

# Utilities
npm install             # Install dependencies
npm test                # Run integration tests
```

---

### Key Concepts Glossary

- **Vite** — Build tool that serves client code with hot reload in dev
- **Express** — Web framework for Node.js that handles HTTP requests
- **Drizzle** — TypeScript ORM for database queries
- **Zod** — TypeScript library for data validation and schema definition
- **React Query** — Library for managing async data and caching
- **Tailwind CSS** — Utility-first CSS framework
- **TypeScript** — JavaScript with static types
- **Wouter** — Lightweight React router for client-side routing
- **Shadcn UI** — Accessible React component library
- **Lucide** — Icon library (used in sidebar and buttons)
