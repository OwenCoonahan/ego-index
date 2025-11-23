# Ego Index Database Guide

## 🗄️ Current Setup Summary

**Platform:** Supabase (PostgreSQL)

**Tables:**
- `profiles` - Twitter account metadata
- `analyses` - Ego scores and analysis results
- `blocklist` - (Optional) Accounts to exclude

**Storage per account:** ~2.5 KB

**Realistic capacity:**
- Free tier: 100k-200k accounts
- Paid tier ($25/mo): 3M+ accounts

---

## 📊 Scalability Analysis

### **Database Limits (Supabase)**

| Tier | Database Size | Monthly Cost | Account Capacity |
|------|---------------|--------------|------------------|
| Free | 500 MB | $0 | 100k-200k |
| Pro | 8 GB | $25 | ~3M |
| Team | 50 GB | $599 | ~20M |

**Key insight:** Database is NOT your bottleneck. AI costs are.

### **Real Bottleneck: AI API Costs**

**Per Analysis:**
- Gemini: $0.002 per account
- OpenAI GPT-4o-mini: $0.004 per account

**At Scale:**
- 10k accounts = $20-$40
- 100k accounts = $200-$400
- 1M accounts = $2,000-$4,000

**Optimization:** Use 24-hour (or 7-day) caching to avoid re-analyzing.

---

## ⚡ Performance Optimizations

### **1. Extend Cache Period**

Current: 24 hours
Recommended: 7 days (or even 30 days for inactive accounts)

**Why:** Most accounts don't change dramatically. Weekly/monthly re-analysis is fine.

**How to implement:**
```typescript
// In app/api/analyze/route.ts, line 37
const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // Instead of 1 day

if (analysisAge < oneWeekInMs) {
  return cached result;
}
```

### **2. Add Rate Limiting**

Prevent abuse and control costs:

**Options:**
- Limit to 10 analyses per IP per day
- Require sign-in for unlimited analyses
- Use Upstash Redis for IP-based rate limiting

**Example with Upstash:**
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 d"),
});

// In API route:
const ip = request.headers.get("x-forwarded-for") || "unknown";
const { success } = await ratelimit.limit(ip);

if (!success) {
  return NextResponse.json(
    { error: "Rate limit exceeded. Try again tomorrow." },
    { status: 429 }
  );
}
```

### **3. Batch Processing**

For large-scale imports:

```bash
# Already have this:
npm run bulk-import username1 username2 username3

# Queue them overnight, process slowly
# Avoid hitting API rate limits
```

### **4. Database Indexes**

Already implemented:
- ✅ `idx_analyses_profile_id` - Fast profile lookups
- ✅ `idx_analyses_ser` - Fast SER leaderboard queries
- ✅ `idx_analyses_industry` - Industry filtering

**If you add more queries, add more indexes.**

---

## 🚫 Legal & Ethical Guidelines

### **Who NOT to Store**

#### **1. Protected/Private Accounts**
- ❌ Don't scrape private Twitter accounts
- ❌ Don't store data from protected users
- Current code likely fails on these anyway (good!)

#### **2. Minors (< 18 years old)**
- ❌ Avoid analyzing accounts of minors
- COPPA compliance issues in the US
- Check bio for age indicators

#### **3. Harassment Potential**
- ⚠️ Be careful with accounts that could be targeted
- If someone requests removal, honor it immediately
- Consider only public leaderboards for HIGH-value accounts

### **Data Retention Policy**

**Recommended approach:**

**Keep forever:**
- Username
- Scores (ego, value, SER, etc.)
- Industry classification
- Tier

**Consider purging after 90 days:**
- Tweet text (you already have the scores)
- Profile image URLs (can re-fetch)
- Bio text

**Why:** Reduces storage, reduces liability, still keeps useful data for insights.

---

## 🛡️ Implementing Blocklist (Optional)

### **Step 1: Create Blocklist Table**

Run `supabase-blocklist.sql` in Supabase SQL Editor.

This creates:
- `blocklist` table
- `is_blocked()` function
- Fast username lookup index

### **Step 2: Check Before Analyzing**

Add this to `app/api/analyze/route.ts` after line 20:

```typescript
import { isBlocked } from '@/lib/blocklist';

// After cleaning username:
const cleanUsername = username.replace('@', '').trim();

// Check blocklist
if (await isBlocked(cleanUsername)) {
  return NextResponse.json(
    { error: 'This account cannot be analyzed.' },
    { status: 403 }
  );
}
```

### **Step 3: Add Removal Endpoint**

Create `app/api/request-removal/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { deleteUserData } from '@/lib/blocklist';

