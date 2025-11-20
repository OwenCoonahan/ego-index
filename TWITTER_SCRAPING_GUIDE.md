# Twitter Scraping Implementation Guide

The Twitter scraper at `lib/twitter-scraper.ts` needs to be implemented. Here are your options:

## Option 1: Twitter API v2 (Recommended for Production)

**Pros:**
- Official, reliable, won't break
- Good rate limits on paid tiers
- Legal and ToS-compliant

**Cons:**
- Costs money ($100/month for Basic tier = 10K tweets)
- Free tier is too limited (1,500 tweets/month)

**Implementation:**
```bash
npm install twitter-api-v2
```

```typescript
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

export async function scrapeTwitter(username: string, maxTweets: number = 100) {
  const user = await client.v2.userByUsername(username, {
    'user.fields': ['description', 'public_metrics', 'profile_image_url']
  });

  const tweets = await client.v2.userTimeline(user.data.id, {
    max_results: maxTweets,
    'tweet.fields': ['created_at', 'public_metrics']
  });

  // Transform to match our interface
  return {
    profile: {
      username: user.data.username,
      display_name: user.data.name,
      bio: user.data.description || '',
      profile_image_url: user.data.profile_image_url || '',
      followers_count: user.data.public_metrics.followers_count,
      following_count: user.data.public_metrics.following_count,
      tweet_count: user.data.public_metrics.tweet_count,
    },
    tweets: tweets.data.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at || '',
      retweet_count: tweet.public_metrics?.retweet_count || 0,
      like_count: tweet.public_metrics?.like_count || 0,
      reply_count: tweet.public_metrics?.reply_count || 0,
      quote_count: tweet.public_metrics?.quote_count || 0,
      is_retweet: tweet.text.startsWith('RT @'),
      is_reply: !!tweet.referenced_tweets?.some(ref => ref.type === 'replied_to'),
    }))
  };
}
```

**Sign up:** https://developer.twitter.com/en/portal/dashboard

---

## Option 2: Puppeteer/Playwright (Free but Fragile)

**Pros:**
- Free
- No API limits
- Can scrape public profiles

**Cons:**
- May break when Twitter changes HTML
- Slower (needs to load browser)
- Might get IP blocked
- Against Twitter ToS (use at your own risk)

**Implementation:**
```bash
npm install puppeteer
```

```typescript
import puppeteer from 'puppeteer';

export async function scrapeTwitter(username: string, maxTweets: number = 100) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Go to profile
  await page.goto(`https://twitter.com/${username}`, {
    waitUntil: 'networkidle2'
  });

  // Wait for tweets to load
  await page.waitForSelector('[data-testid="tweet"]');

  // Scroll to load more tweets
  let tweets = [];
  let previousHeight = 0;

  while (tweets.length < maxTweets) {
    // Extract tweets from page
    const newTweets = await page.evaluate(() => {
      const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
      return Array.from(tweetElements).map(el => ({
        text: el.querySelector('[data-testid="tweetText"]')?.textContent || '',
        // Extract other data...
      }));
    });

    tweets = [...tweets, ...newTweets];

    // Scroll down
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(2000);

    const newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === previousHeight) break;
    previousHeight = newHeight;
  }

  await browser.close();

  // Format response to match interface
  return { profile: {...}, tweets: [...] };
}
```

---

## Option 3: Nitter Scraper (Free Alternative Frontend)

**Pros:**
- Free
- Uses Nitter (Twitter alternative frontend)
- More stable than direct scraping

**Cons:**
- Depends on Nitter instances being up
- Slower than official API
- May have rate limits

**Implementation:**
```bash
npm install axios cheerio
```

```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';

const NITTER_INSTANCE = 'https://nitter.net'; // or other instances

export async function scrapeTwitter(username: string, maxTweets: number = 100) {
  const response = await axios.get(`${NITTER_INSTANCE}/${username}`);
  const $ = cheerio.load(response.data);

  const tweets = [];
  $('.timeline-item').each((i, el) => {
    if (tweets.length >= maxTweets) return false;

    const $el = $(el);
    tweets.push({
      id: $el.attr('data-id') || '',
      text: $el.find('.tweet-content').text().trim(),
      created_at: $el.find('.tweet-date').attr('title') || '',
      // Extract metrics...
    });
  });

  // Extract profile info
  const profile = {
    username,
    display_name: $('.profile-card-fullname').text().trim(),
    bio: $('.profile-bio').text().trim(),
    // ... more fields
  };

  return { profile, tweets };
}
```

---

## Option 4: RapidAPI Twitter Scrapers

**Pros:**
- Easy to use
- Reliable
- No browser needed

**Cons:**
- Costs money (but cheaper than official API)
- Rate limits

**Popular options:**
- Twitter v1.1 (RapidAPI)
- TweetScraper API
- Twitter135 (unofficial)

---

## Recommended Approach

**For MVP/Testing:**
Start with **Option 3 (Nitter)** - it's free and relatively stable

**For Production:**
Upgrade to **Option 1 (Official API)** once you have users and revenue

**Hybrid Approach:**
- Use Nitter for anonymous/public scraping
- Offer "premium" analysis with official API for better data
- Cache aggressively (24hrs) to reduce API calls

---

## Implementation Checklist

- [ ] Choose a scraping method above
- [ ] Install required dependencies
- [ ] Implement `scrapeTwitter()` in `lib/twitter-scraper.ts`
- [ ] Test with a few profiles
- [ ] Add error handling for private/suspended accounts
- [ ] Add rate limiting to prevent abuse
- [ ] Consider adding Redis caching to reduce scraping

---

## Testing

```typescript
// Test your implementation
const data = await scrapeTwitter('elonmusk', 20);
console.log(data.profile);
console.log(data.tweets.length);
```

Good luck! 🚀
