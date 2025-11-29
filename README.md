# 🏢 GensanWorks - Job Matching & Employment Platform

<div align="center">

![GensanWorks Banner](https://img.shields.io/badge/GensanWorks-Employment%20Platform-blue?style=for-the-badge)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-green?logo=express)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Modern Full-Stack Employment Management System with AI-Powered Job Matching**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

**GensanWorks** is a comprehensive employment platform designed for General Santos City that connects job seekers with employers through an intelligent matching system. Built with modern web technologies, it provides role-based access for administrators, employers, and job seekers with AI-powered candidate recommendations.

### 🎯 Key Highlights

- **AI-Powered Matching**: Groq LLM integration for intelligent candidate-job matching
- **Multi-Role System**: Separate interfaces for Admin, Employer, and Job Seeker
- **Real-time Updates**: WebSocket support for instant notifications
- **NSRP Compliant**: Aligned with National Skills Registry Program standards
- **Comprehensive Profiles**: Detailed applicant profiles with education, skills, and experience
- **Advanced Analytics**: Dashboard with charts and employment statistics

---

## ✨ Features

### 👤 For Job Seekers
- 📝 **Profile Management**: Complete NSRP-compliant profile with education, skills, work experience
- 🔍 **Job Search**: Browse and filter available job vacancies
- 📤 **Applications**: Apply for jobs and track application status
- 💼 **Employment Status**: Update and manage employment information
- 🎯 **Profile Completeness**: Visual indicators for profile completion

### 🏢 For Employers
- 📋 **Job Posting**: Create and manage job vacancies with detailed requirements
- 👥 **Application Management**: Review and manage candidate applications
- 📊 **Applicant Tracking**: Track applicant status through hiring pipeline
- 🔔 **Notifications**: Real-time updates on new applications
- 📈 **Analytics**: View hiring statistics and metrics

### 🔐 For Administrators
- 👥 **User Management**: Manage job seekers, employers, and admin accounts
- 🤖 **AI Job Matching**: Intelligent matching of candidates to job openings
- 📊 **Dashboard Analytics**: Comprehensive employment statistics and trends
- 📝 **Referral Management**: Generate and track referral slips
- 🎯 **Stakeholder Reports**: NSRP SRS Form 2A job vacancy reports
- 🗃️ **Database Operations**: Seed, clear, and manage database records

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **Git** for version control
- **SQLite** (bundled with the project)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ta1kunjms/GensanWorks.git
   cd GensanWorks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in the root directory
   cp .env.example .env
   
   # Edit .env and add your configuration:
   # - PORT=5000
   # - NODE_ENV=development
   # - DATABASE_URL=./app.db
   # - JWT_SECRET=your_secret_key
   # - GROQ_API_KEY=your_groq_api_key
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Seed the database (optional)**
   ```bash
   npm run db:seed-1232
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:5000
   ```

### 🎭 Demo Accounts

After seeding, you can use these demo accounts:

- **Admin**: `admin@gensanworks.com` / `admin123`
- **Employer**: Check seeded employer accounts
- **Job Seeker**: Check seeded applicant accounts

---

## 📚 Documentation

Comprehensive documentation is available in [`DOCUMENTATION.md`](DOCUMENTATION.md), covering:


## Security & Privacy

- **HTTP Security Headers:** The server uses `helmet` to set secure headers. In production, HSTS is enabled.
- **Data Privacy Act (RA 10173):** The Privacy Policy aligns with DPA 2012 and NPC guidance, covering rights, legal bases, retention, and incident response.
- **Retention:** Keep personal data only as long as needed. Consider scheduled cleanup scripts for obsolete records.
- **Access Control:** Enforce role-based permissions for admin/employer/jobseeker routes.
- **DSAR Workflow:** Provide channels to request access, rectification, erasure/blocking, and portability. Track requests and responses.
- **Logging:** Audit sensitive operations (admin actions, auth changes). Rotate logs and restrict access.

### Implementation Notes
- Dev CSP is disabled to avoid Vite conflicts; enable stricter CSP policies in production builds.
- Use HTTPS for production deployments and set HSTS.
- Regularly review third-party embeds for accessibility and privacy compliance.
For quick AI agent onboarding, see [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Component library (Radix UI)
- **React Query** - Data fetching and caching
- **Wouter** - Lightweight routing
- **Chart.js** - Data visualization
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database toolkit
- **SQLite** - Embedded database
- **Passport.js** - Authentication
- **Zod** - Schema validation
- **Groq SDK** - AI job matching
- **WebSocket (ws)** - Real-time communication

### Development Tools
- **tsx** - TypeScript execution
- **esbuild** - Fast bundler
- **Drizzle Kit** - Database migrations
- **Jest** - Testing framework
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## 📂 Project Structure

```
GensanWorks/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (admin, employer, jobseeker)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and helpers
│   │   └── api/         # API client functions
│   ├── public/          # Static assets
│   └── index.html       # Entry HTML
│
├── server/              # Backend Express application
│   ├── routes.ts        # API route definitions
│   ├── auth.ts          # Authentication logic
│   ├── middleware.ts    # Express middleware
│   ├── database.ts      # Database initialization
│   ├── storage.ts       # Data access layer
│   ├── ai-job-matcher.ts # AI matching engine
│   ├── unified-schema.ts # Drizzle schema definitions
│   └── vite.ts          # Vite integration
│
├── shared/              # Shared code between client and server
│   └── schema.ts        # Zod schemas and TypeScript types
│
├── migrations/          # Database migration files
├── scripts/            # Utility scripts (seed, migrate, etc.)
├── tests/              # Test files
└── attached_assets/    # Additional assets

Configuration Files:
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── drizzle.config.ts   # Drizzle ORM configuration
└── package.json        # Project dependencies and scripts
```

---

## 🔧 Available Scripts

### Development
```bash
npm run dev              # Start development server on port 5000
npm run check            # TypeScript type checking
```

### Build & Production
```bash
npm run build            # Build for production
npm start                # Run production build
```

### Database Operations
```bash
npm run db:push          # Push schema changes to database
npm run db:seed          # Seed database with sample data
npm run db:seed-1232     # Seed with 1232 diverse applicants
npm run db:clear-applicants  # Clear all applicants
npm run db:reseed        # Clear and reseed database
npm run db:migrate       # Generate migration files
```

### Testing
```bash
npm test                 # Run test suite
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login (admin/employer/jobseeker)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Applicants (Job Seekers)
- `GET /api/applicants` - List all applicants (admin)
- `GET /api/applicants/:id` - Get applicant details
- `PUT /api/applicants/:id` - Update applicant profile
- `POST /api/applicants` - Create new applicant

### Employers
- `GET /api/employers` - List all employers (admin)
- `GET /api/employers/:id` - Get employer details
- `PUT /api/employers/:id` - Update employer profile
- `POST /api/employers` - Create new employer

### Job Vacancies
- `GET /api/job-vacancies` - List all job vacancies
- `GET /api/job-vacancies/:id` - Get job vacancy details
- `POST /api/job-vacancies` - Create job vacancy
- `PUT /api/job-vacancies/:id` - Update job vacancy
- `DELETE /api/job-vacancies/:id` - Delete job vacancy

### Applications
- `GET /api/applications` - List applications (filtered by role)
- `POST /api/applications` - Submit job application
- `PUT /api/applications/:id` - Update application status

### AI Job Matching
- `GET /api/jobs/:id/match` - Get AI-powered candidate matches for a job

### Analytics & Reports
- `GET /api/dashboard/summary` - Dashboard summary statistics
- `GET /api/dashboard/charts` - Chart data for analytics
- `GET /api/referrals` - Referral slip management

For complete API documentation, see [`DOCUMENTATION.md`](DOCUMENTATION.md#api-reference).

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style (TypeScript + ESLint)
- Write meaningful commit messages
- Update documentation for significant changes
- Test your changes thoroughly
- Use the Zod-first approach for API schemas

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows PowerShell
Get-Process node | Stop-Process -Force

# Or change port
PORT=3000 npm run dev
```

### Database Issues
```bash
# Reset database
npm run db:push
npm run db:reseed
```

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run check
```

For more issues, see [`DOCUMENTATION.md`](DOCUMENTATION.md#troubleshooting).

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Tycoon James Flores** - Initial work - [@Ta1kunjms](https://github.com/Ta1kunjms)

---

## 🙏 Acknowledgments

- **Shadcn UI** for the beautiful component library
- **Groq** for AI-powered matching capabilities
- **Drizzle ORM** for excellent TypeScript database toolkit
- **General Santos City** for inspiration and use case

---

## 📞 Support

For questions, issues, or suggestions:

- 📧 Email: tycoonjamesflores@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Ta1kunjms/GensanWorks/issues)
- 📖 Documentation: [DOCUMENTATION.md](DOCUMENTATION.md)

---

<div align="center">

**Made with ❤️ for General Santos City**

[⬆ Back to Top](#-gensanworks---job-matching--employment-platform)

</div>
