# GensanWorks Admin Dashboard - Design Guidelines

## Design System Foundation

**Color Palette:**
- Primary Blue: #2E7FFB (buttons, accents, active states)
- Dark Navy: #0F1B2D (sidebar background)
- Success Green: #12B76A (positive metrics, hired status)
- Alert Red: #F04438 (negative metrics)
- Accent Red: #FF4D4F (logo accent)
- Neutral Dark: #0B1220 (primary text)
- Chart Gray: #E6EEF8 (gridlines, borders)
- Card Background: #FFFFFF
- Active State Background: #E8F2FF

**Typography:**
- Font Family: Inter (system sans-serif fallback)
- Page Title: 18-20px, semibold/medium weight
- Card Numbers: 28-36px, bold
- Body Text: 14-16px, regular
- Captions: 12-14px, regular

**Spacing & Layout:**
- Base Unit: 8px (Tailwind default scale)
- Card Border Radius: 16px
- Button Border Radius: 8px (pills use full rounding)
- Shadows: Subtle elevation - `0 1px 0 rgba(2,6,23,0.06), 0 2px 6px rgba(2,6,23,0.04)`

## Layout Architecture

**Sidebar (280px fixed, collapsible to 80px):**
- Dark navy background with white text/icons
- Active menu item: Light blue background (#E8F2FF) with left accent bar (#2E7FFB)
- Bottom user card: Circular avatar, name "Tycoon James Flores", subtitle "Admin"
- Menu order: Home (active), Applicants, Employers, Jobs, Matching, Reports, Events, Programs, Settings, Help, Logout

**Top Navigation (72px height):**
- Left: GensanWorks logo with subtitle "Official Job Assistance Platform of PESO – General Santos City"
- Center: "Dashboard Overview" page title
- Right: Search input (placeholder: "Search applicants, employers, job posts..."), action buttons (+ New Job Post, + Add Applicant), green Generate Report pill

**Content Grid:**
- 3-column layout for summary cards (2 rows = 6 cards total)
- Right column includes Recent Activities card anchored to top
- Charts row: 3 equal-width cards below summary
- Full-width table at bottom

## Component Specifications

**Summary Cards (6 cards, data-driven):**
- Large metric number (28-36px bold)
- Change percentage below with colored arrow/caret
- Green (#12B76A) for positive trends (up arrow)
- Red (#F04438) for negative trends (down arrow)
- Optional sparkline visualization matching trend direction
- Cards: Total Applicants (1,318), Active Employers (119), Active Job Posts (36), Pending Employer Feedback (13), Successful Referrals (713), Active Freelancers (47)

**Recent Activities Card:**
- Bullet list format
- Real-time activity feed
- Sample entries: "New applicant from Labangal registered", "Employer ABC posted 3 new vacancies"

**Chart Visualizations:**

1. **Applicants by Barangay (Bar Chart):**
   - Dual-series: Job Seeker (black) vs Freelancer (blue #2E7FFB)
   - X-axis: Barangay labels A-Z
   - Y-axis: 0-100 range
   - Legend top-left inside card

2. **Jobseeker vs Freelancer (Doughnut Chart):**
   - Outer ring dark, inner ring white cutout
   - Values: 96.43% (1,271) vs 3.57% (47)
   - Side labels showing counts and percentages

3. **Monthly Referrals Trend (Line Chart):**
   - Three series: Referred (orange), Hired (green #12B76A), Feedback (blue #2E7FFB)
   - X-axis: JAN-DEC
   - Smooth curves showing trends

**Referral & Placement Summary Table:**
- Header with filters aligned right: Barangay, Employer, Job Category, Date range, Status dropdowns
- Green "Export to CSV" pill button
- Columns: Referral ID, Applicant, Vacancy, Employer, Date Referred, Status (colored dot indicator), Feedback, Actions
- Action icons: Eye (view), Message, Document+Plus (generate slip)
- Sortable columns with hover states
- Sample row: RFL-2025-0112, Ren Paulo Galas, Office Staff, etc.

## Responsive Behavior

**Breakpoints:**
- Desktop: 1920×1080 (primary target)
- Laptop: 1366×768
- Tablet: 1024×768
- Mobile: 768px and below

**Adaptations:**
- Mobile: Sidebar converts to top drawer, 3-column grid → single column, charts stack vertically
- Tablet: Maintain 2-column layout where possible
- Sidebar collapses to 80px icon-only mode on smaller screens

## Interaction Patterns

**Buttons:**
- Primary actions: White background, dark text, subtle shadow
- Success actions: Green pill (#12B76A) with white text
- Hover states: Slight elevation increase, subtle background darkening

**Table Actions:**
- View: Opens modal with full referral details
- Message: Quick feedback/message modal
- Generate Slip: Downloads/prints PDF referral slip

**Accessibility:**
- All interactive elements keyboard-focusable
- ARIA labels on all controls
- Color contrast meeting WCAG AA standards
- Focus trap in sidebar when collapsed

## Visual Polish

- Consistent 16px border radius on all cards
- Subtle shadows for depth without heavy blur
- Inter font throughout for consistency
- Status indicators use semantic colors (green/red/blue)
- Loading states with skeleton screens
- Empty states with helpful messaging
- Smooth transitions on interactive elements (200ms ease)