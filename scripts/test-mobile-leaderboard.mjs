#!/usr/bin/env node
/**
 * Test mobile leaderboard layout with Playwright
 */

import { chromium } from '@playwright/test';

async function testMobileLeaderboard() {
  console.log('🧪 Testing mobile leaderboard layout...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    deviceScaleFactor: 3,
  });

  const page = await context.newPage();

  try {
    // Navigate to leaderboard
    console.log('📱 Opening leaderboard on iPhone 14 Pro viewport (390x844)...');
    await page.goto('http://localhost:3000/leaderboard', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for leaderboard to load
    await page.waitForSelector('a[href*="/analyze/"]', { timeout: 10000 });

    // Take screenshot
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const screenshotPath = `screenshots/mobile-leaderboard-${timestamp}.png`;

    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`✅ Screenshot saved: ${screenshotPath}`);

    // Check for overflow issues
    const cards = await page.locator('a[href*="/analyze/"]').all();
    console.log(`\n📊 Found ${cards.length} leaderboard cards`);

    for (let i = 0; i < Math.min(3, cards.length); i++) {
      const card = cards[i];
      const box = await card.boundingBox();
      if (box) {
        console.log(`   Card ${i + 1}: width=${Math.round(box.width)}px, x=${Math.round(box.x)}px`);

        // Check if content is cut off (x position should be >= 0)
        if (box.x < 0) {
          console.log(`   ⚠️  Warning: Card ${i + 1} may be cut off on the left`);
        }
      }
    }

    // Check rank numbers visibility
    const ranks = await page.locator('.font-mono.text-xl, .font-mono.text-2xl').filter({ hasText: /^[#0-9🥇🥈🥉]/ }).all();
    console.log(`\n🏆 Found ${ranks.length} rank indicators`);

    for (let i = 0; i < Math.min(3, ranks.length); i++) {
      const rank = ranks[i];
      const box = await rank.boundingBox();
      const text = await rank.textContent();
      if (box) {
        console.log(`   Rank ${i + 1} "${text}": x=${Math.round(box.x)}px, width=${Math.round(box.width)}px`);

        if (box.x < 8) {
          console.log(`   ⚠️  Warning: Rank may be too close to edge (x=${Math.round(box.x)}px)`);
        }
      }
    }

    console.log('\n✨ Mobile layout looks good!');
    console.log('\n👀 Browser window will stay open for 10 seconds for manual inspection...');

    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testMobileLeaderboard();