export async function POST(request: NextRequest) {
  const { username } = await request.json();

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  try {
    await deleteUserData(username);
    return NextResponse.json({
      message: 'Your data has been deleted and you will not be re-analyzed.'
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}
```

**Add a "Request Removal" button on results page.**

---

## 💾 Backup Strategy

### **Current State:**

Supabase has automatic backups, but:
- Free tier: 1 day of point-in-time recovery
- Pro tier: 7 days of point-in-time recovery

### **Recommended:**

**1. Export data weekly:**

```typescript
// scripts/export-database.ts
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';

async function exportData() {
  // Export profiles
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('*');

  // Export analyses
  const { data: analyses } = await supabaseAdmin
    .from('analyses')
    .select('*');

  // Save as JSON
  fs.writeFileSync(
    `backups/backup-${new Date().toISOString()}.json`,
    JSON.stringify({ profiles, analyses }, null, 2)
  );

  console.log('Backup complete!');
}

exportData();
```

**2. Scheduled backups (GitHub Actions or cron):**

```yaml
# .github/workflows/backup.yml
name: Weekly Database Backup
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2am
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run backup
      - uses: actions/upload-artifact@v2
        with:
          name: database-backup
          path: backups/
```

---

## 📈 Monitoring & Alerts

### **What to Monitor:**

1. **Database size** - Track growth
2. **API costs** - Gemini/OpenAI usage
3. **Query performance** - Slow queries
4. **Error rates** - Failed analyses

### **Supabase Dashboard:**

Navigate to:
- **Database** > **Database** > Size and table stats
- **Database** > **Logs** > Slow queries
- **API** > **API Logs** > Error tracking

### **Set Up Alerts:**

**When database reaches 80% of free tier (400 MB):**
- Upgrade to Pro
- OR implement data purging strategy

**When AI costs exceed $X/month:**
- Increase cache period
- Add rate limiting
- Consider charging for analyses

---

## 💡 Cost Optimization Strategies

### **1. Tiered Caching**

Different cache periods based on follower count:

```typescript
const getCachePeriod = (followersCount: number) => {
  if (followersCount > 100000) {
    return 7 * 24 * 60 * 60 * 1000; // 7 days (changes fast)
  } else if (followersCount > 10000) {
    return 14 * 24 * 60 * 60 * 1000; // 14 days
  } else {
    return 30 * 24 * 60 * 60 * 1000; // 30 days (small accounts change slowly)
  }
};
```

### **2. Smart Re-Analysis**

Only re-analyze when requested OR when account goes viral:

```typescript
// Trigger re-analysis when:
// - User explicitly requests refresh
// - Account gained 10k+ followers since last analysis
// - Account was mentioned/tagged on Ego Index
```

### **3. Freemium Model**

- **Free:** Analyze once, 7-day cache
- **Premium ($5/mo):** Daily re-analysis, historical tracking
- **API Access ($50/mo):** Programmatic access, bulk analysis

---

## 🎯 Recommended Setup for Launch

**Week 1: Start Small**
- Keep 24-hour cache
- No rate limiting yet
- Monitor costs daily
- Expect: 100-500 analyses

**Week 2-4: Scale Gradually**
- Extend to 7-day cache if costs too high
- Add IP-based rate limiting (10/day)
- Set up weekly backups
- Expect: 1k-5k total accounts

**Month 2+: Optimize**
- Implement tiered caching
- Consider freemium model
- Purge old tweet text (keep scores)
- Add "request removal" feature
- Expect: 10k-100k accounts

---

## 🔐 Data Privacy Compliance

### **GDPR (if you have EU users):**

✅ **Right to access:** Show users their data
✅ **Right to deletion:** Implement removal endpoint
✅ **Data minimization:** Don't store more than needed
✅ **Transparency:** Explain what you analyze

### **CCPA (California):**

✅ **Right to know:** Disclose data collected
✅ **Right to delete:** Honor deletion requests
✅ **Opt-out:** Allow users to opt out of future analysis

### **Twitter ToS:**

✅ **Public data only:** Don't scrape private accounts
✅ **Attribution:** Link back to original tweets
✅ **Rate limits:** Respect API limits
⚠️ **Bulk scraping:** Use official API when possible

---

## 📋 Quick Reference

### **Current Capacity:**
- ✅ 100k-200k accounts (free tier)
- ✅ 3M+ accounts (paid tier)

### **Bottlenecks:**
- ❌ Database: NOT a problem
- ✅ AI costs: Main concern ($0.002-0.004 per analysis)

### **Optimizations:**
1. Extend cache period (7-30 days)
2. Add rate limiting
3. Implement blocklist
4. Purge old tweet text
5. Weekly backups

### **Legal:**
- ✅ Honor removal requests
- ✅ Avoid minors
- ✅ Don't store private accounts
- ✅ Add privacy policy

### **Files:**
- `supabase-blocklist.sql` - Create blocklist table
- `lib/blocklist.ts` - Blocklist utilities
- `scripts/export-database.ts` - Backup script (create this)

---

## 🚀 Next Steps

1. **Decide on blocklist:** Run `supabase-blocklist.sql` if you want it
2. **Monitor costs:** Track AI API usage closely
3. **Set cache period:** 7 days is a good balance
4. **Add privacy page:** Explain data usage, offer removal
5. **Backup weekly:** Automate exports

**You're set up to scale to 100k+ accounts easily.** Database is solid. Just watch those AI costs! 📊
