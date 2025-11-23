/**
 * Insight Generator for Ego Index Data Bot
 * Generates data-driven insights from analyzed Twitter accounts
 */

import { supabaseAdmin } from '../supabase';

export interface InsightData {
  type: 'high_value' | 'industry_comparison' | 'pattern_detection' | 'weekly_stats';
  title: string;
  data: Record<string, unknown>;
  tweetText: string;
}

/**
 * Find high-value accounts (SER > 0.8) that should be praised
 */
export async function findHighValueAccounts(limit: number = 10): Promise<InsightData> {
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select(`
      *,
      profiles (username, display_name, followers_count)
    `)
    .gte('signal_to_ego_ratio', 0.80)
    .order('signal_to_ego_ratio', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const accounts = data as Array<{
    signal_to_ego_ratio: number;
    value_score: number;
    ego_score: number;
    profiles: {
      username: string;
      display_name: string;
      followers_count: number;
    };
  }>;

  return {
    type: 'high_value',
    title: 'Elite Value Providers This Week',
    data: { accounts },
    tweetText: generateHighValueTweet(accounts.slice(0, 5)),
  };
}

/**
 * Generate industry comparison insights
 */
export async function generateIndustryComparison(industry: string): Promise<InsightData> {
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select(`
      ego_score,
      value_score,
      noise_score,
      signal_to_ego_ratio,
      industry,
      profiles (username, followers_count)
    `)
    .eq('industry', industry)
    .not('signal_to_ego_ratio', 'is', null);

  if (error) throw error;

  const analyses = data as Array<{
    ego_score: number;
    value_score: number;
    noise_score: number;
    signal_to_ego_ratio: number;
    industry: string;
    profiles: { username: string; followers_count: number };
  }>;
  const avgEgo = Math.round(analyses.reduce((sum, a) => sum + a.ego_score, 0) / analyses.length);
  const avgValue = Math.round(analyses.reduce((sum, a) => sum + a.value_score, 0) / analyses.length);
  const avgNoise = Math.round(analyses.reduce((sum, a) => sum + a.noise_score, 0) / analyses.length);
  const avgSER = (analyses.reduce((sum, a) => sum + a.signal_to_ego_ratio, 0) / analyses.length).toFixed(2);

  return {
    type: 'industry_comparison',
    title: `${industry} Industry Analysis`,
    data: { industry, avgEgo, avgValue, avgNoise, avgSER, count: analyses.length },
    tweetText: generateIndustryTweet(industry, avgEgo, avgValue, avgNoise, avgSER, analyses.length),
  };
}

/**
 * Detect patterns in analyzed accounts
 */
export async function detectPatterns(): Promise<InsightData> {
  // Get all analyses
  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select(`
      ego_score,
      value_score,
      noise_score,
      signal_to_ego_ratio,
      industry,
      profiles (followers_count)
    `)
    .not('signal_to_ego_ratio', 'is', null);

  if (error) throw error;

  const analyses = data as Array<{
    ego_score: number;
    value_score: number;
    noise_score: number;
    signal_to_ego_ratio: number;
    industry: string;
    profiles: { followers_count: number };
  }>;

  // Pattern: Correlation between follower count and SER
  const highFollowers = analyses.filter(a => a.profiles.followers_count > 50000);
  const lowFollowers = analyses.filter(a => a.profiles.followers_count < 10000);

  const avgSERHigh = highFollowers.length > 0
    ? (highFollowers.reduce((sum, a) => sum + a.signal_to_ego_ratio, 0) / highFollowers.length).toFixed(2)
    : '0.00';
  const avgSERLow = lowFollowers.length > 0
    ? (lowFollowers.reduce((sum, a) => sum + a.signal_to_ego_ratio, 0) / lowFollowers.length).toFixed(2)
    : '0.00';

  const pattern = parseFloat(avgSERLow) > parseFloat(avgSERHigh)
    ? 'smaller_better'
    : 'bigger_better';

  return {
    type: 'pattern_detection',
    title: 'Follower Count vs Signal-to-Ego Ratio',
    data: { avgSERHigh, avgSERLow, pattern },
    tweetText: generatePatternTweet(avgSERHigh, avgSERLow, pattern),
  };
}

/**
 * Generate weekly stats summary
 */
export async function generateWeeklyStats(): Promise<InsightData> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select('*')
    .gte('created_at', oneWeekAgo.toISOString());

  if (error) throw error;

  const analyses = data as Array<{
    ego_score: number;
    value_score: number;
    signal_to_ego_ratio: number;
  }>;
  const totalAnalyzed = analyses.length;
  const avgEgo = Math.round(analyses.reduce((sum, a) => sum + a.ego_score, 0) / analyses.length);
  const avgValue = Math.round(analyses.reduce((sum, a) => sum + a.value_score, 0) / analyses.length);
  const highEgoCount = analyses.filter(a => a.ego_score > 70).length;
  const highValueCount = analyses.filter(a => a.signal_to_ego_ratio >= 0.80).length;

  return {
    type: 'weekly_stats',
    title: 'This Week on Ego Index',
    data: { totalAnalyzed, avgEgo, avgValue, highEgoCount, highValueCount },
    tweetText: generateWeeklyTweet(totalAnalyzed, avgEgo, avgValue, highEgoCount, highValueCount),
  };
}

