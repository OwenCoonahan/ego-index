# Ego Index 🔥

> Check your social media ego-to-value ratio

A viral web app that analyzes Twitter/X profiles and gives them an "Ego Index" score based on how much they talk about themselves vs. how much value they provide.

## Features

✨ **AI-Powered Analysis** - Uses GPT-4o-mini or Gemini to analyze tweets for ego signals
🎨 **Beautiful Results Cards** - Shareable gradient cards optimized for virality
📊 **Detailed Breakdowns** - Radar charts, bar graphs, and tweet highlights
🏆 **Leaderboards** - See who has the highest (and lowest) ego scores
⚡ **Fast & Scalable** - Built on Next.js 14 + Vercel + Supabase

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom gradients
- **Database:** Supabase (PostgreSQL)
- **AI Analysis:** OpenAI GPT-4o-mini (or Gemini)
- **Charts:** Recharts
- **Deployment:** Vercel
- **Twitter Scraping:** Public scraping (upgrade to official API later)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works)
- An OpenAI API key (or Gemini API key)

### Installation

1. **Clone and install dependencies**

\`\`\`bash
cd "Ego Index"
npm install
\`\`\`

2. **Set up Supabase**

- Go to [supabase.com](https://supabase.com) and create a new project
- Copy your project URL and anon key
- In the Supabase SQL Editor, run the contents of `supabase-schema.sql`

3. **Configure environment variables**

Create a `.env.local` file:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI API (choose one)
OPENAI_API_KEY=sk-...
# OR
GEMINI_API_KEY=your_gemini_key
\`\`\`

4. **Implement the Twitter scraper**

The Twitter scraper at `lib/twitter-scraper.ts` is currently a placeholder. You have several options:

**Option A: Use a library (recommended for quick start)**
\`\`\`bash
npm install agent-twitter-client
# Or: npm install goat-x
\`\`\`

Then implement the scraping logic in `lib/twitter-scraper.ts`

**Option B: Use official Twitter API**
- Sign up for Twitter API access
- Add your API keys to `.env.local`
- Implement using the Twitter API v2

**Option C: Custom web scraping**
- Use Puppeteer or Playwright
- Note: May break if Twitter changes their HTML structure

5. **Run the development server**

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
ego-index/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── analyze/[username]/page.tsx # Results page
│   ├── leaderboard/page.tsx        # Leaderboard
│   ├── components/
│   │   └── ResultCard.tsx          # Shareable card component
│   └── api/
│       ├── analyze/route.ts        # Main analysis endpoint
│       ├── leaderboard/route.ts    # Leaderboard data
│       └── og/route.tsx            # OG image generation
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── database.types.ts           # Database types
│   ├── twitter-scraper.ts          # Twitter scraping logic
│   └── ego-analyzer.ts             # AI analysis engine
├── supabase-schema.sql             # Database schema
└── tailwind.config.ts              # Design system (gradients, colors)
\`\`\`

## Design System

### Color Palette

- **Background:** `#0A0A0A` (Deep black)
- **Foreground:** `#F5F5F5` (Off-white)
- **Secondary:** `#A0A0A0` (Gray)

### Gradients (Score-based)

- **Low Ego (0-40):** Cool blues/purples (`#667EEA → #764BA2`)
- **Balanced (41-60):** Multi-color (`#FA8BFF → #2BD2FF → #2BFF88`)
- **High Ego (61-100):** Hot fire colors (`#FF6B6B → #FF8E53`)

### Typography

- **Font:** Inter (Google Fonts)
- **Sizes:** Large scores use 8xl-9xl font sizes for impact

## Deployment

### Deploy to Vercel

1. **Push to GitHub**

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
\`\`\`

2. **Import to Vercel**

- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables from `.env.local`
- Deploy!

3. **Set up custom domain** (optional)

- Add `egoindex.app` or your domain in Vercel settings
- Update DNS records

## Usage

1. **Analyze a profile**
   - Enter a Twitter username (with or without @)
   - App scrapes their recent tweets
   - AI analyzes and generates scores
   - Results cached for 24 hours

2. **Share results**
   - Beautiful card is generated automatically
   - Click "Share to X" to post results
   - OG images are generated for link previews

3. **View leaderboard**
   - See top/bottom ego scores
   - Filter by industry
   - Click profiles to see their analysis

## Viral Growth Strategies

### Implemented
- ✅ Beautiful shareable cards
- ✅ Dynamic gradients based on score
- ✅ Leaderboard functionality
- ✅ OG image generation
- ✅ 24-hour caching (reduces cost + allows tracking)

### TODO for Maximum Virality
- [ ] One-click Twitter share with pre-written text
- [ ] "Compare with friend" feature
- [ ] Anonymous sharing mode
- [ ] Daily/weekly trending profiles
- [ ] "Roast me" mode (opt-in savage analysis)
- [ ] Temporal tracking (ego changes over time)
- [ ] Browser extension for quick checks
- [ ] Waiting list with social proof

## Cost Estimates

**For 10,000 analyses:**
- Vercel: $20/month (Pro tier)
- Supabase: Free tier → $25/month
- OpenAI (GPT-4o-mini): ~$20-40 (with caching)
- **Total: ~$65-85/month**

**Optimization tips:**
- Implement Redis caching (Upstash) to reduce duplicate analyses
- Use Gemini instead of OpenAI (2x cheaper)
- Rate limit to prevent abuse

## Contributing

This is a personal/viral project, but feel free to fork and build your own version!

## License

MIT - Build something cool with it!

---

**Built with Claude Code** 🤖
