import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Tweet, TwitterProfile } from './twitter-scraper';

export interface EgoAnalysis {
  // Core scores (0-100)
  egoScore: number;
  valueScore: number;
  overallScore: number; // Legacy - for backward compatibility

  // Multi-dimensional scores (NEW)
  noiseScore: number; // Platitudes, engagement farming, low-value content
  engagementQualityScore: number; // Quality of interactions
  authenticityScore: number; // Consistency, genuine expertise

  // Composite metric (0.00-1.00)
  signalToEgoRatio: number; // SER = Value / (Ego + Noise + 1)

  // Detailed metrics
  mainCharacterScore: number;
  humbleBragScore: number;
  selfPromotionScore: number;

  // Classification
  industry: string;
  tier: string;
  tierEmoji: string;

  // Insights
  summary: string;

  // Tweet highlights
  mostEgotisticalTweet: {
    id: string;
    text: string;
    score: number;
  } | null;

  leastEgotisticalTweet: {
    id: string;
    text: string;
    score: number;
  } | null;

  mostValuableTweet: {
    id: string;
    text: string;
    score: number;
  } | null;
}

// Tiers based on Signal-to-Ego Ratio (SER)
// Higher SER = better (more value, less ego/noise)
const SER_TIERS = [
  { min: 0.80, max: 1.00, name: "Elite Value Provider", emoji: "🏆", description: "Top 5% - Pure signal, minimal noise", color: "green" },
  { min: 0.60, max: 0.79, name: "High Value Contributor", emoji: "💎", description: "Top 20% - Strong signal-to-noise ratio", color: "lime" },
  { min: 0.40, max: 0.59, name: "Balanced Creator", emoji: "⚖️", description: "Good mix of value and personality", color: "yellow" },
  { min: 0.20, max: 0.39, name: "Low Signal Account", emoji: "📢", description: "More noise than value", color: "orange" },
  { min: 0.00, max: 0.19, name: "Noise Account", emoji: "🔥", description: "Minimal value, high ego/noise", color: "red" },
];

function getTierFromSER(ser: number): { name: string; emoji: string } {
  const tier = SER_TIERS.find(t => ser >= t.min && ser <= t.max);
  return tier ? { name: tier.name, emoji: tier.emoji } : SER_TIERS[2];
}

// Legacy tier function for backward compatibility
function getTier(score: number): { name: string; emoji: string } {
  // Map old overall score (0-100, higher is worse) to approximate SER
  const approximateSER = (100 - score) / 100;
  return getTierFromSER(approximateSER);
}

