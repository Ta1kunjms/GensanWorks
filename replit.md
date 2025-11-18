# GensanWorks Admin Dashboard

## Overview

GensanWorks is a comprehensive admin dashboard for the Official Job Assistance Platform of PESO (Public Employment Service Office) in General Santos City. The application provides a data-driven interface for managing job seekers, employers, job postings, referrals, and tracking employment metrics. It features real-time analytics through interactive charts, a comprehensive referral management system, and activity monitoring capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (single-page application pattern)

**UI Component Strategy**
- Shadcn/ui component library built on Radix UI primitives for accessible, headless components
- Tailwind CSS for utility-first styling with custom design tokens
- Custom CSS variables defined in `index.css` for theme consistency (primary colors, sidebar colors, chart colors)
- Design system follows "new-york" style variant as specified in `components.json`

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and API interaction
- Custom query client configured in `lib/queryClient.ts` with:
  - Automatic error handling (throws on non-OK responses)
  - Infinite stale time (manual refetch control)
  - Credential-based requests for session management
  - Custom 401 handling logic

**Component Architecture**
- Layout components: `AppSidebar` (collapsible navigation), `TopNavbar` (search, actions, branding)
- Dashboard components: Summary cards with sparklines, three chart types (Bar, Doughnut, Line), activity feed, referral table
- Modal components: View referral details, send messages, generate PDF slips
- Reusable UI primitives from shadcn/ui in `components/ui/` directory

**Chart Visualization**
- Chart.js with react-chartjs-2 wrapper for data visualization
- Three primary chart types:
  - Bar chart: Applicants by barangay (job seekers vs freelancers)
  - Doughnut chart: Job seeker vs freelancer distribution
  - Line chart: Monthly referral trends (referred, hired, feedback)
- Sparkline charts embedded in summary cards for historical data

### Backend Architecture

**Server Framework**
- Express.js with TypeScript running in ESM mode
- Vite integration for development with HMR (Hot Module Replacement)
- Custom middleware for request logging and JSON response capture

**API Design**
- RESTful endpoints under `/api` namespace:
  - `GET /api/summary` - Dashboard metrics with historical data
  - `GET /api/recent-activities` - Activity feed
  - `GET /api/charts/{bar|doughnut|line}` - Chart data endpoints
  - `GET /api/referrals` - Referral list with filtering support
- Request/response validation using Zod schemas from shared package

**Data Storage Layer**
- Abstract storage interface (`IStorage`) for future database integration
- Current implementation: `MemStorage` (in-memory storage with seed data)
- Designed for easy migration to database backend (Drizzle ORM configuration present)
- Data models defined in `shared/schema.ts` with Zod validation

**Shared Schema Package**
- Type-safe data contracts between frontend and backend
- Zod schemas for runtime validation and TypeScript type inference
- Key schemas: SummaryData, RecentActivity, BarChartData, DoughnutChartData, LineChartData, Referral, ReferralFilters

**Session Management**
- Express session middleware with PostgreSQL session store (connect-pg-simple)
- Cookie-based session management for authentication state
- Session configuration ready for production deployment

### Build & Deployment

**Development Workflow**
- `npm run dev` - Concurrent frontend/backend development with Vite HMR
- `npm run check` - TypeScript type checking across entire codebase
- `npm run db:push` - Drizzle schema synchronization (for future database)

**Production Build**
- `npm run build` - Vite frontend build + esbuild backend bundling
- Frontend output: `dist/public/` (static assets)
- Backend output: `dist/index.js` (bundled Node.js application)
- `npm start` - Production server serving bundled application

**Path Aliasing**
- `@/` - Client source directory (`client/src/`)
- `@shared/` - Shared schemas and types (`shared/`)
- `@assets/` - Attached assets directory (`attached_assets/`)

### Design System

**Color Tokens**
- Primary: `#2E7FFB` (soft LGU blue)
- Sidebar: `#0F1B2D` (dark navy background)
- Success: `#12B76A` (positive metrics, hired status)
- Destructive: `#F04438` (negative metrics, alerts)
- Custom CSS variables with HSL values for opacity support

**Typography**
- Font family: Inter (with system sans-serif fallback)
- Responsive sizing with Tailwind's default scale
- Font weight hierarchy: regular (400), medium (500), semibold (600), bold (700)

**Layout Specifications**
- Sidebar: 20rem width (collapsible to 4rem icon mode)
- Top navbar: 72px fixed height
- Grid system: 3-column layout for summary cards, full-width table
- Responsive breakpoints handled via Tailwind's mobile-first approach

## External Dependencies

### Database
- **Neon Database** (@neondatabase/serverless) - Serverless PostgreSQL driver
- **Drizzle ORM** - Type-safe SQL query builder and schema management
- **Drizzle Kit** - CLI for schema migrations and database operations
- Connection configured via `DATABASE_URL` environment variable
- Migration files output to `./migrations` directory

### UI Component Libraries
- **Radix UI** - Complete suite of accessible, unstyled component primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, popover, select, tabs, tooltip, etc.)
- **Lucide React** - Icon library for consistent iconography
- **Shadcn/ui** - Pre-configured component library built on Radix UI

### Data Visualization
- **Chart.js** - Canvas-based charting library
- **react-chartjs-2** - React wrapper for Chart.js

### Form Management
- **React Hook Form** - Performant form state management
- **@hookform/resolvers** - Validation resolver library
- **Zod** - Schema validation and type inference

### Utilities
- **date-fns** - Date manipulation and formatting
- **clsx** / **tailwind-merge** - Conditional className utilities
- **class-variance-authority** - Component variant management
- **cmdk** - Command palette component

### Development Tools
- **Vite** - Frontend build tool and development server
- **esbuild** - Fast JavaScript bundler for backend
- **tsx** - TypeScript execution for Node.js
- **Replit plugins** - Development environment integration (cartographer, dev-banner, runtime-error-modal)

### Session & Authentication (Configured)
- **express-session** - Session middleware
- **connect-pg-simple** - PostgreSQL session store
- Sessions stored in database for scalability and persistence

### PDF Generation
- **jsPDF** - Client-side PDF generation for referral slips
- Implemented in `generate-slip-modal.tsx`