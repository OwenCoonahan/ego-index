# UI Design Guide

## Design Philosophy

Inspired by Linear's clean dark mode aesthetic, the Ego Index UI prioritizes:
- **Minimal gradients** - Only functional, never decorative
- **Clean typography** - Simple white text, no gradient effects
- **Purposeful color** - Color reserved for the rating system
- **Solid buttons** - White buttons with black text
- **Subtle interactions** - Minimal animations and hover states

---

## Color System

### Heat Map Progression (Green → Red)

The entire color system follows an intuitive heat map from "cool" (good/low ego) to "hot" (bad/high ego):

| Score | Color | Hex | Usage |
|-------|-------|-----|-------|
| 0-20 | Green | `#10B981` | Best - Selfless Teacher |
| 21-40 | Lime | `#84CC16` | Good - Value Contributor |
| 41-60 | Yellow | `#FBBF24` | Balanced Creator |
| 61-80 | Orange | `#F97316` | Bad - Self-Promoter |
| 81-100 | Red | `#EF4444` | Worst - Ego Maximalist |

### Where Colors Are Used:

**Functional (Rating System):**
- ✅ Result card border gradient
- ✅ Large overall score number
- ✅ Leaderboard score text
- ✅ Progress bars
- ✅ Signal-to-Noise diverging bar

**NOT Used (Removed Decorative):**
- ❌ Page titles (now simple white)
- ❌ Buttons (now solid white)
- ❌ Background orbs/blurs
- ❌ Feature card glows
- ❌ Profile picture glows

---

## Typography

### Headings:
```css
/* Page titles */
text-4xl md:text-5xl font-bold text-white

/* Section headings */
text-xl font-bold text-foreground

/* Card titles */
text-sm font-semibold text-foreground
```

### Body Text:
```css
/* Primary text */
text-foreground

/* Secondary/muted text */
text-secondary

/* Small labels */
text-xs text-secondary
```

### Large Score:
```css
/* Dynamic color based on tier */
text-8xl font-black
text-emerald-400 | text-lime-400 | text-yellow-400 | text-orange-400 | text-red-400
```

---

## Components

### Buttons

**Primary (Call-to-Action):**
```tsx
className="bg-white text-black rounded-lg hover:bg-white/90"
```

**Secondary:**
```tsx
className="bg-white/5 border border-white/10 rounded-xl hover:bg-white/10"
```

**Filter/Tab Buttons:**
```tsx
// Active
className="bg-white text-black"

// Inactive
className="bg-white/5 text-secondary hover:bg-white/10"
```

### Cards

**Result Card:**
```tsx
// Outer (colored border, functional gradient)
className="bg-gradient-{tier} rounded-2xl p-1"

// Inner (dark background)
className="bg-background rounded-[14px] p-8"
```

**Leaderboard Card:**
```tsx
className="bg-white/5 backdrop-blur-sm border rounded-xl p-6 border-white/10 hover:border-white/20"
```

**Info Cards:**
```tsx
className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
```

### Feature Cards (Home Page):
```tsx
className="p-5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/[0.03]"
```

---

## Signal to Noise Bar

### Design:
- Diverging horizontal bar
- Green (Signal) on left, Color (Noise) on right
- Percentages displayed inside bars
- Black text with white drop shadow for visibility

### Implementation:
```tsx
// Signal side (always green)
className="bg-gradient-to-r from-emerald-500 to-emerald-400"
style={{ width: `${signalPercent}%` }}

// Noise side (color based on noise level)
className={noisePercent > 80 ? 'from-red-500 to-red-400' :
          noisePercent > 60 ? 'from-orange-500 to-orange-400' :
          noisePercent > 40 ? 'from-yellow-500 to-yellow-400' :
          'from-lime-500 to-lime-400'}
style={{ width: `${noisePercent}%` }}

// Text visibility
className="text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]"
```

---

## Layout

### Home Page:
```
┌─────────────────────────────────┐
│         Navigation              │
│                                 │
│       EGO INDEX (title)         │
│   "Everyone thinks they're..."  │
│                                 │
│       [@username input]         │
│      [Analyze Profile]          │
│                                 │
│   ┌───┐  ┌───┐  ┌───┐          │
│   │🎭 │  │💎 │  │🔥 │          │
│   └───┘  └───┘  └───┘          │
└─────────────────────────────────┘
```

