#!/usr/bin/env tsx
/**
 * Ego Index Bot CLI
 *
 * Usage:
 *   npm run bot insights          - Generate data insights
 *   npm run bot praise             - Find accounts to praise
 *   npm run bot weekly             - Generate weekly stats
 *   npm run bot generate-tweet     - Generate random tweet
 */

import {
  findHighValueAccounts,
  generateIndustryComparison,
  detectPatterns,
  generateWeeklyStats,
  getRandomInsight,
  type InsightData,
} from '../lib/data-bot/insight-generator';
import { generatePraiseTweet, getRandomTemplate, fillTemplate } from '../lib/data-bot/tweet-templates';

async function main() {
  const command = process.argv[2] || 'help';

  console.log('\n🤖 Ego Index Bot CLI\n');

  try {
    switch (command) {
      case 'insights':
        await showInsights();
        break;
      case 'praise':
        await showPraiseTargets();
        break;
      case 'weekly':
        await showWeeklyStats();
        break;
      case 'patterns':
        await showPatterns();
        break;
      case 'industry':
        const industry = process.argv[3] || 'Tech/Startup Founder';
        await showIndustryAnalysis(industry);
        break;
      case 'generate-tweet':
        await generateRandomTweet();
        break;
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`Available commands:

  📊 Data & Insights
  ------------------
  insights          - Show all available insights
  praise            - Find high-value accounts to praise
  weekly            - Generate weekly statistics
  patterns          - Detect interesting patterns
  industry <name>   - Analyze specific industry (default: Tech/Startup Founder)

  🐦 Content Generation
  --------------------
  generate-tweet    - Generate a random tweet for the main account

  💡 Examples
  -----------
  npm run bot insights
  npm run bot praise
  npm run bot industry "Software Developer"
  npm run bot generate-tweet
`);
}

async function showInsights() {
  console.log('📊 Generating all insights...\n');

  const insights = await Promise.all([
    findHighValueAccounts(5),
    detectPatterns(),
    generateWeeklyStats(),
  ]);

  insights.forEach((insight, i) => {
    console.log(`\n${i + 1}. ${insight.title}`);
    console.log('─'.repeat(50));
    console.log(insight.tweetText);
    console.log('');
  });
}

async function showPraiseTargets() {
  console.log('💎 Finding high-value accounts to praise...\n');

  const insight = await findHighValueAccounts(10);
  const accounts = insight.data.accounts as any[];

  console.log(`Found ${accounts.length} elite accounts (SER >0.80):\n`);

  accounts.forEach((acc, i) => {
    const profile = acc.profiles;
    console.log(`${i + 1}. @${profile.username}`);
    console.log(`   SER: ${acc.signal_to_ego_ratio.toFixed(2)} | Value: ${acc.value_score} | Ego: ${acc.ego_score}`);
    console.log(`   Followers: ${profile.followers_count?.toLocaleString() || 'N/A'}\n`);

    // Generate sample praise tweet
    const tweet = generatePraiseTweet(
      profile.username,
      acc.signal_to_ego_ratio,
      acc.ego_score,
      acc.value_score
    );
    console.log(`   Sample tweet:\n   ${tweet.replace(/\n/g, '\n   ')}\n`);
    console.log('─'.repeat(50));
  });

  console.log('\n📋 Ready-to-post tweet thread:');
  console.log('─'.repeat(50));
  console.log(insight.tweetText);
}

async function showWeeklyStats() {
  console.log('📈 Generating weekly statistics...\n');

  const insight = await generateWeeklyStats();

  console.log('Weekly Report:');
  console.log('─'.repeat(50));
  console.log(JSON.stringify(insight.data, null, 2));
  console.log('\n📋 Ready-to-post tweet:');
  console.log('─'.repeat(50));
  console.log(insight.tweetText);
}

async function showPatterns() {
  console.log('🔍 Detecting patterns in the data...\n');

  const insight = await detectPatterns();

  console.log('Pattern Analysis:');
  console.log('─'.repeat(50));
  console.log(JSON.stringify(insight.data, null, 2));
  console.log('\n📋 Ready-to-post tweet:');
  console.log('─'.repeat(50));
  console.log(insight.tweetText);
}

async function showIndustryAnalysis(industry: string) {
  console.log(`📊 Analyzing "${industry}" industry...\n`);

  const insight = await generateIndustryComparison(industry);

  console.log('Industry Analysis:');
  console.log('─'.repeat(50));
  console.log(JSON.stringify(insight.data, null, 2));
  console.log('\n📋 Ready-to-post tweet:');
  console.log('─'.repeat(50));
  console.log(insight.tweetText);
}

async function generateRandomTweet() {
  console.log('🎲 Generating random tweet...\n');

  const insight = await getRandomInsight();

  console.log(`Type: ${insight.type}`);
  console.log(`Title: ${insight.title}`);
  console.log('─'.repeat(50));
  console.log(insight.tweetText);
  console.log('\n✅ Copy and paste to post!');
}

// Run the CLI
main();
