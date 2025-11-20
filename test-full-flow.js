/**
 * Test the complete end-to-end flow:
 * 1. Scrape Twitter data via RapidAPI
 * 2. Analyze with Gemini AI
 * 3. Store in Supabase
 * 4. Retrieve results
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testFullFlow() {
  const username = 'naval'; // Using Naval Ravikant as a good test subject

  console.log('🚀 Testing full end-to-end flow for @' + username);
  console.log('━'.repeat(60));

  try {
    // Step 1: Scrape Twitter data
    console.log('\n📊 Step 1: Scraping Twitter data via RapidAPI...');
    const { scrapeTwitterRapidAPI } = await import('./lib/twitter-scraper-rapidapi.ts');

    const twitterData = await scrapeTwitterRapidAPI(username, 50, {
      apiKey: process.env.RAPIDAPI_KEY,
      apiHost: process.env.RAPIDAPI_HOST,
    });

    console.log(`✅ Scraped profile: @${twitterData.profile.username}`);
    console.log(`   Display Name: ${twitterData.profile.display_name}`);
    console.log(`   Followers: ${twitterData.profile.followers_count.toLocaleString()}`);
    console.log(`   Tweets retrieved: ${twitterData.tweets.length}`);

    // Step 2: Analyze with Gemini AI
    console.log('\n🤖 Step 2: Analyzing with Gemini AI...');
    const { analyzeEgo } = await import('./lib/ego-analyzer.ts');

    const analysis = await analyzeEgo(twitterData.profile, twitterData.tweets);

    console.log(`✅ Analysis complete!`);
    console.log(`   Overall Score: ${analysis.overallScore}/100`);
    console.log(`   Ego Score: ${analysis.egoScore}/100`);
    console.log(`   Value Score: ${analysis.valueScore}/100`);
    console.log(`   Tier: ${analysis.tierEmoji} ${analysis.tier}`);
    console.log(`   Industry: ${analysis.industry}`);
    console.log(`   Summary: ${analysis.summary.substring(0, 100)}...`);

    // Step 3: Store in Supabase
    console.log('\n💾 Step 3: Storing in Supabase...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Store profile (upsert to update if exists)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        username: twitterData.profile.username,
        display_name: twitterData.profile.display_name,
        bio: twitterData.profile.bio,
        profile_image_url: twitterData.profile.profile_image_url,
        followers_count: twitterData.profile.followers_count,
        following_count: twitterData.profile.following_count,
        tweet_count: twitterData.profile.tweet_count,
      })
      .select()
      .single();

    if (profileError) throw profileError;
    console.log(`✅ Profile stored: ${profileData.username} (ID: ${profileData.id})`);

    // Store analysis (linked to profile via profile_id)
    const { data: analysisData, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        profile_id: profileData.id,
        ego_score: analysis.egoScore,
        value_score: analysis.valueScore,
        overall_score: analysis.overallScore,
        main_character_score: analysis.mainCharacterScore,
        humble_brag_score: analysis.humbleBragScore,
        self_promotion_score: analysis.selfPromotionScore,
        industry: analysis.industry,
        tier: analysis.tier,
        tier_emoji: analysis.tierEmoji,
        summary: analysis.summary,
        most_egotistical_tweet_id: analysis.mostEgotisticalTweet?.id,
        most_egotistical_tweet_text: analysis.mostEgotisticalTweet?.text,
        most_egotistical_tweet_score: analysis.mostEgotisticalTweet?.score,
        least_egotistical_tweet_id: analysis.leastEgotisticalTweet?.id,
        least_egotistical_tweet_text: analysis.leastEgotisticalTweet?.text,
        least_egotistical_tweet_score: analysis.leastEgotisticalTweet?.score,
        tweets_analyzed: twitterData.tweets.length,
      })
      .select()
      .single();

    if (analysisError) throw analysisError;
    console.log(`✅ Analysis stored: ID ${analysisData.id}`);

    // Step 4: Retrieve and verify
    console.log('\n🔍 Step 4: Retrieving stored data...');
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('profiles')
      .select(`
        *,
        analyses (*)
      `)
      .eq('username', username)
      .single();

    if (retrieveError) throw retrieveError;

    console.log(`✅ Retrieved profile: @${retrievedData.username}`);
    console.log(`   Analyses count: ${retrievedData.analyses.length}`);
    console.log(`   Latest analysis score: ${retrievedData.analyses[0].overall_score}/100`);

    console.log('\n━'.repeat(60));
    console.log('✅ FULL FLOW TEST PASSED!');
    console.log('━'.repeat(60));
    console.log('\n🎉 All systems operational:');
    console.log('   ✅ RapidAPI scraping');
    console.log('   ✅ Gemini AI analysis');
    console.log('   ✅ Supabase storage');
    console.log('   ✅ Data retrieval');
    console.log('\n👉 Ready to test on web app at http://localhost:3000');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testFullFlow();
