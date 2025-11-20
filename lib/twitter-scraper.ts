// Twitter Scraper Utility using Nitter (free Twitter frontend)
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  retweet_count: number;
  like_count: number;
  reply_count: number;
  quote_count: number;
  is_retweet: boolean;
  is_reply: boolean;
}

export interface TwitterProfile {
  username: string;
  display_name: string;
  bio: string;
  profile_image_url: string;
  followers_count: number;
  following_count: number;
  tweet_count: number;
}

export interface TwitterData {
  profile: TwitterProfile;
  tweets: Tweet[];
}

// List of public Nitter instances (fallback if one is down)
// Note: These can go down or get rate-limited. Updated list at: https://status.d420.de/
// Last updated: 2025-11-14
const NITTER_INSTANCES = [
  // Currently live instances (as of 2025-11-14)
  'https://nitter.poast.org',
  'https://nitter.tiekoetter.com',
  'https://nitter.space',
  'https://lightbrd.com',
  'https://xcancel.com',
  'https://nuku.trabun.org',
  'https://nitter.net',
  'https://nitter.privacyredirect.com',
  // Additional fallbacks
  'https://nitter.privacydev.net',
  'https://nitter.cz',
  'https://nitter.unixfox.eu',
  'https://nitter.kavin.rocks',
  'https://nitter.mint.lgbt',
  'https://nitter.pw',
  'https://nitter.fdn.fr',
  'https://nitter.esmailelbob.xyz',
];

/**
 * Parse a number from Nitter's stat format (e.g., "1.2K" -> 1200)
 */
function parseNitterNumber(str: string): number {
  if (!str) return 0;

  const cleaned = str.trim().toUpperCase();

  if (cleaned.includes('K')) {
    return Math.round(parseFloat(cleaned.replace('K', '')) * 1000);
  } else if (cleaned.includes('M')) {
    return Math.round(parseFloat(cleaned.replace('M', '')) * 1000000);
  }

  return parseInt(cleaned.replace(/,/g, '')) || 0;
}

/**
 * Try to scrape from a specific Nitter instance
 */
async function scrapeFromNitterInstance(
  instance: string,
  username: string,
  maxTweets: number = 100
): Promise<TwitterData> {
  const url = `${instance}/${username}`;

  // Set a timeout and user agent
  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const $ = cheerio.load(response.data);

  // Check if profile exists
  if ($('.error-panel').length > 0 || $('title').text().includes('not found')) {
    throw new Error('Profile not found or is private');
  }

  // Extract profile information
  const displayName = $('.profile-card-fullname').text().trim() || username;
  const bio = $('.profile-bio').text().trim() || '';

  // Get profile image (Nitter serves it from their instance)
  let profileImageUrl = $('.profile-card-avatar').attr('src') || '';
  if (profileImageUrl && !profileImageUrl.startsWith('http')) {
    profileImageUrl = instance + profileImageUrl;
  }

  // Extract stats
  const statsText = $('.profile-stat-num').map((_, el) => $(el).text().trim()).get();
  const followersCount = statsText[1] ? parseNitterNumber(statsText[1]) : 0;
  const followingCount = statsText[0] ? parseNitterNumber(statsText[0]) : 0;
  const tweetCount = statsText[2] ? parseNitterNumber(statsText[2]) : 0;

  // Extract tweets
  const tweets: Tweet[] = [];
  const tweetElements = $('.timeline-item').slice(0, maxTweets);

  console.log(`Found ${tweetElements.length} timeline items`);

  tweetElements.each((_, element) => {
    const $tweet = $(element);

    // Skip if this is a "show more" element or doesn't have content
    const hasContent = $tweet.find('.tweet-content').length > 0;
    const isShowMore = $tweet.hasClass('show-more');

    if (isShowMore || !hasContent) {
      console.log(`Skipping timeline-item: showMore=${isShowMore}, hasContent=${hasContent}`);
      return;
    }

    // Get tweet ID from the link
    const tweetLink = $tweet.find('.tweet-link').attr('href') || '';
    const tweetId = tweetLink.split('/').pop()?.split('#')[0] || Date.now().toString();

    // Get tweet text
    const tweetText = $tweet.find('.tweet-content').text().trim();

    // Skip empty tweets
    if (!tweetText) return;

    // Check if it's a retweet
    const isRetweet = $tweet.find('.retweet-header').length > 0 ||
                      tweetText.startsWith('RT @');

    // Check if it's a reply
    const isReply = $tweet.find('.replying-to').length > 0;

    // Get timestamp
    const timestamp = $tweet.find('.tweet-date a').attr('title') ||
                      new Date().toISOString();

    // Get stats (likes, retweets, etc.)
    const stats = $tweet.find('.icon-container').map((_, el) => {
      const text = $(el).text().trim();
      return parseNitterNumber(text);
    }).get();

    const [replyCount = 0, retweetCount = 0, quoteCount = 0, likeCount = 0] = stats;

    tweets.push({
      id: tweetId,
      text: tweetText,
      created_at: timestamp,
      retweet_count: retweetCount,
      like_count: likeCount,
      reply_count: replyCount,
      quote_count: quoteCount,
      is_retweet: isRetweet,
      is_reply: isReply,
    });
  });

  return {
    profile: {
      username,
      display_name: displayName,
      bio,
      profile_image_url: profileImageUrl,
      followers_count: followersCount,
      following_count: followingCount,
      tweet_count: tweetCount,
    },
    tweets,
  };
}

