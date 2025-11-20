/**
 * Test the RapidAPI Twitter scraper
 */
require('dotenv').config({ path: '.env.local' });

async function testScraper() {
  // Dynamically import the ES module
  const { scrapeTwitterRapidAPI } = await import('./lib/twitter-scraper-rapidapi.ts');

  const username = 'elonmusk';
  const config = {
    apiKey: process.env.RAPIDAPI_KEY,
    apiHost: process.env.RAPIDAPI_HOST,
  };

  console.log('🚀 Testing RapidAPI scraper with:', username);
  console.log('API Host:', config.apiHost);
  console.log('');

  try {
    const data = await scrapeTwitterRapidAPI(username, 10, config);

    console.log('\n✅ SUCCESS! Scraped Twitter data:');
    console.log('\n📊 Profile:');
    console.log('  Username:', data.profile.username);
    console.log('  Display Name:', data.profile.display_name);
    console.log('  Bio:', data.profile.bio.substring(0, 100) + '...');
    console.log('  Followers:', data.profile.followers_count.toLocaleString());
    console.log('  Following:', data.profile.following_count.toLocaleString());
    console.log('  Total Tweets:', data.profile.tweet_count.toLocaleString());
    console.log('  Profile Image:', data.profile.profile_image_url);

    console.log('\n📝 Tweets:');
    console.log(`  Retrieved ${data.tweets.length} tweets`);

    if (data.tweets.length > 0) {
      console.log('\n  Sample tweet:');
      console.log('  ID:', data.tweets[0].id);
      console.log('  Text:', data.tweets[0].text.substring(0, 100) + '...');
      console.log('  Likes:', data.tweets[0].like_count);
      console.log('  Retweets:', data.tweets[0].retweet_count);
      console.log('  Created:', data.tweets[0].created_at);
    }

    console.log('\n✅ RapidAPI scraper is working perfectly!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testScraper();
