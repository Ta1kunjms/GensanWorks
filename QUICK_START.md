# 🚀 Quick Start Guide - GensanWorks Authentication System

## Getting Started in 3 Minutes

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Access the Application
Open your browser to: `http://localhost:5000`

---

## 🔑 Login Credentials (After Setup)

### Admin Account
```
Create via: npm run create-admin
Default: admin@gensanworks.com
```

### Test Accounts
Use the signup pages to create test accounts for each role.

---

## 🌐 Key URLs

### Public Routes (No Auth Required)
- **Landing Page**: `/`
- **Admin Login**: `/admin/login`
- **Admin Signup**: `/admin/signup`
- **Employer Login**: `/employer/login`
- **Employer Signup**: `/employer/signup` ⭐ NEW
- **Jobseeker Login**: `/jobseeker/login`
- **Jobseeker Signup**: `/jobseeker/signup` ⭐ NEW

### Admin Routes (Admin Role)
- **Dashboard**: `/admin/dashboard`
- **Stakeholders**: `/admin/stakeholders` ⭐ NEW
- **Applicants**: `/admin/applicants`
- **Employers**: `/admin/employers`
- **Jobs**: `/admin/jobs`
- **Matching**: `/admin/matching`
- **Reports**: `/admin/reports`

### Employer Routes (Employer Role)
- **Dashboard**: `/employer/dashboard` ⭐ ENHANCED
- **Jobs**: `/employer/jobs`
- **Applications**: `/employer/applications`
- **Profile**: `/employer/profile`

### Jobseeker Routes (Jobseeker/Freelancer Role)
- **Dashboard**: `/jobseeker/dashboard` ⭐ ENHANCED
- **Browse Jobs**: `/jobseeker/jobs`
- **Applications**: `/jobseeker/applications`
- **Profile**: `/jobseeker/profile`

---

## 📍 API Endpoints Quick Reference

### Authentication
```http
POST /api/auth/login                    # Universal login
POST /api/auth/signup/jobseeker        # Register jobseeker
POST /api/auth/signup/employer         # Register employer
POST /api/auth/signup/admin            # Register admin
GET  /api/auth/me                      # Get current user
POST /api/auth/logout                  # Logout
```

### Profile
```http
GET /api/profile                       # Get profile
PUT /api/profile                       # Update profile
```

### Jobseeker
```http
GET  /api/jobseeker/dashboard          # Dashboard stats
POST /api/jobseeker/applications       # Apply to job
GET  /api/jobseeker/applications       # List applications
```

### Employer
```http
GET  /api/employer/dashboard           # Dashboard stats
POST /api/employer/jobs                # Create job
GET  /api/employer/jobs                # List jobs
GET  /api/employer/applications        # List applications
PUT  /api/employer/applications/:id    # Update application
```

### Admin
```http
GET    /api/admin/dashboard            # System stats
GET    /api/admin/stakeholders         # List all users
GET    /api/admin/applicants           # List applicants
GET    /api/admin/employers            # List employers
DELETE /api/admin/users/:id            # Delete user
PUT    /api/admin/users/:id/suspend    # Suspend user
```

---

## 🎨 Component Usage Examples

### StatsCard Component
```tsx
import { StatsCard } from "@/components/stats-card";
import { Users } from "lucide-react";

<StatsCard
  title="Total Users"
  value={1234}
  description="Registered this month"
  icon={Users}
  trend={{ value: 15, isPositive: true }}
/>
```

### Dashboard Layout Pattern
```tsx
import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '@/components/stats-card';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/my-data'],
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600">Welcome back!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard {...} />
        {/* More cards */}
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <Card>
            {/* Content */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 🔒 Authentication Flow

### Client-Side
```tsx
import { useAuth } from '@/lib/auth';

const { user, login, logout, signup } = useAuth();

// Login
await login('email@example.com', 'password');

// Signup
await signup('John Doe', 'john@example.com', 'password', 'jobseeker');

// Logout
logout();
```

### API Calls with Auth
```tsx
const token = localStorage.getItem('gw_token');

const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

---

## 🎯 Common Tasks

### Add a New Protected Route

