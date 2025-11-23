# Ego Index Bot System Guide

This guide explains how to use the Ego Index bot system to generate content for the main account and praise high-value contributors.

## 🎯 Overview

The bot system consists of three main components:

1. **Insight Generator** - Analyzes data and finds interesting patterns
2. **Tweet Templates** - Pre-written templates for different types of content
3. **Bot CLI** - Command-line tool to generate and manage content

## 📊 Available Commands

### Generate Insights

```bash
# Show all available insights
npm run bot insights

# Find high-value accounts to praise
npm run bot praise

# Generate weekly statistics
npm run bot weekly

# Detect interesting patterns
npm run bot patterns

# Analyze specific industry
npm run bot industry "Tech/Startup Founder"
npm run bot industry "Software Developer"
```

### Content Generation

```bash
# Generate a random tweet for the main account
npm run bot generate-tweet
```

## 💎 Praising High-Value Accounts

The system automatically finds accounts with SER (Signal-to-Ego Ratio) > 0.80 (top 5%).

**Example workflow:**

```bash
# 1. Find accounts to praise
npm run bot praise

# 2. Review the output (includes sample tweets)
# 3. Copy and paste tweets to Twitter manually or use automation

# Sample output:
# 1. @username
#    SER: 0.92 | Value: 85 | Ego: 15
#    Followers: 12,450
#
#    Sample tweet:
#    Rare W. Signal-to-Ego Ratio: 0.92 🟢 Top 5%
#
#    Keep cooking.
#
#    egoindex.app/username
```

## 📈 Data-Driven Content

### Weekly Stats

Post weekly statistics to show platform growth and trends:

```bash
npm run bot weekly
```

Sample output:
```
📈 This Week on Ego Index

247 accounts analyzed
Avg Ego: 62/100
Avg Value: 58/100

12 elite providers (SER >0.80) 🏆
45 high-ego accounts (>70) 🔥

The data never lies.

egoindex.app
```

### Pattern Detection

Find interesting correlations in the data:

```bash
npm run bot patterns
```

Sample output:
```
📊 Interesting pattern detected:

Accounts with <10k followers:
Average SER: 0.67

Accounts with >50k followers:
Average SER: 0.52

Smaller accounts provide more value, less ego.

The real ones are still small 💎

egoindex.app
```

### Industry Analysis

Compare industries:

```bash
npm run bot industry "Investor/VC"
npm run bot industry "Creator/Influencer"
```

Sample output:
```
📊 Investor/VC Industry Analysis (n=143)

Average Ego Score: 72/100
Average Value Score: 48/100
Average Noise Score: 65/100
Signal-to-Ego Ratio: 0.45

High ego detected 🚨

Full leaderboard: egoindex.app/leaderboard
```

## 🤖 Bot Strategy

### Main Account (@EgoIndex)

**Posting frequency:** 2-3x per day

**Content mix:**
- 40% Data insights (weekly stats, patterns, industry comparisons)
- 30% High-value account highlights
- 20% Engagement (questions, polls, calls to action)
- 10% Platform updates/features

**Tone:** Data-driven, slightly cheeky, helpful

### Praise Bots (Optional)

If you decide to run automated praise bots:

**Frequency:** 20-30 comments per day across 5-10 bot accounts (2-3 each)

**Target criteria:**
- SER > 0.80 (elite accounts)
- 5k-100k followers (sweet spot)
- Active in last 7 days

**Safety rules:**
- Only praise, never roast from bot accounts
- Rotate templates to avoid looking spammy
- Stagger timing (look human)
- Use aged Twitter accounts with real-looking profiles

## 📝 Tweet Template Categories

### 1. Praise Templates

For accounts with high SER:

```typescript
import { generatePraiseTweet } from './lib/data-bot/tweet-templates';

const tweet = generatePraiseTweet('username', 0.92, 15, 85);
// Output: "Rare W. Signal-to-Ego Ratio: 0.92 🟢 Top 5%..."
```

### 2. Data Templates

For insights and analysis:

```typescript
import { getRandomTemplate, fillTemplate } from './lib/data-bot/tweet-templates';

const template = getRandomTemplate('data');
const tweet = fillTemplate(template, {
  count: '247',
  timeframe: 'this week',
  avgEgo: '62',
  avgValue: '58',
  insight: 'More noise than signal overall'
});
```

### 3. Engagement Templates

For community interaction:

```typescript
const template = getRandomTemplate('engagement');
// No variables needed, ready to post
console.log(template.text);
```

## 🔧 Integration with Twitter API

To automate posting, you'll need to integrate with Twitter API:

**Option A: Manual posting**
1. Run `npm run bot generate-tweet`
2. Copy output
3. Paste into Twitter

**Option B: Twitter API integration**
1. Get Twitter API keys
2. Install `twitter-api-v2` package
3. Create posting script using generated content

Example:
```typescript
import { TwitterApi } from 'twitter-api-v2';
import { getRandomInsight } from './lib/data-bot/insight-generator';

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function postInsight() {
  const insight = await getRandomInsight();
  await client.v2.tweet(insight.tweetText);
  console.log('Posted:', insight.title);
}
```

## ⚠️ Best Practices

### DO:
- ✅ Focus on praising high-value accounts
- ✅ Use data to tell interesting stories
- ✅ Mix automated insights with manual curation
- ✅ Respond to mentions and engage authentically
- ✅ Track which content performs best

### DON'T:
- ❌ Spam or harass accounts
- ❌ Roast small accounts (<50k followers)
- ❌ Post more than 5x per day from main account
- ❌ Use bots to artificially inflate engagement
- ❌ Violate Twitter's automation rules

## 📊 Analytics to Track

Monitor these metrics to optimize:

1. **Engagement rate** by content type
2. **Click-through rate** to egoindex.app
3. **Follower growth** rate
4. **Mentions** and brand awareness
5. **High-value accounts** that engage back

## 🚀 Automation Setup (Optional)

For scheduled posting:

**Using cron (Linux/Mac):**
```bash
# Post insights every 8 hours
0 */8 * * * cd /path/to/ego-index && npm run bot generate-tweet > /tmp/tweet.txt
```

**Using GitHub Actions:**
```yaml
name: Post Weekly Stats
on:
  schedule:
    - cron: '0 18 * * 5'  # Every Friday at 6pm
jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run bot weekly
```

## 🎯 Content Calendar Example

**Monday:**
- Morning: Weekly stats from weekend
- Evening: High-value account highlight

**Tuesday:**
- Afternoon: Industry comparison
- Evening: Engagement question

**Wednesday:**
- Morning: Pattern detection insight
- Evening: High-value account highlight

**Thursday:**
- Afternoon: Data insight
- Evening: User-submitted analysis

**Friday:**
- Morning: Week in review
- Afternoon: Top 5 high-value accounts thread

**Weekend:**
- Engagement-focused content
- Respond to mentions

## 📞 Support

Questions? Issues?
- Check the codebase at `lib/data-bot/`
- Review templates at `lib/data-bot/tweet-templates.ts`
- Test with `npm run bot insights`

---

**Built to help you find signal in the noise.** 💎