// ============================================================================
// TWEET GENERATORS
// ============================================================================

function generateHighValueTweet(accounts: Array<{
  signal_to_ego_ratio: number;
  profiles: { username: string };
}>): string {

  return `🏆 Elite Value Providers This Week

These accounts have SER >0.80 (top 5%):

${accounts.map((a, i) =>
  `${i + 1}. @${a.profiles.username} - SER: ${a.signal_to_ego_ratio.toFixed(2)}`
).join('\n')}

More signal, less noise. Follow them.

egoindex.app`;
}

function generateIndustryTweet(
  industry: string,
  avgEgo: number,
  avgValue: number,
  avgNoise: number,
  avgSER: string,
  count: number
): string {
  let commentary = '';

  if (avgEgo > 65) commentary = 'High ego detected 🚨';
  else if (avgValue > 70) commentary = 'Strong value providers 💎';
  else if (avgNoise > 60) commentary = 'Lots of noise 📢';
  else commentary = 'Balanced mix ⚖️';

  return `📊 ${industry} Industry Analysis (n=${count})

Average Ego Score: ${avgEgo}/100
Average Value Score: ${avgValue}/100
Average Noise Score: ${avgNoise}/100
Signal-to-Ego Ratio: ${avgSER}

${commentary}

Full leaderboard: egoindex.app/leaderboard`;
}

function generatePatternTweet(avgSERHigh: string, avgSERLow: string, pattern: string): string {
  if (pattern === 'smaller_better') {
    return `📊 Interesting pattern detected:

Accounts with <10k followers:
Average SER: ${avgSERLow}

Accounts with >50k followers:
Average SER: ${avgSERHigh}

Smaller accounts provide more value, less ego.

The real ones are still small 💎

egoindex.app`;
  } else {
    return `📊 Data shows:

Big accounts (>50k): SER ${avgSERHigh}
Small accounts (<10k): SER ${avgSERLow}

Size isn't everything, but bigger accounts are holding their own.

egoindex.app`;
  }
}

function generateWeeklyTweet(
  total: number,
  avgEgo: number,
  avgValue: number,
  highEgo: number,
  highValue: number
): string {
  return `📈 This Week on Ego Index

${total} accounts analyzed
Avg Ego: ${avgEgo}/100
Avg Value: ${avgValue}/100

${highValue} elite providers (SER >0.80) 🏆
${highEgo} high-ego accounts (>70) 🔥

The data never lies.

egoindex.app`;
}

/**
 * Get a random insight (useful for automated posting)
 */
export async function getRandomInsight(): Promise<InsightData> {
  const insights = [
    () => findHighValueAccounts(5),
    () => detectPatterns(),
    () => generateWeeklyStats(),
  ];

  const randomIndex = Math.floor(Math.random() * insights.length);
  return await insights[randomIndex]();
}
