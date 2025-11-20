// Quick test script to verify the Nitter scraper works
// Run with: node test-scraper.js

const axios = require('axios');
const cheerio = require('cheerio');

// Updated from https://status.d420.de/ on 2025-11-14
const NITTER_INSTANCES = [
  // Currently live instances
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
];

async function testNitterScraper(username = 'elonmusk') {
  console.log(`\n🔍 Testing Nitter scraper for @${username}...\n`);

  for (const instance of NITTER_INSTANCES) {
    try {
      console.log(`Trying ${instance}...`);

      const url = `${instance}/${username}`;
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);

      // Check if profile exists
      if ($('.error-panel').length > 0) {
        console.log(`❌ Profile not found on ${instance}\n`);
        continue;
      }

      // Get profile info
      const displayName = $('.profile-card-fullname').text().trim();
      const bio = $('.profile-bio').text().trim();
      const statsText = $('.profile-stat-num').map((_, el) => $(el).text().trim()).get();

      // Get tweets
      const tweetCount = $('.timeline-item').length;

      console.log(`✅ SUCCESS on ${instance}!`);
      console.log(`\nProfile Info:`);
      console.log(`- Display Name: ${displayName}`);
      console.log(`- Bio: ${bio.substring(0, 100)}...`);
      console.log(`- Stats: ${statsText.join(' | ')}`);
      console.log(`- Tweets found: ${tweetCount}`);

      // Show first tweet
      const firstTweet = $('.timeline-item').first().find('.tweet-content').text().trim();
      console.log(`\nFirst Tweet:`);
      console.log(`"${firstTweet.substring(0, 200)}..."`);

      console.log(`\n✅ Nitter scraper is working! You're good to go.\n`);
      return true;

    } catch (error) {
      console.log(`❌ Failed on ${instance}: ${error.message}\n`);
    }
  }

  console.log('⚠️  All instances failed. Nitter might be down or blocked.');
  console.log('Try again later or use a different scraping method.\n');
  return false;
}

// Run the test
const username = process.argv[2] || 'elonmusk';
testNitterScraper(username);
