/**
 * Bulk Import Script for Ego Index
 *
 * This script populates the database with analyses of curated Twitter accounts.
 * It uses the existing /api/analyze endpoint to ensure consistency.
 *
 * Usage:
 *   npx tsx scripts/bulk-import.ts
 *
 * Or with a custom list:
 *   npx tsx scripts/bulk-import.ts elonmusk pmarca paulg
 */

const DELAY_BETWEEN_ACCOUNTS = 8000; // 8 seconds between accounts to be respectful
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

// Curated list of interesting accounts across different categories (100+ accounts)
const CURATED_ACCOUNTS = [
  // === TECH FOUNDERS & CEOs === (likely high ego potential)
  'elonmusk',      // Tesla, SpaceX - known for main character energy
  'pmarca',        // Marc Andreessen - a16z cofounder
  'sama',          // Sam Altman - OpenAI
  'dhh',           // DHH - Basecamp, known for hot takes
  'levelsio',      // Pieter Levels - indie hacker
  'naval',         // Naval Ravikant - philosopher founder
  'patrick_oshag', // Patrick O'Shaughnessy - O'Shaughnessy Ventures
  'shaanvp',       // Shaan Puri - My First Million
  'tobi',          // Tobi Lutke - Shopify CEO
  'adamdangelo',   // Adam D'Angelo - Quora CEO
  'biz',           // Biz Stone - Twitter cofounder
  'ev',            // Ev Williams - Medium founder

  // === VCs & INVESTORS ===
  'chamath',       // Chamath Palihapitiya
  'jason',         // Jason Calacanis
  'garrytan',      // Garry Tan - YC
  'alexisohanian', // Alexis Ohanian - Reddit cofounder
  'balajis',       // Balaji Srinivasan
  'bhorowitz',     // Ben Horowitz - a16z
  'eladgil',       // Elad Gil
  'sriramk',       // Sriram Krishnan
  'jaltma',        // Jill Carlson
  'ljin18',        // Li Jin - Variant Fund

  // === TECH TWITTER PERSONALITIES ===
  'paulg',         // Paul Graham - YC founder
  'shreyas',       // Shreyas Doshi - product leader
  'lennysan',      // Lenny Rachitsky
  'andrewchen',    // Andrew Chen - a16z
  'agazdecki',     // Andrew Gazdecki - Acquire.com
  'swyx',          // Shawn Wang - dev influencer
  'GergelyOrosz',  // Gergely Orosz - Pragmatic Engineer
  'joulee',        // Julie Zhuo - product leader
  'bbalfour',      // Brian Balfour - Reforge

  // === DEVELOPER TWITTER ===
  'thorstenball',  // Thorsten Ball - author
  'kentcdodds',    // Kent C. Dodds
  'wesbos',        // Wes Bos
  'addyosmani',    // Addy Osmani - Google
  'tj_holowaychuk',// TJ Holowaychuk
  'jesslynnrose',  // Jess Rose - developer advocate
  'sarah_edo',     // Sarah Drasner
  'dan_abramov',   // Dan Abramov - React
  'sebmarkbage',   // Sebastian Markbåge - React
  'ThePrimeagen',  // ThePrimeagen - Twitch dev
  'cassidoo',      // Cassidy Williams

  // === AI/ML RESEARCHERS & BUILDERS ===
  'ylecun',        // Yann LeCun - Meta AI
  'AndrewYNg',     // Andrew Ng
  'karpathy',      // Andrej Karpathy
  'fchollet',      // François Chollet - Keras
  '_akhaliq',      // AK - Papers with Code
  'hardmaru',      // David Ha
  'poolio',        // Nicolas Cage (AI researcher)
  'alexjc',        // Alex J. Champandard

  // === CRYPTO/WEB3 ===
  'vitalikbuterin',// Vitalik Buterin
  'punk6529',      // 6529
  'cobie',         // Cobie
  'sassal0x',      // Sassal
  'DCinvestor',    // DC Investor
  'evan_van_ness', // Evan Van Ness
  'hasufl',        // Hasu
  'tayvano_',      // Taylor Monahan - MyCrypto
  'RyanSAdams',    // Ryan Sean Adams - Bankless
  'santiagoroel',  // Santiago Santos

  // === INDIE HACKERS ===
  'yongfook',      // Jon Yongfook
  'marc_louvion',  // Marc Louvion
  'tdinh_me',      // Tony Dinh
  'dannypostmaa',  // Danny Postma
  'heyrobinpayeur',// Robin Payeur
  'Dagobert_Renouf',// Dagobert Renouf
  'marc_louvion',  // Marc Louvion
  'dagorenouf',    // Dago Renouf

  // === CONTENT CREATORS & EDUCATORS ===
  'thealexbanks',  // Alex Banks
  'dickiebush',    // Dickie Bush - Ship 30 for 30
  'jackbutcher',   // Jack Butcher - Visualize Value
  'anthilemoon',   // Anne-Laure Le Cunff - Ness Labs
  'dvassallo',     // Daniel Vassallo
  'arvidkahl',     // Arvid Kahl
  'MeetKevon',     // Kevon Cheung

  // === DESIGNERS ===
  'pablostanley',  // Pablo Stanley
  'tobiasvanschneider', // Tobias van Schneider
  'jongold',       // Jon Gold
  'jessicahische', // Jessica Hische
  'danmall',       // Dan Mall
  'chriscoyier',   // Chris Coyier

  // === JOURNALISTS & WRITERS ===
  'benthompson',   // Ben Thompson - Stratechery
  'caseynewton',   // Casey Newton - Platformer
  'daringfireball',// John Gruber - Daring Fireball
  'mgsiegler',     // MG Siegler
  'Om',            // Om Malik
  'pariss',        // Paris Martineau
  'alexeheath',    // Alex Heath - The Verge

  // === CONTRARIAN/SPICY ACCOUNTS ===
  'waitbutwhy',    // Tim Urban
  'APompliano',    // Anthony Pompliano
  'david_perell',  // David Perell
  'nntaleb',       // Nassim Taleb - known for ego
  'naval',         // Naval - philosophical

  // === HUMBLE/VALUE-FOCUSED (for balance) ===
  'simonw',        // Simon Willison - Django creator
  'b0rk',          // Julia Evans - zines
  'kelseyhightower', // Kelsey Hightower
  'mipsytipsy',    // Charity Majors
  'jdan',          // Jordan Scales
  'tjholowaychuk', // TJ Holowaychuk
];

