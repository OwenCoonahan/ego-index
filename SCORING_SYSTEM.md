# Ego Index Scoring System

## Overview
The **Ego Index** measures how egotistical a Twitter profile is.

**Higher score = Higher ego = WORSE (Red) 🔥**  
**Lower score = Lower ego = BETTER (Green) ✨**

## Formula
```
Overall Score = (Ego Score + (100 - Value Score)) / 2
```

## Tier System (Heat Map Progression)

| Score Range | Tier | Emoji | Color | Hex | Meaning |
|------------|------|-------|-------|-----|---------|
| 0-20 | Selfless Teacher | 🎓 | Green | #10B981 | Pure value, zero ego |
| 21-40 | Value Contributor | 💎 | Lime | #84CC16 | Lots of value, light on ego |
| 41-60 | Balanced Creator | ⚖️ | Yellow | #FBBF24 | Good mix of personality and value |
| 61-80 | Self-Promoter | 📢 | Orange | #F97316 | Heavy self-focus with some value |
| 81-100 | Ego Maximalist | 🔥 | Red | #EF4444 | All ego, minimal value |

## Examples

### Elon Musk
- Ego: 90/100
- Value: 10/100
- **Overall: 90** → 🔥 Ego Maximalist (Red)
- High self-promotion, minimal actionable value

### Naval Ravikant
- Ego: 35/100
- Value: 90/100
- **Overall: 23** → 💎 Value Contributor (Lime Green)
- Consistent wisdom sharing, low ego footprint

## Visual Color Gradient (Heat Map)
```
🎓 ―――→ 💎 ―――→ ⚖️ ―――→ 📢 ―――→ 🔥
Green   Lime   Yellow  Orange   Red
(BEST)  (GOOD) (MID)   (BAD)   (WORST)
0-20    21-40  41-60   61-80   81-100
```

## Signal to Noise Ratio

**Important:** Signal and Noise are **NOT inverses** of each other. They are normalized percentages that show content composition.

### How It Works:
- **Ego and Value** are independent scores (0-100 each)
- **Signal and Noise** are normalized percentages (always add to 100%)

### Formula:
```
Total = Ego Score + Value Score
Signal % = (Value Score / Total) × 100
Noise %  = (Ego Score / Total) × 100
```

### Examples:

**Elon Musk:**
- Ego: 90, Value: 10
- Total: 100
- **Noise: 90%**, **Signal: 10%**
- Interpretation: 90% of content is self-promotion, only 10% is valuable

**Owen:**
- Ego: 60, Value: 80
- Total: 140
- **Noise: 43%**, **Signal: 57%**
- Interpretation: More signal than noise - provides value despite some ego

### Visual Representation:
The Signal-to-Noise bar shows the proportion:
```
[━━━━━━━ Signal 57% ━━━━━━━][━ Noise 43% ━]
    Green (Value)              Orange (Ego)
```

### Emojis:
- 📡 **Signal** - Useful information, valuable content
- 📢 **Noise** - Self-promotion, ego-driven content
