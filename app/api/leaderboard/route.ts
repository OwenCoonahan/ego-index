/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'lowest'; // 'lowest', 'highest', 'all'
    const industry = searchParams.get('industry') || 'all';
    const limit = parseInt(searchParams.get('limit') || '100');
    // username parameter available for future percentile calculations
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const username = searchParams.get('username');

    // Get total count for percentile calculations
    const { count: totalCount } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true });

    let query = supabase
      .from('analyses')
      .select(`
        overall_score,
        ego_score,
        value_score,
        main_character_score,
        humble_brag_score,
        self_promotion_score,
        tier,
        tier_emoji,
        industry,
        created_at,
        profiles (
          username,
          display_name,
          profile_image_url
        )
      `)
      .limit(limit);

    // Apply industry filter with fuzzy matching for grouped categories
    if (industry !== 'all') {
      // Map UI categories to database patterns
      const industryPatterns: Record<string, string[]> = {
        'Tech/Startup Founder': ['tech', 'startup', 'founder'],
        'Indie Hackers': ['indie', 'maker', 'solo', 'bootstrapped'],
        'Developer/Engineer': ['developer', 'engineer', 'software'],
        'AI/ML Researchers': ['ai', 'ml', 'research', 'academic', 'scientist'],
        'Investor/VC': ['investor', 'vc'],
        'Creator/Influencer': ['creator', 'influencer', 'content'],
        'Journalists/Writers': ['journalist', 'writer', 'author'],
        'Designers': ['design', 'visual'],
        'Crypto/Web3': ['crypto', 'nft', 'web3'],
      };

      const patterns = industryPatterns[industry];
      if (patterns) {
        // Use OR logic to match any of the patterns
        const orConditions = patterns.map(pattern =>
          `industry.ilike.%${pattern}%`
        ).join(',');
        query = query.or(orConditions);
      } else {
        // Exact match for other categories
        query = query.eq('industry', industry);
      }
    }

    // Apply sorting based on filter
    if (filter === 'lowest') {
      query = query.order('overall_score', { ascending: true });
    } else if (filter === 'highest') {
      query = query.order('overall_score', { ascending: false });
    } else {
      query = query.order('overall_score', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Leaderboard query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Get all scores for percentile calculation (lower score = better)
    const { data: allScores } = await supabase
      .from('analyses')
      .select('overall_score')
      .order('overall_score', { ascending: true });

    const scores = allScores?.map((s: any) => s.overall_score) || [];

    // Calculate percentile for a given score (lower score = higher percentile)
    const calculatePercentile = (score: number) => {
      if (scores.length === 0) return 50;
      const betterThan = scores.filter(s => s < score).length;
      return Math.round((betterThan / scores.length) * 100);
    };

    // Transform the data
    const leaderboard = data.map((entry: any, index: number) => ({
      username: entry.profiles?.username,
      displayName: entry.profiles?.display_name,
      profileImageUrl: entry.profiles?.profile_image_url,
      overallScore: entry.overall_score,
      egoScore: entry.ego_score,
      valueScore: entry.value_score,
      mainCharacterScore: entry.main_character_score,
      humbleBragScore: entry.humble_brag_score,
      selfPromotionScore: entry.self_promotion_score,
      tier: entry.tier,
      tierEmoji: entry.tier_emoji,
      industry: entry.industry,
      percentile: calculatePercentile(entry.overall_score),
      rank: index + 1,
    }));

    return NextResponse.json({
      leaderboard,
      totalProfiles: totalCount || 0,
      stats: {
        avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        lowestScore: scores.length > 0 ? scores[0] : 0,
        highestScore: scores.length > 0 ? scores[scores.length - 1] : 0,
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