const ANALYSIS_PROMPT = `You are an expert at analyzing social media content for ego, value, and noise signals.

Your task is to analyze a Twitter/X profile and their recent tweets across MULTIPLE DIMENSIONS to determine their content quality.

**DIMENSION 1: Ego Score (0-100)**
How self-centered is the content?
- Excessive use of "I", "me", "my"
- Humble brags ("just casually closed a 7-figure deal")
- Talking about achievements without context or value
- Name dropping and status signaling
- Posting about being busy/important
- Screenshots of compliments/DMs
- Constant self-promotion without substance
- Reply-guy behavior with famous people
- Flexing (photos at fancy places/events just to show off)
Score: 0 = selfless, 100 = pure narcissism

**DIMENSION 2: Value Score (0-100)**
How much actionable value do they provide?
- Sharing actionable advice, tips, tutorials
- Helping others solve specific problems
- Sharing genuine expertise and insights
- Teaching/educating their audience
- Promoting others' work
- Thoughtful commentary that adds new perspectives
- Vulnerable/authentic sharing that helps others
- Original ideas and frameworks
Score: 0 = zero value, 100 = extremely valuable

**DIMENSION 3: Noise Score (0-100) - NEW**
How much low-value, generic content?
- Platitudes ("Just shipped!", "LFG!", "GM", "WAGMI")
- Obvious takes everyone agrees with ("Hard work pays off")
- Engagement farming ("Tag someone who needs to hear this")
- Generic motivational quotes
- Rage bait without substance
- Talking ABOUT shipping instead of actually sharing what was shipped
- Performative posting (pretending to care about trending topics)
- Recycling common takes without adding value
Score: 0 = zero noise, 100 = pure noise

**DIMENSION 4: Engagement Quality Score (0-100) - NEW**
Quality of their interactions
- Meaningful replies that add to conversations (HIGH)
- Thoughtful questions that spark discussion (HIGH)
- Building on others' ideas constructively (HIGH)
- Genuine dialogue and back-and-forth (HIGH)
VS
- Drive-by quote tweets for dunks (LOW)
- Performative replies to famous people (LOW)
- Generic "great post!" comments (LOW)
- One-word replies or emoji spam (LOW)
Score: 0 = low quality engagement, 100 = exceptional engagement quality

**DIMENSION 5: Authenticity Score (0-100) - NEW**
How genuine and consistent are they?
- Expertise matches their content (consistent topic focus)
- Walking the talk (shipping, not just talking about shipping)
- Genuine expertise shown through depth
- Consistent voice and values
- Not jumping on every trend
- Admitting mistakes and showing growth
VS
- Surface-level commentary on everything
- Constant topic-hopping to chase engagement
- Claiming expertise without demonstrating it
- Contradicting themselves frequently
Score: 0 = performative/inconsistent, 100 = highly authentic

**Additional Metrics:**
- Main Character Score (0-100): Do they act like everything revolves around them?
- Humble Brag Score (0-100): How often do they humble brag?
- Self Promotion Score (0-100): How much do they promote themselves?

**Industry Classification:**
Look at their bio and tweets to classify them:
- Tech/Startup Founder
- Software Developer
- Designer
- Marketing/Growth
- Creator/Influencer
- Investor/VC
- Writer/Journalist
- Consultant
- Other

**Tweet Highlights:**
Identify:
1. Most egotistical tweet (highest ego signals)
2. Least egotistical tweet (lowest ego, or most value)
3. Most valuable tweet (highest value score, most helpful)

Return your analysis in this JSON format:

{
  "egoScore": <number 0-100>,
  "valueScore": <number 0-100>,
  "noiseScore": <number 0-100>,
  "engagementQualityScore": <number 0-100>,
  "authenticityScore": <number 0-100>,
  "overallScore": <number 0-100, calculated as (egoScore + (100 - valueScore)) / 2>,
  "mainCharacterScore": <number 0-100>,
  "humbleBragScore": <number 0-100>,
  "selfPromotionScore": <number 0-100>,
  "industry": "<industry string>",
  "summary": "<2-3 sentence summary of their social media presence, mention their SER tier>",
  "mostEgotisticalTweetId": "<tweet index>",
  "mostEgotisticalTweetExplanation": "<why this tweet is egotistical>",
  "leastEgotisticalTweetId": "<tweet index>",
  "leastEgotisticalTweetExplanation": "<why this tweet is valuable or low-ego>",
  "mostValuableTweetId": "<tweet index>",
  "mostValuableTweetExplanation": "<why this tweet provides the most value>"
}

Be honest, direct, and a bit cheeky in your analysis. This is meant to be fun but insightful.`;

/**
 * Calculate Signal-to-Ego Ratio (SER)
 * Formula: Value / (Ego + Noise + 1)
 * Range: 0.00 to 1.00 (normalized)
 */
function calculateSER(valueScore: number, egoScore: number, noiseScore: number): number {
  const denominator = egoScore + noiseScore + 1;
  const rawSER = valueScore / denominator;
  // Normalize to 0-1 range (cap at 1.0)
  return Math.min(Math.round(rawSER * 100) / 100, 1.0);
}

/**
 * Generate mock analysis for testing
 */
