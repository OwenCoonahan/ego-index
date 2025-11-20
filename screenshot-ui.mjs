import { chromium } from '@playwright/test';

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('📸 Taking screenshots of the UI...\n');

  // Home page
  console.log('1. Capturing home page...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'ui-screenshots/01-home.png', fullPage: true });
  console.log('   ✓ Saved to ui-screenshots/01-home.png\n');

  // Leaderboard page
  console.log('2. Capturing leaderboard page...');
  await page.goto('http://localhost:3000/leaderboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'ui-screenshots/02-leaderboard.png', fullPage: true });
  console.log('   ✓ Saved to ui-screenshots/02-leaderboard.png\n');

  // Results page (Elon - high ego)
  console.log('3. Capturing results page (Elon Musk - high ego)...');
  await page.goto('http://localhost:3000/analyze/elonmusk');
  await page.waitForTimeout(3000); // Wait for API
  await page.screenshot({ path: 'ui-screenshots/03-results-high-ego.png', fullPage: true });
  console.log('   ✓ Saved to ui-screenshots/03-results-high-ego.png\n');

  // Results page (Naval - low ego)
  console.log('4. Capturing results page (Naval - low ego)...');
  await page.goto('http://localhost:3000/analyze/naval');
  await page.waitForTimeout(3000); // Wait for API
  await page.screenshot({ path: 'ui-screenshots/04-results-low-ego.png', fullPage: true });
  console.log('   ✓ Saved to ui-screenshots/04-results-low-ego.png\n');

  await browser.close();
  console.log('✅ All screenshots captured!\n');
}

captureScreenshots().catch(console.error);
