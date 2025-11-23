/**
 * Tweet Templates for Ego Index Bots
 * Provides templates for praise, data insights, and engagement
 */

export interface TweetTemplate {
  category: 'praise' | 'data' | 'roast' | 'engagement';
  text: string;
  variables?: string[];
}

// ============================================================================
// PRAISE TEMPLATES (for high-SER accounts)
// ============================================================================

export const PRAISE_TEMPLATES: TweetTemplate[] = [
  {
    category: 'praise',
    text: 'Rare W. Signal-to-Ego Ratio: {ser} 🟢 Top {percentile}%\n\nKeep cooking.\n\negoindex.app/{username}',
    variables: ['ser', 'percentile', 'username'],
  },
  {
    category: 'praise',
    text: 'Actually providing value, not just noise.\n\nSER: {ser} 💎\n\nMore accounts like this please.\n\negoindex.app/{username}',
    variables: ['ser', 'username'],
  },
  {
    category: 'praise',
    text: 'This is what good Twitter looks like.\n\n{value}% value, {ego}% ego.\n\nElite ratio.\n\negoindex.app/{username}',
    variables: ['value', 'ego', 'username'],
  },
  {
    category: 'praise',
    text: 'Finally, someone who ships instead of just talking about shipping.\n\nSER: {ser} 🏆\n\negoindex.app/{username}',
    variables: ['ser', 'username'],
  },
  {
    category: 'praise',
    text: 'Top {percentile}% for signal-to-noise ratio.\n\nZero platitudes. Just value.\n\nRespect.\n\negoindex.app/{username}',
    variables: ['percentile', 'username'],
  },
  {
    category: 'praise',
    text: 'Ego Index: {ego}/100\nValue Score: {value}/100\n\nRare account that actually helps people.\n\negoindex.app/{username}',
    variables: ['ego', 'value', 'username'],
  },
];

// ============================================================================
// DATA INSIGHT TEMPLATES (for main account)
// ============================================================================

export const DATA_TEMPLATES: TweetTemplate[] = [
  {
    category: 'data',
    text: 'We analyzed {count} accounts in {timeframe}.\n\nAverage Ego: {avgEgo}/100\nAverage Value: {avgValue}/100\n\n{insight}\n\negoindex.app',
    variables: ['count', 'timeframe', 'avgEgo', 'avgValue', 'insight'],
  },
  {
    category: 'data',
    text: '{industry} accounts:\n\nAvg SER: {avgSER}\nAvg Noise: {avgNoise}/100\n\n{commentary}\n\nFull breakdown: egoindex.app',
    variables: ['industry', 'avgSER', 'avgNoise', 'commentary'],
  },
  {
    category: 'data',
    text: 'Accounts with >100k followers have {multiplier}x more ego than sub-10k accounts.\n\nSize matters, but not how you think.\n\negoindex.app',
    variables: ['multiplier'],
  },
  {
    category: 'data',
    text: 'Pattern detected:\n\nAccounts that use "just shipped" 10+ times:\n- {egoIncrease}% higher ego\n- {valueDecrease}% lower value\n\nShow, don\'t tell.\n\negoindex.app',
    variables: ['egoIncrease', 'valueDecrease'],
  },
];

// ============================================================================
// ENGAGEMENT TEMPLATES (questions, polls, community)
// ============================================================================

export const ENGAGEMENT_TEMPLATES: TweetTemplate[] = [
  {
    category: 'engagement',
    text: 'Tag someone who needs to check their ego.\n\nWe\'ll analyze them for free 👀\n\negoindex.app',
    variables: [],
  },
  {
    category: 'engagement',
    text: 'What\'s worse:\n\nA) High ego, low value\nB) High value, but posts 50x/day\nC) Ghost mode (lurker)\n\nVote below 👇',
    variables: [],
  },
  {
    category: 'engagement',
    text: 'Most underrated metric on Twitter:\n\nSignal-to-Ego Ratio.\n\nHow much value you provide vs how much you talk about yourself.\n\nCheck yours: egoindex.app',
    variables: [],
  },
  {
    category: 'engagement',
    text: 'Reply with your @ and we\'ll give you your Signal-to-Ego Ratio.\n\nBe warned: the data doesn\'t lie 📊',
    variables: [],
  },
];

// ============================================================================
// ROAST TEMPLATES (use sparingly, only for opt-ins or mega accounts)
// ============================================================================

export const ROAST_TEMPLATES: TweetTemplate[] = [
  {
    category: 'roast',
    text: 'Ego Index: {ego}/100 🔥\n\n{roastLine}\n\nFull breakdown: egoindex.app/{username}',
    variables: ['ego', 'roastLine', 'username'],
  },
  {
    category: 'roast',
    text: 'This thread has:\n- {iCount} "I" statements\n- {platitudes} platitudes\n- {insights} actual insights\n\nDo better.\n\negoindex.app',
    variables: ['iCount', 'platitudes', 'insights'],
  },
  {
    category: 'roast',
    text: 'Noise Score: {noise}/100\n\nThat\'s a lot of words to say nothing.\n\negoindex.app/{username}',
    variables: ['noise', 'username'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fill template with variables
 */
export function fillTemplate(template: TweetTemplate, vars: Record<string, string | number>): string {
  let text = template.text;

  for (const [key, value] of Object.entries(vars)) {
    text = text.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }

  return text;
}

/**
 * Get random template from category
 */
export function getRandomTemplate(category: 'praise' | 'data' | 'engagement' | 'roast'): TweetTemplate {
  const templates = {
    praise: PRAISE_TEMPLATES,
    data: DATA_TEMPLATES,
    engagement: ENGAGEMENT_TEMPLATES,
    roast: ROAST_TEMPLATES,
  };

  const pool = templates[category];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Generate praise tweet for account
 */
export function generatePraiseTweet(
  username: string,
  ser: number,
  egoScore: number,
  valueScore: number
): string {
  const template = getRandomTemplate('praise');
  const percentile = ser >= 0.8 ? 5 : ser >= 0.6 ? 20 : 30;

  return fillTemplate(template, {
    username,
    ser: ser.toFixed(2),
    percentile: String(percentile),
    ego: String(egoScore),
    value: String(valueScore),
  });
}

/**
 * Generate custom roast lines based on scores
 */
export function generateRoastLine(egoScore: number, noiseScore: number): string {
  if (egoScore > 85 && noiseScore > 75) {
    return 'All ego, all noise, zero value. Impressive in the worst way.';
  } else if (egoScore > 80) {
    return 'Main character energy without the character development.';
  } else if (noiseScore > 80) {
    return 'Saying a lot without saying anything.';
  } else if (egoScore > 70 && noiseScore > 60) {
    return 'Twitter is not your diary.';
  } else {
    return 'Room for improvement.';
  }
}