function getMockAnalysis(profile: TwitterProfile, tweets: Tweet[]): EgoAnalysis {
  const egoScore = 45;
  const valueScore = 65;
  const noiseScore = 35;
  const engagementQualityScore = 60;
  const authenticityScore = 70;

  // Overall score = (ego + (100 - value)) / 2 → higher ego + lower value = higher score
  const overallScore = Math.round((egoScore + (100 - valueScore)) / 2);

  // Calculate SER
  const signalToEgoRatio = calculateSER(valueScore, egoScore, noiseScore);
  const tier = getTierFromSER(signalToEgoRatio);

  return {
    egoScore,
    valueScore,
    overallScore,
    noiseScore,
    engagementQualityScore,
    authenticityScore,
    signalToEgoRatio,
    mainCharacterScore: 50,
    humbleBragScore: 40,
    selfPromotionScore: 45,
    industry: "Tech/Startup Founder",
    tier: tier.name,
    tierEmoji: tier.emoji,
    summary: `${profile.display_name} shows a good balance of self-promotion and value-sharing. With a Signal-to-Ego Ratio of ${signalToEgoRatio.toFixed(2)}, they're a ${tier.name}. They contribute helpful insights while maintaining personality.`,
    mostEgotisticalTweet: tweets[0] ? {
      id: tweets[0].id,
      text: tweets[0].text,
      score: 85
    } : null,
    leastEgotisticalTweet: tweets[1] ? {
      id: tweets[1].id,
      text: tweets[1].text,
      score: 25
    } : null,
    mostValuableTweet: tweets[2] ? {
      id: tweets[2].id,
      text: tweets[2].text,
      score: 90
    } : null,
  };
}

export async function analyzeEgo(
  profile: TwitterProfile,
  tweets: Tweet[]
): Promise<EgoAnalysis> {
  try {
    // Use mock analysis if enabled
    if (process.env.USE_MOCK_DATA === 'true') {
      console.log('🎭 Using mock analysis for testing');
      return getMockAnalysis(profile, tweets);
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('No AI API key configured');
    }

    // Prepare data for analysis
    const tweetTexts = tweets.map((t, idx) =>
      `[${idx}] ${t.text} (❤️${t.like_count} 🔁${t.retweet_count})`
    ).join('\n\n');

    const profileData = `
USERNAME: @${profile.username}
NAME: ${profile.display_name}
BIO: ${profile.bio}
FOLLOWERS: ${profile.followers_count}
FOLLOWING: ${profile.following_count}

RECENT TWEETS (${tweets.length}):
${tweetTexts}
    `;

    // Use Gemini if available, otherwise OpenAI
    let result;

    if (process.env.GEMINI_API_KEY) {
      // Use Google Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
        }
      });

      const prompt = `${ANALYSIS_PROMPT}\n\n${profileData}\n\nIMPORTANT: Return ONLY valid JSON, no additional text or markdown.`;
      const completion = await model.generateContent(prompt);
      const response = completion.response;
      const text = response.text();

      // Extract JSON from response (sometimes Gemini wraps it in markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }
      result = JSON.parse(jsonMatch[0]);
    } else {
      // Use OpenAI
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: profileData }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      result = JSON.parse(completion.choices[0].message.content || '{}');
    }

    // Find the actual tweets referenced
    const mostEgo = tweets[parseInt(result.mostEgotisticalTweetId)] || null;
    const leastEgo = tweets[parseInt(result.leastEgotisticalTweetId)] || null;
    const mostValuable = tweets[parseInt(result.mostValuableTweetId)] || null;

    // Calculate Signal-to-Ego Ratio
    const signalToEgoRatio = calculateSER(
      result.valueScore,
      result.egoScore,
      result.noiseScore
    );

    // Get tier based on SER
    const tier = getTierFromSER(signalToEgoRatio);

    return {
      egoScore: result.egoScore,
      valueScore: result.valueScore,
      overallScore: result.overallScore,
      noiseScore: result.noiseScore,
      engagementQualityScore: result.engagementQualityScore,
      authenticityScore: result.authenticityScore,
      signalToEgoRatio,
      mainCharacterScore: result.mainCharacterScore,
      humbleBragScore: result.humbleBragScore,
      selfPromotionScore: result.selfPromotionScore,
      industry: result.industry,
      tier: tier.name,
      tierEmoji: tier.emoji,
      summary: result.summary,
      mostEgotisticalTweet: mostEgo ? {
        id: mostEgo.id,
        text: mostEgo.text,
        score: result.egoScore
      } : null,
      leastEgotisticalTweet: leastEgo ? {
        id: leastEgo.id,
        text: leastEgo.text,
        score: 100 - result.egoScore
      } : null,
      mostValuableTweet: mostValuable ? {
        id: mostValuable.id,
        text: mostValuable.text,
        score: result.valueScore
      } : null,
    };
  } catch (error) {
    console.error('Error analyzing ego:', error);
    throw new Error('Failed to analyze ego. Please try again.');
  }
}
