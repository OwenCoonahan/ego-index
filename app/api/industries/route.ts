import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get all unique industries from the database
    const { data, error } = await supabase
      .from('analyses')
      .select('industry')
      .not('industry', 'is', null);

    if (error) {
      console.error('Industries query error:', error);
      return NextResponse.json({ error: 'Failed to fetch industries' }, { status: 500 });
    }

    // Extract unique industries and count occurrences
    const industryMap: Record<string, number> = {};
    data.forEach((entry: { industry: string }) => {
      const industry = entry.industry;
      industryMap[industry] = (industryMap[industry] || 0) + 1;
    });

    // Convert to array and sort by count
    const industries = Object.entries(industryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Group similar industries
    const grouped = {
      'Tech/Startup Founder': industries.filter(i =>
        i.name.toLowerCase().includes('tech') ||
        i.name.toLowerCase().includes('startup') ||
        i.name.toLowerCase().includes('founder')
      ),
      'Indie Hackers': industries.filter(i =>
        i.name.toLowerCase().includes('indie') ||
        i.name.toLowerCase().includes('maker') ||
        i.name.toLowerCase().includes('solo') ||
        i.name.toLowerCase().includes('bootstrapped')
      ),
      'Developer/Engineer': industries.filter(i =>
        i.name.toLowerCase().includes('developer') ||
        i.name.toLowerCase().includes('engineer') ||
        i.name.toLowerCase().includes('software')
      ),
      'AI/ML Researchers': industries.filter(i =>
        i.name.toLowerCase().includes('ai') ||
        i.name.toLowerCase().includes('ml') ||
        i.name.toLowerCase().includes('research') ||
        i.name.toLowerCase().includes('academic') ||
        i.name.toLowerCase().includes('scientist')
      ),
      'Investor/VC': industries.filter(i =>
        i.name.toLowerCase().includes('investor') ||
        i.name.toLowerCase().includes('vc')
      ),
      'Creator/Influencer': industries.filter(i =>
        i.name.toLowerCase().includes('creator') ||
        i.name.toLowerCase().includes('influencer') ||
        i.name.toLowerCase().includes('content')
      ),
      'Journalists/Writers': industries.filter(i =>
        i.name.toLowerCase().includes('journalist') ||
        i.name.toLowerCase().includes('writer') ||
        i.name.toLowerCase().includes('author')
      ),
      'Designers': industries.filter(i =>
        i.name.toLowerCase().includes('design') ||
        i.name.toLowerCase().includes('visual')
      ),
      'Crypto/Web3': industries.filter(i =>
        i.name.toLowerCase().includes('crypto') ||
        i.name.toLowerCase().includes('nft') ||
        i.name.toLowerCase().includes('web3')
      ),
    };

    // Calculate totals for each group
    const groupedWithTotals = Object.entries(grouped).map(([category, items]) => ({
      category,
      count: items.reduce((sum, item) => sum + item.count, 0),
      industries: items.map(i => i.name),
    })).filter(g => g.count > 0);

    return NextResponse.json({
      grouped: groupedWithTotals,
      all: industries,
    });
  } catch (error) {
    console.error('Industries error:', error);
    return NextResponse.json({ error: 'Failed to fetch industries' }, { status: 500 });
  }
}
