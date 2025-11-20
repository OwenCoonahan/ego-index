# GLASS — TECHNICAL SPECIFICATION (MVP v0.1)

**Product**: Early-warning system for SMB importers and mid-market manufacturers
**Goal**: Ship Week 1 MVP in 5 days → start customer conversations → iterate to $5K MRR
**Stack**: Next.js 14 (App Router) + TypeScript + Supabase + shadcn/ui + Tailwind

---

## TABLE OF CONTENTS

1. [Product Overview](#1-product-overview)
2. [Week 1 MVP Scope](#2-week-1-mvp-scope)
3. [Technical Architecture](#3-technical-architecture)
4. [Database Schema](#4-database-schema)
5. [API Routes](#5-api-routes)
6. [Frontend Pages & Components](#6-frontend-pages--components)
7. [Alert Matching Engine](#7-alert-matching-engine)
8. [Design System (Simplified)](#8-design-system-simplified)
9. [Customer Experience Flow](#9-customer-experience-flow)
10. [Ready-to-Paste Claude Code Prompts](#10-ready-to-paste-claude-code-prompts)
11. [What NOT to Build (Guardrails)](#11-what-not-to-build-guardrails)
12. [GTM & Customer Scripts](#12-gtm--customer-scripts)

---

## 1. PRODUCT OVERVIEW

### The Problem
SMB importers and mid-market manufacturers lack real-time visibility into:
- Tariff changes
- Port congestion
- Commodity price spikes
- Chokepoint disruptions (Suez, Red Sea, Panama)
- Export controls
- Supplier/freight volatility

They don't need Bloomberg Terminal. They need: **"This event affects YOUR products. Here's what changed. Here's what to do."**

### The Solution
Glass = **Personalized early-warning dashboard** that:
1. Captures customer's supply chain exposure (products, HS codes, origins, ports)
2. Ingests risk events from public feeds (tariffs, port data, weather, commodity prices)
3. Matches events to exposures using rule-based logic
4. Surfaces alerts with severity, impact estimate, and source links

### Success Metrics (Week 1)
- ✅ 5-day build complete
- ✅ 10+ customer calls scheduled
- ✅ Manual alerts delivered to 3-5 pilot users
- ✅ "Holy sh*t, I need this" moment validated

---

## 2. WEEK 1 MVP SCOPE

### Must-Have Features
| Feature | Description | Priority |
|---------|-------------|----------|
| **Landing Page** | Hero + CTA → /signup | P0 |
| **Auth** | Supabase magic link | P0 |
| **Onboarding Wizard** | Multi-step: company → products → lanes → ports | P0 |
| **Dashboard** | Alert list + exposure summary + today's risk count | P0 |
| **Admin Event Entry** | Manual form to create `risk_events` | P0 |
| **Alert Generation API** | Match events → exposures → create alerts | P0 |
| **Sample Alerts** | Pre-seed new users with 2-3 example alerts | P1 |

### Explicitly Out of Scope (Week 1)
- ❌ Automated scrapers (manual admin entry only)
- ❌ Email notifications (dashboard only)
- ❌ Charts/graphs
- ❌ Settings page
- ❌ Billing/Stripe
- ❌ Mobile optimization
- ❌ Advanced severity scoring (use simple 1-5 for now)

---

## 3. TECHNICAL ARCHITECTURE

### Stack
```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS
UI:        shadcn/ui components
Backend:   Next.js API routes
Database:  Supabase (Postgres)
Auth:      Supabase Auth (magic link)
Hosting:   Vercel (frontend + API) + Supabase (DB)
```

### Folder Structure
```
glass/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── dashboard/
│   │   ├── onboarding/
│   │   └── admin/
│   │       └── events/
│   ├── api/
│   │   ├── onboarding/
│   │   ├── alerts/
│   │   ├── risk-events/
│   │   └── generate-alerts/
│   ├── layout.tsx
│   └── page.tsx (landing)
├── components/
│   ├── ui/ (shadcn components)
│   ├── AlertCard.tsx
│   ├── ExposureSummary.tsx
│   ├── OnboardingStep.tsx
│   ├── NavBar.tsx
│   └── SeverityBadge.tsx
├── lib/
│   ├── supabase.ts
│   ├── types.ts
│   └── utils.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── public/
```

---

## 4. DATABASE SCHEMA

### Core Tables

#### `profiles`
Extends Supabase auth.users.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz default now()
);
```

#### `companies`
One company per user (for MVP; can expand to teams later).

```sql
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  size text, -- 'solo', '5-10', '10-50', '50+'
  created_at timestamptz default now()
);
```

#### `company_exposures`
What products/lanes/ports the company cares about.

```sql
create table public.company_exposures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  product_name text not null,
  hs_code text, -- optional, e.g., '7610' or '7610.10'
  origin_country text, -- e.g., 'China'
  dest_country text, -- e.g., 'United States'
  port text, -- e.g., 'Long Beach'
  monthly_volume_usd int, -- optional, for future COGS impact calc
  notes text,
  created_at timestamptz default now()
);
```

#### `risk_events`
Global events (tariffs, port issues, etc.). Admin-created for Week 1.

```sql
create table public.risk_events (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'tariff', 'port', 'commodity', 'chokepoint', 'export_control', 'weather'
  title text not null,
  description text,
  source_url text,
  affected_origin_country text,
  affected_dest_country text,
  affected_port text,
  affected_hs_code text, -- prefix match, e.g., '7610'
  affected_commodity text, -- e.g., 'aluminum', 'steel'
  severity int default 3, -- 1 (low) to 5 (critical)
  effective_date date,
  created_at timestamptz default now()
);
```

#### `alerts`
Per-company alerts generated by matching `risk_events` to `company_exposures`.

```sql
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  risk_event_id uuid references public.risk_events(id) on delete cascade,
  exposure_id uuid references public.company_exposures(id),
  title text not null,
  message text,
  severity int default 3,
  status text default 'unread', -- 'unread', 'read', 'dismissed'
  created_at timestamptz default now()
);
```

#### Sample Alerts Table (Optional)
Pre-seeded alerts for new users to see on first login.

```sql
create table public.sample_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text,
  severity int,
  type text,
  created_at timestamptz default now()
);
```

### Row-Level Security (RLS)
Enable RLS on all tables. Users can only see their own data.

```sql
-- companies
alter table public.companies enable row level security;
create policy "Users can view their own companies"
  on public.companies for select
  using (auth.uid() = owner_id);

-- company_exposures
alter table public.company_exposures enable row level security;
create policy "Users can view exposures for their companies"
  on public.company_exposures for select
  using (company_id in (select id from public.companies where owner_id = auth.uid()));

-- alerts
alter table public.alerts enable row level security;
create policy "Users can view their own alerts"
  on public.alerts for select
  using (company_id in (select id from public.companies where owner_id = auth.uid()));
```

---

## 5. API ROUTES

### `POST /api/onboarding`
**Purpose**: Create company + exposures after onboarding wizard.

**Input** (JSON):
```json
{
  "company": {
    "name": "Acme Imports",
    "size": "10-50"
  },
  "exposures": [
    {
      "product_name": "Aluminum Frames",
      "hs_code": "7610",
      "origin_country": "China",
      "dest_country": "United States",
      "port": "Long Beach",
      "monthly_volume_usd": 50000
    }
  ]
}
```

**Logic**:
1. Get authenticated user ID from Supabase session
2. Insert into `companies` table
3. Insert each exposure into `company_exposures`
4. Optionally seed 2-3 sample alerts for new user
5. Return company ID

**Response**:
```json
{
  "success": true,
  "company_id": "uuid-here"
}
```

---

### `GET /api/alerts`
**Purpose**: Fetch alerts for current user's company.

**Query Params** (optional):
- `severity`: filter by severity (1-5)
- `status`: filter by status ('unread', 'read', 'dismissed')
- `type`: filter by event type

**Logic**:
1. Get user's company ID
2. Query `alerts` table with JOIN to `risk_events` for source URL
3. Return sorted by `created_at DESC`

**Response**:
```json
{
  "alerts": [
    {
      "id": "uuid",
      "title": "Tariff increase on aluminum from China",
      "message": "Affects: Aluminum Frames (HS 7610) via Long Beach. Tariff increased 10%.",
      "severity": 4,
      "status": "unread",
      "created_at": "2025-01-15T10:30:00Z",
      "source_url": "https://ustr.gov/...",
      "type": "tariff"
    }
  ]
}
```

---

### `POST /api/risk-events` (Admin Only)
**Purpose**: Manually create a new risk event.

**Input**:
```json
{
  "type": "tariff",
  "title": "China → US aluminum tariff increase",
  "description": "Section 301 tariffs increased from 15% to 25%",
  "source_url": "https://ustr.gov/announcement",
  "affected_origin_country": "China",
  "affected_dest_country": "United States",
  "affected_hs_code": "7610",
  "severity": 4,
  "effective_date": "2025-02-01"
}
```

**Logic**:
1. Validate input
2. Insert into `risk_events`
3. Return event ID

**Response**:
```json
{
  "success": true,
  "event_id": "uuid"
}
```

---

### `POST /api/generate-alerts`
**Purpose**: Match a risk event to all relevant exposures and create alerts.

**Input**:
```json
{
  "event_id": "uuid"
}
```

**Logic** (see section 7 for detailed matching rules):
1. Fetch the risk event
2. Query `company_exposures` where:
   - `origin_country` matches OR
   - `dest_country` matches OR
   - `port` matches OR
   - `hs_code` prefix matches (e.g., event HS `7610` matches exposure `7610.10`)
3. For each matching exposure:
   - Generate title: `{event.title}`
   - Generate message: `"Affects: {exposure.product_name} (HS {exposure.hs_code}) imported from {exposure.origin_country} via {exposure.port}. {event.description}"`
   - Set severity: copy from event (or +1 if exposure has high volume)
   - Insert into `alerts`
4. Return count of alerts created

**Response**:
```json
{
  "success": true,
  "alerts_created": 12
}
```

---

## 6. FRONTEND PAGES & COMPONENTS

### Page: `/` (Landing)
**Purpose**: Marketing page with hero + CTA.

**Content**:
- **Hero**: "Early warnings for your supply chain. Stay ahead of tariffs, delays, and disruptions."
- **CTA Button**: "Get Early Access" → `/login`
- **Subtext**: "Built for importers, manufacturers, and freight brokers."
- **3 Value Props**:
  - "Know before your competitors"
  - "Stop getting blindsided by tariffs"
  - "Track ports, products, and chokepoints in one place"

**Design**: Dark mode, Glass branding (minimal wordmark), simple layout.

---

### Page: `/login` & `/signup`
**Purpose**: Auth via Supabase magic link.

**Implementation**: Use Supabase Auth UI component or custom form with `supabase.auth.signInWithOtp()`.

**Flow**:
1. User enters email
2. Supabase sends magic link
3. User clicks link → redirected to `/onboarding` (if new) or `/dashboard` (if returning)

---

### Page: `/onboarding` (Multi-Step Wizard)
**Purpose**: Capture customer's supply chain exposure.

**Steps**:

#### Step 1: Company Info
- Company name (text input)
- Company size (dropdown: "Solo", "5-10 employees", "10-50", "50+")
- CTA: "Next"

#### Step 2: Products
- "What do you import or manufacture?" (textarea or repeatable input)
- Optional: HS code (text input with helper text: "e.g., 7610 for aluminum structures")
- CTA: "Next"

#### Step 3: Origins & Ports
- "Where do you import from?" (multi-select: China, Vietnam, Mexico, etc.)
- "Which ports do you use?" (multi-select: Long Beach, LA, Newark, etc.)
- CTA: "Next"

#### Step 4: Risk Preferences
- "What risks matter most to you?" (checkboxes: Tariffs, Port delays, Commodity prices, Chokepoints, Weather, Export controls)
- CTA: "Finish Setup"

**On Completion**:
- Call `POST /api/onboarding` with all data
- Redirect to `/dashboard`

**UI**:
- Progress bar at top (1 of 4 → 4 of 4)
- Clean cards with Glass dark theme
- Use shadcn/ui form components

---

### Page: `/dashboard`
**Purpose**: Main app view. Shows alerts + exposure summary.

**Layout**:

```
┌─────────────────────────────────────────────────┐
│  NavBar (Glass logo | Dashboard | Admin)        │
├─────────────────────────────────────────────────┤
│  Today's Risk Summary                           │
│  ┌────────────┬────────────┬────────────┐      │
│  │ 3 Critical │ 5 High     │ 2 Medium   │      │
│  └────────────┴────────────┴────────────┘      │
├─────────────────────────────────────────────────┤
│  Recent Alerts                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ [AlertCard]                             │   │
│  │ [AlertCard]                             │   │
│  │ [AlertCard]                             │   │
│  └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│  Your Exposures (sidebar or bottom section)    │
│  • Importing from: China, Vietnam              │
│  • Via ports: Long Beach, LA                   │
│  • Products: 3 tracked                         │
└─────────────────────────────────────────────────┘
```

**Data Fetching**:
- Fetch current user's company
- Fetch alerts via `GET /api/alerts`
- Fetch exposures from `company_exposures`

---

### Page: `/admin/events`
**Purpose**: Internal admin tool to manually create risk events.

**Layout**:
- Table of existing `risk_events`
- "Add Event" button → opens modal/form
- Form fields:
  - Type (dropdown)
  - Title (text)
  - Description (textarea)
  - Source URL (text)
  - Affected origin country (text)
  - Affected dest country (text)
  - Affected port (text)
  - Affected HS code (text)
  - Severity (1-5 slider)
  - Effective date (date picker)
- "Generate Alerts" button next to each event → calls `POST /api/generate-alerts`

**Security**: No auth for Week 1 (protect with env var or IP whitelist later).

---

### Component: `<AlertCard>`
**Props**:
```tsx
{
  title: string;
  message: string;
  severity: 1 | 2 | 3 | 4 | 5;
  type: 'tariff' | 'port' | 'commodity' | 'chokepoint' | 'export_control' | 'weather';
  sourceUrl?: string;
  createdAt: string;
}
```

**UI**:
- Card background: `#1E1E1F`
- Severity badge (color-coded, top-left)
- Title (H3, bold)
- Message (body text, gray)
- Type pill (small, lowercase, subtle)
- Timestamp (small, gray, bottom-right)
- "View source" link (if `sourceUrl` provided)

---

### Component: `<SeverityBadge>`
**Props**: `severity: 1-5`

**Colors**:
- 5 (Critical): `#DC2626` (red)
- 4 (High): `#F59E0B` (amber)
- 3 (Medium): `#FB923C` (orange)
- 2 (Low): `#10B981` (green)
- 1 (Info): `#4A78FF` (blue)

**Style**:
- 12px font, 600 weight, uppercase
- Padding: 4px 8px
- Border radius: 6px

---

### Component: `<ExposureSummary>`
**Purpose**: Show user's tracked supply chain at a glance.

**Content**:
- "You're monitoring:"
- Origin countries (as chips/pills)
- Ports (as chips/pills)
- Products count
- Link to "Edit exposures" (future settings page)

---

## 7. ALERT MATCHING ENGINE

### Matching Logic (v0.1 — Simple Rule-Based)

When `POST /api/generate-alerts` is called with an `event_id`:

1. **Fetch the risk event**
2. **Find matching exposures** using OR logic:

```sql
SELECT * FROM company_exposures
WHERE
  (origin_country = event.affected_origin_country OR event.affected_origin_country IS NULL)
  OR (dest_country = event.affected_dest_country OR event.affected_dest_country IS NULL)
  OR (port = event.affected_port OR event.affected_port IS NULL)
  OR (hs_code LIKE event.affected_hs_code || '%' OR event.affected_hs_code IS NULL)
```

3. **For each match**, create an alert:

```javascript
{
  company_id: exposure.company_id,
  risk_event_id: event.id,
  exposure_id: exposure.id,
  title: event.title,
  message: `Affects: ${exposure.product_name} (HS ${exposure.hs_code}) imported from ${exposure.origin_country} via ${exposure.port}. ${event.description}`,
  severity: event.severity, // copy from event for now
  status: 'unread'
}
```

### Future Enhancements (Post-Week 1)
- **Severity boost**: +1 if `monthly_volume_usd > $100k`
- **COGS impact**: Calculate `tariff_increase % × monthly_volume_usd`
- **Deduplication**: Don't create duplicate alerts for same event + exposure
- **Confidence scoring**: Add confidence % based on match quality

---

## 8. DESIGN SYSTEM (SIMPLIFIED)

For Week 1, use a **stripped-down version** of the full Glass design system.

### Colors
```css
--glass-black: #0A0A0A;
--glass-charcoal: #1E1E1F;
--glass-slate: #2A2A2C;
--glass-grey: #3A3A3C;
--glass-white: #FFFFFF;

--glass-blue: #4A78FF; /* brand accent, links, primary buttons */

--severity-critical: #DC2626;
--severity-high: #F59E0B;
--severity-medium: #FB923C;
--severity-low: #10B981;
--severity-info: #4A78FF;
```

### Typography
- **Font**: Inter (Google Fonts)
- **H1**: 32px / 700
- **H2**: 24px / 600
- **H3**: 20px / 600
- **Body**: 16px / 500
- **Small**: 14px / 400

### Spacing
Use Tailwind defaults (multiples of 4px).

### Components
- Use shadcn/ui for buttons, cards, forms, badges
- Customize colors to match Glass palette
- Default to dark mode

---

## 9. CUSTOMER EXPERIENCE FLOW

### New User Journey

1. **Discovery** → Lands on `/` via LinkedIn post, tweet, or referral
2. **Signup** → Clicks "Get Early Access" → enters email → receives magic link
3. **Onboarding** → Completes 4-step wizard (2 minutes)
4. **Dashboard** → Sees 2-3 pre-seeded sample alerts so it's not empty
5. **First Real Alert** → After you create a risk event in `/admin/events` and generate alerts, they see a real, personalized warning

### Returning User Journey

1. **Login** → Magic link → `/dashboard`
2. **Scan alerts** → Sees count of unread alerts at top
3. **Click alert** → Reads details, clicks "View source" to see original announcement
4. **Mark as read** (future feature)

---

## 10. READY-TO-PASTE CLAUDE CODE PROMPTS

Copy/paste these into Claude Code to build each piece.

---

### Prompt 1: Project Scaffold + Landing Page

```
Create a new Next.js 14 project using TypeScript, App Router, Tailwind CSS, and shadcn/ui.

Set up the following pages:
- `/` (landing page)
- `/login` (auth page)
- `/onboarding` (placeholder for now)
- `/dashboard` (placeholder for now)
- `/admin/events` (placeholder for now)

For the landing page (/):
- Dark background (#0A0A0A)
- Hero section with:
  - H1: "Early warnings for your supply chain"
  - Subheading: "Stay ahead of tariffs, port delays, and disruptions. Built for importers and manufacturers."
  - Primary CTA button: "Get Early Access" linking to /login
  - Use Glass Blue (#4A78FF) for the button
- Three value prop cards below hero:
  - "Know before your competitors"
  - "Stop getting blindsided by tariffs"
  - "Track ports, products, and chokepoints in one place"
- Simple footer with "Glass © 2025"

Use Inter font from Google Fonts.
Use shadcn/ui Button and Card components.
Make the design clean, minimal, enterprise-grade (no playful elements).
```

---

### Prompt 2: Supabase Integration + Auth

```
Integrate Supabase into the Next.js project for authentication and database.

Set up:
- Supabase client in `lib/supabase.ts`
- Environment variables for SUPABASE_URL and SUPABASE_ANON_KEY
- Auth using magic link (email-only, no password)

Implement the /login page:
- Single email input field
- "Send Magic Link" button
- On submit, call `supabase.auth.signInWithOtp({ email })`
- Show success message: "Check your email for a login link"
- Style with Glass design system (dark theme, Inter font, Glass Blue button)

Set up auth redirect logic:
- After magic link click, redirect new users to `/onboarding`
- Redirect returning users to `/dashboard`
- Use middleware to protect `/dashboard` and `/onboarding` routes

Create a simple NavBar component with:
- "Glass" logo/wordmark on the left
- Links to Dashboard, Admin (if logged in)
- User email + logout button (if logged in)
- Background: #1E1E1F, border-bottom: 1px solid rgba(255,255,255,0.06)
```

---

### Prompt 3: Database Schema + Migrations

```
Create a Supabase SQL migration file at `supabase/migrations/001_initial_schema.sql` with the following tables:

1. profiles (extends auth.users)
   - id (uuid, primary key, references auth.users)
   - full_name (text)
   - email (text)
   - created_at (timestamptz)

2. companies
   - id (uuid, primary key)
   - owner_id (uuid, references auth.users)
   - name (text, not null)
   - size (text)
   - created_at (timestamptz)

3. company_exposures
   - id (uuid, primary key)
   - company_id (uuid, references companies)
   - product_name (text, not null)
   - hs_code (text)
   - origin_country (text)
   - dest_country (text)
   - port (text)
   - monthly_volume_usd (int)
   - notes (text)
   - created_at (timestamptz)

4. risk_events
   - id (uuid, primary key)
   - type (text, not null)
   - title (text, not null)
   - description (text)
   - source_url (text)
   - affected_origin_country (text)
   - affected_dest_country (text)
   - affected_port (text)
   - affected_hs_code (text)
   - affected_commodity (text)
   - severity (int, default 3)
   - effective_date (date)
   - created_at (timestamptz)

5. alerts
   - id (uuid, primary key)
   - company_id (uuid, references companies)
   - risk_event_id (uuid, references risk_events)
   - exposure_id (uuid, references company_exposures)
   - title (text, not null)
   - message (text)
   - severity (int, default 3)
   - status (text, default 'unread')
   - created_at (timestamptz)

6. sample_alerts
   - id (uuid, primary key)
   - title (text, not null)
   - message (text)
   - severity (int)
   - type (text)
   - created_at (timestamptz)

Enable Row-Level Security (RLS) on companies, company_exposures, and alerts:
- Users can only view their own companies
- Users can only view exposures for their companies
- Users can only view alerts for their companies

Create TypeScript types for these tables in `lib/types.ts`.
```

---

### Prompt 4: Onboarding Multi-Step Wizard

```
Build a multi-step onboarding wizard at `/onboarding` with 4 steps.

Use shadcn/ui form components, dark theme, and the Glass design system.

Step 1: Company Info
- Input: Company name (text)
- Input: Company size (dropdown: "Solo", "5-10 employees", "10-50", "50+")
- Button: "Next"

Step 2: Products
- Textarea: "What products do you import or manufacture?" (one per line)
- Input: Optional HS codes (text, helper text: "e.g., 7610 for aluminum structures")
- Button: "Next"

Step 3: Origins & Ports
- Multi-select: "Where do you import from?" (China, Vietnam, Mexico, India, Taiwan, South Korea, etc.)
- Multi-select: "Which ports do you use?" (Long Beach, Los Angeles, Newark, Savannah, etc.)
- Button: "Next"

Step 4: Risk Preferences
- Checkboxes: "What risks matter most?" (Tariffs, Port delays, Commodity prices, Chokepoints, Weather, Export controls)
- Button: "Finish Setup"

On completion:
- Collect all form data
- Call POST /api/onboarding with:
  {
    company: { name, size },
    exposures: [{ product_name, hs_code, origin_country, dest_country, port }]
  }
- Redirect to /dashboard

Display a progress indicator at the top showing "Step X of 4".
Use a clean card layout with breathing room (24px padding).
```

---

### Prompt 5: Onboarding API Route

```
Create an API route at `app/api/onboarding/route.ts` that handles POST requests.

Input (JSON):
{
  "company": {
    "name": "Acme Imports",
    "size": "10-50"
  },
  "exposures": [
    {
      "product_name": "Aluminum Frames",
      "hs_code": "7610",
      "origin_country": "China",
      "dest_country": "United States",
      "port": "Long Beach",
      "monthly_volume_usd": 50000
    }
  ]
}

Logic:
1. Get the authenticated user ID from Supabase session
2. Insert into `companies` table (owner_id = user.id)
3. For each exposure, insert into `company_exposures` (company_id = new company ID)
4. Optionally, copy 2-3 rows from `sample_alerts` table and insert into `alerts` table for this company (so dashboard isn't empty)
5. Return { success: true, company_id: "..." }

Handle errors gracefully.
Use Supabase client from `lib/supabase.ts`.
```

---

### Prompt 6: Dashboard Page

```
Build the main dashboard page at `/dashboard`.

Fetch data:
- Current user's company
- Alerts for the company (via GET /api/alerts)
- Company exposures

Layout:

Top section: "Today's Risk Summary"
- Show counts of alerts by severity in 3 cards:
  - "X Critical" (red badge)
  - "X High" (amber badge)
  - "X Medium" (orange badge)
- Use shadcn/ui Card components

Middle section: "Recent Alerts"
- Render a list of <AlertCard> components
- Each card shows:
  - Severity badge (color-coded)
  - Title (H3)
  - Message (body text)
  - Type pill (e.g., "Tariff", "Port")
  - Timestamp
  - "View source" link (if source_url exists)
- If no alerts, show: "No alerts yet. We're monitoring your supply chain."

Bottom/sidebar section: "Your Exposures"
- Show:
  - Origin countries (as chips/pills)
  - Ports (as chips/pills)
  - Number of products tracked
- Use <ExposureSummary> component

Use the NavBar component at the top.
Style with Glass design system (dark theme, #1E1E1F card backgrounds, subtle borders).
```

---

### Prompt 7: AlertCard Component

```
Create a reusable AlertCard component at `components/AlertCard.tsx`.

Props:
- title: string
- message: string
- severity: 1 | 2 | 3 | 4 | 5
- type: string (e.g., 'tariff', 'port', 'commodity')
- sourceUrl?: string
- createdAt: string (ISO timestamp)

UI:
- Card background: #1E1E1F
- Border: 1px solid rgba(255,255,255,0.05)
- Border radius: 12px
- Padding: 16px

Layout:
- Top-left: <SeverityBadge severity={severity} />
- Below badge: Title (20px, 600 weight, white)
- Below title: Message (14px, 400 weight, gray)
- Bottom-left: Type pill (12px, uppercase, subtle background)
- Bottom-right: Timestamp (12px, gray, formatted as "Jan 15, 2025")
- If sourceUrl exists, show "View source →" link (Glass Blue)

Use shadcn/ui Card component as base.
Use Inter font.
Make it look clean and enterprise-grade.
```

---

### Prompt 8: SeverityBadge Component

```
Create a SeverityBadge component at `components/SeverityBadge.tsx`.

Props:
- severity: 1 | 2 | 3 | 4 | 5

Logic:
- Map severity to label and color:
  - 5: "CRITICAL", #DC2626 (red)
  - 4: "HIGH", #F59E0B (amber)
  - 3: "MEDIUM", #FB923C (orange)
  - 2: "LOW", #10B981 (green)
  - 1: "INFO", #4A78FF (blue)

Style:
- 12px font, 600 weight, uppercase
- Padding: 4px 8px
- Border radius: 6px
- Background: use the severity color
- Text: white

Use shadcn/ui Badge component as base.
```

---

### Prompt 9: Admin Events Page

```
Create an admin page at `/admin/events` for manually adding risk events.

Layout:

Top:
- Title: "Risk Events (Admin)"
- Button: "Add Event" → opens a modal/dialog

Middle:
- Table showing all risk_events from the database:
  - Columns: Type, Title, Severity, Affected Country, Affected Port, Effective Date, Actions
  - Actions column: "Generate Alerts" button (calls POST /api/generate-alerts)

Add Event Modal:
- Form fields:
  - Type (dropdown: Tariff, Port, Commodity, Chokepoint, Export Control, Weather)
  - Title (text)
  - Description (textarea)
  - Source URL (text)
  - Affected origin country (text)
  - Affected dest country (text)
  - Affected port (text)
  - Affected HS code (text, helper: "prefix, e.g., 7610")
  - Affected commodity (text)
  - Severity (slider 1-5)
  - Effective date (date picker)
- Submit button: "Create Event" → calls POST /api/risk-events

On create success:
- Close modal
- Refresh events table
- Show success toast

Style with Glass design system.
Use shadcn/ui Table, Dialog, Form components.
```

---

### Prompt 10: Risk Events API

```
Create two API routes:

1. POST /api/risk-events
   - Takes event data (type, title, description, etc.)
   - Inserts into `risk_events` table
   - Returns { success: true, event_id: "..." }

2. GET /api/risk-events
   - Returns all risk events, sorted by created_at DESC
   - Returns: { events: [...] }

Use Supabase client.
Handle errors gracefully.
```

---

### Prompt 11: Generate Alerts API + Matching Logic

```
Create an API route at `app/api/generate-alerts/route.ts` that handles POST requests.

Input:
{ "event_id": "uuid" }

Logic:
1. Fetch the risk_event by ID
2. Query company_exposures table to find matches using OR logic:
   - origin_country = event.affected_origin_country
   - dest_country = event.affected_dest_country
   - port = event.affected_port
   - hs_code LIKE event.affected_hs_code + '%' (prefix match)
3. For each matching exposure:
   - Generate alert title: event.title
   - Generate alert message:
     "Affects: {exposure.product_name} (HS {exposure.hs_code}) imported from {exposure.origin_country} via {exposure.port}. {event.description}"
   - Set severity: event.severity
   - Insert into `alerts` table with:
     - company_id: exposure.company_id
     - risk_event_id: event.id
     - exposure_id: exposure.id
     - status: 'unread'
4. Return { success: true, alerts_created: count }

Use Supabase client.
Handle errors gracefully.
```

---

### Prompt 12: Alerts API

```
Create an API route at `app/api/alerts/route.ts` that handles GET requests.

Query params (optional):
- severity: filter by severity (1-5)
- status: filter by status ('unread', 'read', 'dismissed')
- type: filter by event type

Logic:
1. Get current user's company ID
2. Query `alerts` table with JOIN to `risk_events` (to get source_url and type)
3. Apply filters if provided
4. Sort by created_at DESC
5. Return:
   {
     "alerts": [
       {
         "id": "uuid",
         "title": "...",
         "message": "...",
         "severity": 4,
         "status": "unread",
         "type": "tariff",
         "source_url": "https://...",
         "created_at": "2025-01-15T10:30:00Z"
       }
     ]
   }

Use Supabase client.
Respect RLS (queries should automatically filter by user's company).
```

---

### Prompt 13: Seed Sample Alerts

```
Create a script or SQL file to insert 3 sample alerts into the `sample_alerts` table:

1. Critical tariff alert:
   - Title: "China → US aluminum tariffs increased to 25%"
   - Message: "Section 301 tariffs on aluminum products (HS 7610) increased from 15% to 25%, effective Feb 1, 2025."
   - Severity: 5
   - Type: "tariff"

2. High port delay alert:
   - Title: "Long Beach port congestion up 43%"
   - Message: "Average vessel wait time increased from 3 days to 7 days due to labor shortage and volume surge."
   - Severity: 4
   - Type: "port"

3. Medium chokepoint alert:
   - Title: "Red Sea shipping routes disrupted"
   - Message: "Houthi attacks force carriers to reroute via Cape of Good Hope, adding 10-14 days transit time."
   - Severity: 3
   - Type: "chokepoint"

Then update the onboarding API to copy these sample alerts into the `alerts` table for new users (so their dashboard isn't empty on first login).
```

---

## 11. WHAT NOT TO BUILD (GUARDRAILS)

### Explicitly Out of Scope (Week 1-4)
- ❌ Automated web scrapers (manual admin entry only)
- ❌ Email notifications (dashboard-only for now)
- ❌ Settings page (users can't edit exposures yet)
- ❌ Billing/Stripe integration
- ❌ Charts/graphs/data viz
- ❌ Mobile app or responsive optimization
- ❌ Advanced severity scoring (use simple 1-5 for now)
- ❌ AI/LLM-powered recommendations
- ❌ Multi-user teams (one user = one company for MVP)
- ❌ Historical alert archive
- ❌ Export to PDF/CSV
- ❌ Webhook integrations
- ❌ Public API

### Never Build (Per Original Brief)
- ❌ Graph-based dependency engine
- ❌ Satellite imagery
- ❌ Full AIS vessel tracking
- ❌ "GPT for supply chain" chatbot
- ❌ Supplier verification dataset
- ❌ Product photo ingestion
- ❌ Invoice parsing

---

## 12. GTM & CUSTOMER SCRIPTS

### Target Customers (Week 1-2)
- 5-50 employee importers
- 5-20 SKU ecom brands
- Mid-size manufacturers
- Freight brokers
- Procurement teams

### Outreach Script (LinkedIn/Email)
```
Hey [Name],

I'm building Glass — a real-time early-warning system for importers and manufacturers.

It gives you instant alerts when tariffs, port delays, commodity swings, or supplier risks affect YOUR specific products.

I'm doing 20-30 short calls with importers this week to make sure it's actually useful.

Want to see a preview?

[Your Name]
```

### Discovery Call Questions
1. "Walk me through your supply chain from product → port → customer."
2. "What surprises hit you hardest in the last 12 months?"
3. "How do you track tariffs or supplier risk today?"
4. "If I could send you one alert each week that would save you money or stress, what would it be?"

### Post-Call Follow-Up
```
Based on what you shared:
• You import [X] from [Y] through [Z]
• Tariffs or delays cost you [estimate]

I'll plug this into our alert engine and send you your first personalized warnings this week.

Here's your dashboard link: [link]
```

### Pricing (Post-Week 4)
- **$49/mo** — Solo importer (1-5 products)
- **$149/mo** — Small brand (5-20 SKUs)
- **$299/mo** — Manufacturer (20-100 SKUs)
- **$499/mo** — Broker/procurement team (100+ SKUs)

**$5K MRR Target**: ~20 customers
- 10 × $149 = $1,490
- 6 × $299 = $1,794
- 4 × $499 = $1,996
- **Total** = $5,280

---

## WEEK 1 CHECKLIST

- [ ] Next.js project scaffolded with Tailwind + shadcn/ui
- [ ] Landing page (`/`) with hero + CTA
- [ ] Supabase auth with magic link
- [ ] Database schema deployed (all 6 tables)
- [ ] Onboarding wizard (4 steps) functional
- [ ] POST `/api/onboarding` working
- [ ] Dashboard page showing alerts + exposures
- [ ] AlertCard + SeverityBadge components built
- [ ] Admin events page (`/admin/events`) functional
- [ ] POST `/api/risk-events` working
- [ ] POST `/api/generate-alerts` working (matching logic)
- [ ] GET `/api/alerts` working
- [ ] Sample alerts seeded for new users
- [ ] 3-5 pilot users onboarded
- [ ] 10+ customer calls scheduled

---

**END OF SPEC**

---

**How to Use This Spec**:
1. Reference this file throughout the build
2. Use Section 10 prompts to build each piece in Claude Code
3. Reference Sections 4-8 for technical implementation details
4. Use Section 11 as a guardrail when tempted to over-build
5. Use Section 12 for customer conversations

**Next Steps**:
- Paste **Prompt 1** into Claude Code to scaffold the project
- Work through prompts 2-13 sequentially
- After Week 1 build, start customer calls
- Iterate based on feedback

Good luck building Glass! 🥃