/**
 * Generate mock data for testing when real scraping isn't available
 */
function getMockTwitterData(username: string): TwitterData {
  const mockTweets: Tweet[] = [
    {
      id: "1",
      text: "Just closed a massive deal! Super excited about what's coming next. This is going to be huge! 🚀",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      retweet_count: 45,
      like_count: 320,
      reply_count: 12,
      quote_count: 5,
      is_retweet: false,
      is_reply: false,
    },
    {
      id: "2",
      text: "Here's a thread on how to optimize your database queries. 10 tips that saved me hours of debugging: 1/ Use proper indexes...",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      retweet_count: 120,
      like_count: 890,
      reply_count: 45,
      quote_count: 23,
      is_retweet: false,
      is_reply: false,
    },
    {
      id: "3",
      text: "Can't believe I got invited to speak at this conference. So humbled and grateful 🙏",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      retweet_count: 15,
      like_count: 156,
      reply_count: 8,
      quote_count: 2,
      is_retweet: false,
      is_reply: false,
    },
    {
      id: "4",
      text: "Quick tip: Always validate user input before processing. Saved me from a major security issue today.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      retweet_count: 234,
      like_count: 1240,
      reply_count: 67,
      quote_count: 34,
      is_retweet: false,
      is_reply: false,
    },
    {
      id: "5",
      text: "My startup just hit $1M ARR! Journey from zero to here was insane. AMA about building a SaaS 💰",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      retweet_count: 89,
      like_count: 567,
      reply_count: 234,
      quote_count: 45,
      is_retweet: false,
      is_reply: false,
    },
    {
      id: "6",
      text: "Working on some exciting features. Can't share yet but you'll love it!",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      retweet_count: 23,
      like_count: 145,
      reply_count: 19,
      quote_count: 3,
      is_retweet: false,
      is_reply: false,
    },
  ];

  return {
    profile: {
      username,
      display_name: username.charAt(0).toUpperCase() + username.slice(1),
      bio: "Building cool stuff on the internet. Founder @startup. Sharing what I learn.",
      profile_image_url: "https://via.placeholder.com/400",
      followers_count: 12500,
      following_count: 450,
      tweet_count: 3240,
    },
    tweets: mockTweets,
  };
}

/**
 * Scrape Twitter profile and recent tweets using Nitter
 * @param username - Twitter username (without @)
 * @param maxTweets - Maximum number of tweets to fetch (default: 100)
 * @returns TwitterData object with profile and tweets
 */
export async function scrapeTwitter(
  username: string,
  maxTweets: number = 100
): Promise<TwitterData> {
  // Clean username
  const cleanUsername = username.replace('@', '').trim();

  // Use mock data if enabled
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log(`🎭 Using mock data for @${cleanUsername}`);
    return getMockTwitterData(cleanUsername);
  }

  // Use RapidAPI if configured
  if (process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_HOST) {
    console.log(`🚀 Using RapidAPI to scrape @${cleanUsername}`);
    const { scrapeTwitterRapidAPI } = await import('./twitter-scraper-rapidapi');
    return await scrapeTwitterRapidAPI(cleanUsername, maxTweets, {
      apiKey: process.env.RAPIDAPI_KEY,
      apiHost: process.env.RAPIDAPI_HOST,
    });
  }

  // Try each Nitter instance until one works
  let lastError: Error | null = null;

  for (const instance of NITTER_INSTANCES) {
    try {
      console.log(`Trying to scrape ${cleanUsername} from ${instance}...`);
      const data = await scrapeFromNitterInstance(instance, cleanUsername, maxTweets);
      console.log(`Successfully scraped ${data.tweets.length} tweets from ${instance}`);
      return data;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Failed to scrape from ${instance}:`, error);
      // Continue to next instance
    }
  }

  // If all instances failed, throw error
  throw new Error(
    `Failed to scrape Twitter data for @${cleanUsername} from all Nitter instances. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Filter out retweets and replies to get only original tweets
 */
export function filterOriginalTweets(tweets: Tweet[]): Tweet[] {
  return tweets.filter(tweet => !tweet.is_retweet && !tweet.is_reply);
}

/**
 * Get engagement rate for a tweet
 */
export function calculateEngagementRate(tweet: Tweet, followerCount: number): number {
  if (followerCount === 0) return 0;
  const totalEngagement = tweet.like_count + tweet.retweet_count + tweet.reply_count + tweet.quote_count;
  return (totalEngagement / followerCount) * 100;
}