### Leaderboard:
```
┌─────────────────────────────────────┐
│ [Lowest] [Highest] [All]            │
│                                     │
│ 🥇 #1 │ Profile │            │ 20  │
│ 🥈 #2 │ Profile │            │ 40  │
│ 🥉 #3 │ Profile │            │ 60  │
│  #4   │ Profile │            │ 75  │
└─────────────────────────────────────┘
```

### Results Page:
```
┌────────────────┬────────────────┐
│  Result Card   │    Summary     │
│                │                │
│      90        │ Score Breakdown│
│   EGO INDEX    │   (Radar)      │
│                │                │
│  🎭 Ego  90    │ Signal/Noise   │
│  💎 Value 10   │   (Bar)        │
│  ...5 more...  │                │
│                │                │
│ Signal/Noise   │                │
│  [===|====]    │                │
└────────────────┴────────────────┘
```

---

## Spacing & Borders

### Spacing:
```css
/* Card padding */
p-6 or p-8

/* Section gaps */
space-y-6

/* Component gaps */
gap-4 (16px) or gap-6 (24px)

/* Margins */
mb-6 (bottom) or mb-12 (large sections)
```

### Borders:
```css
/* Default */
border border-white/10

/* Hover */
hover:border-white/20

/* Emphasized */
border-white/30
```

### Border Radius:
```css
/* Small */
rounded-lg (8px)

/* Medium */
rounded-xl (12px)

/* Large */
rounded-2xl (16px)
```

---

## Animations & Transitions

### Hover States:
```css
/* Cards */
transition-all duration-200
hover:border-white/20

/* Buttons */
transition-all
hover:bg-white/90 or hover:bg-white/10
```

### Loading States:
```tsx
// Spinner
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20"></div>
```

### Removed Animations:
- ❌ Scale transforms on hover
- ❌ Gradient background animations
- ❌ Blur effects
- ❌ Complex color transitions

---

## Responsive Design

### Breakpoints:
```css
/* Mobile first, then: */
sm: 640px  /* Small tablets */
md: 768px  /* Tablets */
lg: 1024px /* Desktops */
xl: 1280px /* Large desktops */
```

### Grid Layouts:
```tsx
// Mobile: 1 column, Desktop: 2 columns
className="grid grid-cols-1 lg:grid-cols-2 gap-8"

// Feature cards (1 → 3)
className="grid grid-cols-1 md:grid-cols-3 gap-4"
```

### Text Sizing:
```tsx
// Responsive title
className="text-6xl md:text-7xl"

// Responsive subtitle
className="text-xl md:text-2xl"
```

---

## Accessibility

### Text Contrast:
- White text on dark backgrounds (#000000)
- Black text on colored backgrounds (with drop shadow)
- Minimum 4.5:1 contrast ratio

### Interactive Elements:
- Clear hover states
- Disabled states have reduced opacity
- Focus outlines on inputs

### Icons & Emojis:
- All emojis have text labels
- Icons paired with descriptive text

---

## Dark Mode

**Base Colors:**
```css
/* Background */
background: #000000 (pure black)

/* Foreground (text) */
foreground: #F5F5F5 (off-white)

/* Secondary (muted) */
secondary: #A0A0A0 (gray)

/* Overlays */
white/5  (5% opacity)
white/10 (10% opacity)
white/20 (20% opacity)
```

**Philosophy:**
- Pure black background for OLED optimization
- White text with varying opacity for hierarchy
- Colored accents only for ratings
- Subtle borders and overlays for depth

---

## Design System Summary

### What Makes It "Linear-like":
1. **Minimal color palette** - Black, white, and rating colors only
2. **Solid buttons** - No gradients except functional ones
3. **Clean typography** - Simple, readable, no effects
4. **Subtle borders** - Low opacity white for separation
5. **Purposeful spacing** - Generous whitespace
6. **Smooth interactions** - Fast, simple transitions

### What Makes It Unique:
1. **Heat map colors** - Intuitive green → red progression
2. **Signal-to-Noise viz** - Unique diverging bar
3. **Shareable cards** - Profile-specific results
4. **Emoji-driven** - Playful tier system
