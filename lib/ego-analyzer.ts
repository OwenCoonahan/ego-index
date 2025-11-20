import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Tweet, TwitterProfile } from './twitter-scraper';

export interface EgoAnalysis {
  // Core scores (0-100)
  egoScore: number;
  valueScore: number;
  overallScore: number;

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
}

// Tiers based on Overall Score (higher score = higher ego = worse)
// Heat map progression: green → lime → yellow → orange → red
const TIERS = [
  { min: 0, max: 20, name: "Selfless Teacher", emoji: "🎓", description: "Pure value, zero ego", color: "green" },
  { min: 21, max: 40, name: "Value Contributor", emoji: "💎", description: "Lots of value, light on ego", color: "lime" },
  { min: 41, max: 60, name: "Balanced Creator", emoji: "⚖️", description: "Good mix of personality and value", color: "yellow" },
  { min: 61, max: 80, name: "Self-Promoter", emoji: "📢", description: "Heavy self-focus with some value", color: "orange" },
  { min: 81, max: 100, name: "Ego Maximalist", emoji: "🔥", description: "All ego, minimal value", color: "red" },
];

function getTier(score: number): { name: string; emoji: string } {
  const tier = TIERS.find(t => score >= t.min && score <= t.max);
  return tier ? { name: tier.name, emoji: tier.emoji } : TIERS[2];
}

const ANALYSIS_PROMPT = `You are an expert at analyzing social media content for ego and value signals.

Your task is to analyze a Twitter/X profile and their recent tweets to determine their "Ego Index" - a measure of ego-to-value ratio.

**Ego Signals (what to look for):**
- Excessive use of "I", "me", "my"
- Humble brags ("just casually closed a 7-figure deal")
- Talking about achievements without context or value
- Name dropping and status signaling
- Posting about being busy/important
- Screenshots of compliments/DMs
- Constant self-promotion without substance
- Reply-guy behavior with famous people
- Posting photos at fancy places/events just to flex

**Value Signals (what to look for):**
- Sharing actionable advice, tips, tutorials
- Helping others solve problems
- Asking questions and engaging meaningfully
- Sharing knowledge without expecting praise
- Promoting others' work
- Thoughtful commentary on topics
- Educational threads/content
- Vulnerable/authentic sharing that helps others

**Scoring Guidelines:**
- Ego Score (0-100): How self-centered is the content? 0 = selfless, 100 = pure narcissism
- Value Score (0-100): How much actionable value do they provide? 0 = none, 100 = extremely valuable
- Overall Score (0-100): The EGO INDEX - measures how egotistical they are. HIGH score = high ego + low value (bad). LOW score = low ego + high value (good). Calculate as: (egoScore + (100 - valueScore)) / 2

**Industry Classification:**
Look at their bio and tweets to classify them into one of these industries:
- Tech/Startup Founder
- Software Developer
- Designer
- Marketing/Growth
- Creator/Influencer
- Investor/VC
- Writer/Journalist
- Consultant
- Other

Analyze the profile and tweets provided, then return your analysis in the following JSON format:

{
  "egoScore": <number 0-100>,
  "valueScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "mainCharacterScore": <number 0-100>,
  "humbleBragScore": <number 0-100>,
  "selfPromotionScore": <number 0-100>,
  "industry": "<industry string>",
  "summary": "<2-3 sentence summary of their social media presence>",
  "mostEgotisticalTweetId": "<tweet id>",
  "mostEgotisticalTweetExplanation": "<why this tweet is egotistical>",
  "leastEgotisticalTweetId": "<tweet id>",
  "leastEgotisticalTweetExplanation": "<why this tweet provides value>"
}

Be honest, direct, and a bit cheeky in your analysis. This is meant to be fun but insightful.`;

/**
 * Analyze ego using OpenAI GPT-4o-mini or Gemini
 */
/**
 * Generate mock analysis for testing
 */
function getMockAnalysis(profile: TwitterProfile, tweets: Tweet[]): EgoAnalysis {
  const egoScore = 65;
  const valueScore = 55;
  // Overall score = (ego + (100 - value)) / 2 → higher ego + lower value = higher score
  const overallScore = Math.round((egoScore + (100 - valueScore)) / 2);
  const tier = getTier(overallScore);

  return {
    egoScore,
    valueScore,
    overallScore,
    mainCharacterScore: 70,
    humbleBragScore: 60,
    selfPromotionScore: 65,
    industry: "Tech/Startup Founder",
    tier: tier.name,
    tierEmoji: tier.emoji,
    summary: `${profile.display_name} shows a balanced mix of self-promotion and value-sharing. They're not afraid to celebrate their wins (sometimes a bit too enthusiastically), but also contribute helpful insights to their community. Classic founder energy.`,
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

    const tier = getTier(result.overallScore);

    return {
      egoScore: result.egoScore,
      valueScore: result.valueScore,
      overallScore: result.overallScore,
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
    };
  } catch (error) {
    console.error('Error analyzing ego:', error);
    throw new Error('Failed to analyze ego. Please try again.');
  }
}
