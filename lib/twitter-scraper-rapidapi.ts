/**
 * Twitter scraper using RapidAPI
 * Works with: twitter241, twitter-api45, twitter154, twitter-api47
 */

import axios from 'axios';
import type { Tweet, TwitterProfile, TwitterData } from './twitter-scraper';

interface RapidAPIConfig {
  apiKey: string;
  apiHost: string; // e.g., 'twitter241.p.rapidapi.com' or 'twitter-api45.p.rapidapi.com'
}

interface RapidAPITweet {
  tweet_id?: string;
  id_str?: string;
  id?: string;
  text?: string;
  full_text?: string;
  creation_date?: string;
  created_at?: string;
  retweet_count?: number;
  favorite_count?: number;
  like_count?: number;
  reply_count?: number;
  quote_count?: number;
  retweeted?: boolean;
  is_retweet?: boolean;
  in_reply_to_user_id?: string;
  reply_to?: string;
  is_reply?: boolean;
}

/**
 * Scrape Twitter using RapidAPI
 */
export async function scrapeTwitterRapidAPI(
  username: string,
  maxTweets: number = 100,
  config: RapidAPIConfig
): Promise<TwitterData> {
  const { apiKey, apiHost } = config;

  try {
    // Determine which endpoints to use based on API host
    let userEndpoint = '/user';
    let tweetsEndpoint = '/user/tweets';
    let tweetsParam = 'username';

    if (apiHost.includes('twitter154')) {
      userEndpoint = '/user/details';
      tweetsEndpoint = '/user/tweets';
      tweetsParam = 'username';
    } else if (apiHost.includes('twitter-api45')) {
      userEndpoint = '/user-info';
      tweetsEndpoint = '/user-timeline';
      tweetsParam = 'username';
    } else if (apiHost.includes('twitter241')) {
      userEndpoint = '/user';
      tweetsEndpoint = '/user-tweets';
      tweetsParam = 'username';
    }

    console.log(`Fetching profile from: https://${apiHost}${userEndpoint}`);

    // Fetch user profile
    const profileResponse = await axios.get(
      `https://${apiHost}${userEndpoint}`,
      {
        params: { [tweetsParam]: username },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost,
        },
        timeout: 15000,
      }
    );

    const userData = profileResponse.data;
    console.log('Profile data received:', Object.keys(userData));

    console.log(`Fetching tweets from: https://${apiHost}${tweetsEndpoint}`);

    // Fetch user timeline/tweets
    const tweetsResponse = await axios.get(
      `https://${apiHost}${tweetsEndpoint}`,
      {
        params: {
          [tweetsParam]: username,
          count: maxTweets,
          limit: maxTweets
        },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost,
        },
        timeout: 15000,
      }
    );

    const tweetsData = tweetsResponse.data;
    console.log('Tweets data received:', Array.isArray(tweetsData) ? tweetsData.length : Object.keys(tweetsData));

    // Transform to our format
    const profile: TwitterProfile = {
      username: userData.username || username,
      display_name: userData.name || userData.display_name || username,
      bio: userData.description || userData.bio || '',
      profile_image_url: userData.profile_pic_url || userData.profile_image_url || userData.avatar || '',
      followers_count: userData.follower_count || userData.followers_count || userData.followers || 0,
      following_count: userData.following_count || userData.following || 0,
      tweet_count: userData.number_of_tweets || userData.statuses_count || userData.tweets_count || 0,
    };

    // Transform tweets - handle different response formats
    const tweetsArray = tweetsData.results || tweetsData.tweets || tweetsData.data || [];
    console.log(`Processing ${tweetsArray.length} tweets from API response`);

    const tweets: Tweet[] = tweetsArray
      .filter((t: RapidAPITweet) => t && (t.text || t.full_text) && !t.retweeted) // Filter out retweets
      .slice(0, maxTweets)
      .map((t: RapidAPITweet) => ({
        id: t.tweet_id || t.id_str || t.id || String(Date.now()),
        text: t.text || t.full_text || '',
        created_at: t.creation_date || t.created_at || new Date().toISOString(),
        retweet_count: t.retweet_count || 0,
        like_count: t.favorite_count || t.like_count || 0,
        reply_count: t.reply_count || 0,
        quote_count: t.quote_count || 0,
        is_retweet: t.retweeted || t.is_retweet || false,
        is_reply: !!t.in_reply_to_user_id || !!t.reply_to || !!t.is_reply,
      }));

    return { profile, tweets };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorResponse = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: unknown } }).response?.data
      : undefined;
    console.error('RapidAPI scraping error:', errorResponse || errorMessage);
    throw new Error(`Failed to scrape Twitter via RapidAPI: ${errorMessage}`);
  }
}

/**
 * Alternative endpoint paths for different RapidAPI providers
 */
export const API_VARIANTS = {
  // twitter241 (davethebeast)
  twitter241: {
    userEndpoint: '/user',
    tweetsEndpoint: '/user-tweets',
  },
  // twitter-api45 (alexanderxbx)
  twitter_api45: {
    userEndpoint: '/user-info',
    tweetsEndpoint: '/user-timeline',
  },
  // twitter154 (omarmhaimdat)
  twitter154: {
    userEndpoint: '/user/details',
    tweetsEndpoint: '/user/tweets',
  },
};