interface ImportResult {
  username: string;
  success: boolean;
  error?: string;
  cached?: boolean;
  overallScore?: number;
}

async function analyzeAccount(username: string): Promise<ImportResult> {
  try {
    console.log(`\n🔍 Analyzing @${username}...`);

    const response = await fetch(
      `${BASE_URL}/api/analyze?username=${username}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        username,
        success: false,
        error: error.error || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      username,
      success: true,
      cached: data.cached,
      overallScore: data.analysis?.overallScore,
    };
  } catch (error) {
    return {
      username,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function bulkImport(accounts: string[]): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Starting Bulk Import for Ego Index`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Total accounts to process: ${accounts.length}`);
  console.log(`⏱️  Estimated time: ~${Math.round((accounts.length * DELAY_BETWEEN_ACCOUNTS) / 1000 / 60)} minutes`);
  console.log(`🌐 Using API: ${BASE_URL}`);
  console.log(`${'='.repeat(60)}\n`);

  const results: ImportResult[] = [];
  let successCount = 0;
  let errorCount = 0;
  let cachedCount = 0;

  for (let i = 0; i < accounts.length; i++) {
    const username = accounts[i];
    const progress = `[${i + 1}/${accounts.length}]`;

    console.log(`${progress} Processing @${username}...`);

    const result = await analyzeAccount(username);
    results.push(result);

    if (result.success) {
      successCount++;
      if (result.cached) {
        cachedCount++;
        console.log(`✅ ${progress} @${username} - Score: ${result.overallScore} (cached)`);
      } else {
        console.log(`✅ ${progress} @${username} - Score: ${result.overallScore} (new)`);
      }
    } else {
      errorCount++;
      console.log(`❌ ${progress} @${username} - Error: ${result.error}`);
    }

    // Wait before next account (except for the last one)
    if (i < accounts.length - 1) {
      const delaySeconds = DELAY_BETWEEN_ACCOUNTS / 1000;
      console.log(`⏳ Waiting ${delaySeconds}s before next account...`);
      await delay(DELAY_BETWEEN_ACCOUNTS);
    }
  }

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📈 Import Summary`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successful: ${successCount} (${cachedCount} from cache)`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📊 Total: ${accounts.length}`);
  console.log(`${'='.repeat(60)}\n`);

  // Show top errors if any
  if (errorCount > 0) {
    console.log(`\n⚠️  Failed Accounts:`);
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - @${r.username}: ${r.error}`);
      });
  }

  // Show top scores
  const successfulResults = results
    .filter(r => r.success && r.overallScore !== undefined)
    .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));

  if (successfulResults.length > 0) {
    console.log(`\n🏆 Top 10 Highest Ego Scores:`);
    successfulResults.slice(0, 10).forEach((r, i) => {
      console.log(`  ${i + 1}. @${r.username} - Score: ${r.overallScore}`);
    });

    console.log(`\n😇 Top 10 Lowest Ego Scores (Most Humble):`);
    successfulResults.slice(-10).reverse().forEach((r, i) => {
      console.log(`  ${i + 1}. @${r.username} - Score: ${r.overallScore}`);
    });
  }

  console.log(`\n✨ Import complete! Visit ${BASE_URL}/leaderboard to see results.\n`);
}

// Main execution
async function main() {
  // Check if custom accounts were provided via command line
  const customAccounts = process.argv.slice(2);

  const accountsToImport = customAccounts.length > 0
    ? customAccounts
    : CURATED_ACCOUNTS;

  if (customAccounts.length > 0) {
    console.log(`📝 Using ${customAccounts.length} custom account(s) from command line`);
  } else {
    console.log(`📝 Using ${CURATED_ACCOUNTS.length} curated accounts`);
  }

  await bulkImport(accountsToImport);
}

main().catch(console.error);