**1. Create the page component**
```tsx
// client/src/pages/employer/my-new-page.tsx
export default function MyNewPage() {
  const { user } = useAuth();
  return <div>My New Page</div>;
}
```

**2. Add to App.tsx**
```tsx
import MyNewPage from "@/pages/employer/my-new-page";

// In employer routes section:
<Route path="/employer/my-new-page" component={MyNewPage} />
```

**3. Add to sidebar navigation**
```tsx
// client/src/components/app-sidebar.tsx
const employerMenu = [
  // ... existing items
  { title: "My Page", url: "/employer/my-new-page", icon: MyIcon },
];
```

### Add a New API Endpoint

**1. Define Zod schema** (optional)
```typescript
// shared/schema.ts
export const myDataSchema = z.object({
  field: z.string(),
});
```

**2. Add route handler**
```typescript
// server/routes.ts
app.get("/api/my-endpoint", authMiddleware, async (req: any, res) => {
  try {
    const data = await storage.myMethod();
    res.json(data);
  } catch (error) {
    return sendError(res, error);
  }
});
```

**3. Use in component**
```tsx
const { data } = useQuery({
  queryKey: ['/api/my-endpoint'],
});
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port
PORT=3000 npm run dev
```

### Database Not Found
```bash
# Push schema
npm run db:push
```

### TypeScript Errors
```bash
# Check for errors
npm run check
```

### No Admin User
```bash
# Create admin
npm run create-admin
```

### Build Errors
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

---

## 📦 Project Structure

```
GensanWorksAdmin/
├── client/                  # Frontend React app
│   ├── src/
│   │   ├── pages/          # Route components
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── employer/   # Employer pages
│   │   │   └── jobseeker/  # Jobseeker pages
│   │   ├── components/     # Reusable components
│   │   │   └── ui/        # Shadcn UI components
│   │   └── lib/           # Utilities & auth
│   └── index.html
│
├── server/                  # Backend Express app
│   ├── routes.ts           # API endpoints ⭐ UPDATED
│   ├── auth.ts             # Auth utilities
│   ├── middleware.ts       # Auth middleware
│   ├── unified-schema.ts   # Database schema
│   └── storage.ts          # Data access layer
│
├── shared/                  # Shared types
│   └── schema.ts           # Zod schemas ⭐ UPDATED
│
├── migrations/              # Database migrations
│
└── package.json
```

---

## ✅ Feature Checklist

### Authentication
- ✅ Multi-role login (Admin, Employer, Jobseeker)
- ✅ Signup pages for all roles
- ✅ JWT token authentication
- ✅ Password hashing
- ✅ Protected routes
- ✅ Role-based access control

### Dashboards
- ✅ Admin dashboard with system stats
- ✅ Employer dashboard with job metrics
- ✅ Jobseeker dashboard with application tracking
- ✅ Real-time statistics
- ✅ Interactive charts and graphs

### User Management
- ✅ Admin can view all users
- ✅ Filter users by role
- ✅ Search users
- ✅ Suspend/activate accounts
- ✅ Delete users

### Job & Application Management
- ✅ Employers create job postings
- ✅ Jobseekers apply to jobs
- ✅ Track application status
- ✅ Update application status (employers)
- ✅ View application history

### UI/UX
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Success notifications
- ✅ Accessible components

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set strong JWT secret: `JWT_SECRET=your-random-secret`
- [ ] Configure production database
- [ ] Enable HTTPS/SSL
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure email service (SendGrid, etc.)
- [ ] Set up backup system
- [ ] Add rate limiting
- [ ] Enable CORS for your domain
- [ ] Minify and optimize assets
- [ ] Set up CI/CD pipeline

---

## 📚 Additional Resources

### Documentation
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Full feature documentation
- [copilot-instructions.md](./.github/copilot-instructions.md) - Development guide

### External Dependencies
- [React Query](https://tanstack.com/query) - Data fetching
- [Shadcn UI](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zod](https://zod.dev/) - Schema validation
- [Drizzle ORM](https://orm.drizzle.team/) - Database

---

## 💬 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the full documentation
3. Check the error logs
4. Contact the development team

---

**Happy Coding! 🎉**
