/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { scrapeTwitter, filterOriginalTweets } from '@/lib/twitter-scraper';
import { analyzeEgo } from '@/lib/ego-analyzer';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Clean username - lowercase for database consistency
    const cleanUsername = username.replace('@', '').trim().toLowerCase();

    // Check if we have a recent analysis (within last 24 hours)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        analyses (*)
      `)
      .eq('username', cleanUsername)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileWithAnalyses = existingProfile as any;
    if (profileWithAnalyses && profileWithAnalyses.analyses?.[0]) {
      const lastAnalysis = profileWithAnalyses.analyses[0];
      const analysisAge = Date.now() - new Date(lastAnalysis.created_at).getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      // If analysis is less than 24 hours old, return cached result
      if (analysisAge < oneDayInMs) {
        return NextResponse.json({
          profile: {
            username: profileWithAnalyses.username,
            displayName: profileWithAnalyses.display_name,
            profileImageUrl: profileWithAnalyses.profile_image_url,
            bio: profileWithAnalyses.bio,
            followersCount: profileWithAnalyses.followers_count,
          },
          analysis: {
            overallScore: lastAnalysis.overall_score,
            egoScore: lastAnalysis.ego_score,
            valueScore: lastAnalysis.value_score,
            noiseScore: lastAnalysis.noise_score,
            engagementQualityScore: lastAnalysis.engagement_quality_score,
            authenticityScore: lastAnalysis.authenticity_score,
            signalToEgoRatio: lastAnalysis.signal_to_ego_ratio,
            mainCharacterScore: lastAnalysis.main_character_score,
            humbleBragScore: lastAnalysis.humble_brag_score,
            selfPromotionScore: lastAnalysis.self_promotion_score,
            tier: lastAnalysis.tier,
            tierEmoji: lastAnalysis.tier_emoji,
            industry: lastAnalysis.industry,
            summary: lastAnalysis.summary,
            mostEgotisticalTweet: lastAnalysis.most_egotistical_tweet_text ? {
              text: lastAnalysis.most_egotistical_tweet_text,
              score: lastAnalysis.most_egotistical_tweet_score,
            } : null,
            leastEgotisticalTweet: lastAnalysis.least_egotistical_tweet_text ? {
              text: lastAnalysis.least_egotistical_tweet_text,
              score: lastAnalysis.least_egotistical_tweet_score,
            } : null,
          },
          cached: true,
        });
      }
    }

    // Scrape Twitter data
    let twitterData;
    try {
      twitterData = await scrapeTwitter(cleanUsername, 100);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch Twitter data. The account may be private or does not exist.',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 404 }
      );
    }

    // Filter to only original tweets (no retweets/replies)
    const originalTweets = filterOriginalTweets(twitterData.tweets);

    if (originalTweets.length === 0) {
      return NextResponse.json(
        { error: 'No original tweets found to analyze' },
        { status: 400 }
      );
    }

    // Analyze ego
    const analysis = await analyzeEgo(twitterData.profile, originalTweets);

    // Save to database
    // First, upsert the profile (use cleanUsername for consistency)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert({
        username: cleanUsername,
        display_name: twitterData.profile.display_name,
        bio: twitterData.profile.bio,
        profile_image_url: twitterData.profile.profile_image_url,
        followers_count: twitterData.profile.followers_count,
        following_count: twitterData.profile.following_count,
        tweet_count: twitterData.profile.tweet_count,
      } as any)
      .select()
      .single();

    if (profileError) {
      console.error('Error saving profile:', profileError);
      // Continue anyway - we'll still return the analysis even if DB save fails
    }

    // Then save the analysis
    if (profile) {
      const { error: analysisError } = await supabaseAdmin
        .from('analyses')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({
          profile_id: (profile as any).id,
          ego_score: analysis.egoScore,
          value_score: analysis.valueScore,
          overall_score: analysis.overallScore,
          noise_score: analysis.noiseScore,
          engagement_quality_score: analysis.engagementQualityScore,
          authenticity_score: analysis.authenticityScore,
          signal_to_ego_ratio: analysis.signalToEgoRatio,
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
          tweets_analyzed: originalTweets.length,
        } as any);

      if (analysisError) {
        console.error('Error saving analysis:', analysisError);
        // Log detailed error info for debugging
        console.error('Analysis data that failed to save:', {
          username: twitterData.profile.username,
          profile_id: (profile as any).id,
          overall_score: analysis.overallScore,
        });
      }
    } else {
      console.error('Profile save failed, cannot save analysis for:', twitterData.profile.username);
    }

    // Return the result
    return NextResponse.json({
      profile: {
        username: cleanUsername,
        displayName: twitterData.profile.display_name,
        profileImageUrl: twitterData.profile.profile_image_url,
        bio: twitterData.profile.bio,
        followersCount: twitterData.profile.followers_count,
      },
      analysis: {
        overallScore: analysis.overallScore,
        egoScore: analysis.egoScore,
        valueScore: analysis.valueScore,
        noiseScore: analysis.noiseScore,
        engagementQualityScore: analysis.engagementQualityScore,
        authenticityScore: analysis.authenticityScore,
        signalToEgoRatio: analysis.signalToEgoRatio,
        mainCharacterScore: analysis.mainCharacterScore,
        humbleBragScore: analysis.humbleBragScore,
        selfPromotionScore: analysis.selfPromotionScore,
        tier: analysis.tier,
        tierEmoji: analysis.tierEmoji,
        industry: analysis.industry,
        summary: analysis.summary,
        mostEgotisticalTweet: analysis.mostEgotisticalTweet,
        leastEgotisticalTweet: analysis.leastEgotisticalTweet,
        mostValuableTweet: analysis.mostValuableTweet,
      },
      cached: false,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
