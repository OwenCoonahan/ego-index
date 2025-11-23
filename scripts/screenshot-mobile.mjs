import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';

const BASE_URL = 'http://localhost:3002';

// Common mobile viewports
const VIEWPORTS = {
  'iphone-se': { width: 375, height: 667 },
  'iphone-14': { width: 390, height: 844 },
  'iphone-14-pro-max': { width: 430, height: 932 },
  'samsung-s21': { width: 360, height: 800 },
  'tablet': { width: 768, height: 1024 },
};

async function captureScreenshots() {
  console.log('🎬 Starting Playwright browser for mobile screenshots...');
  const browser = await chromium.launch();

  // Create screenshots directory
  await mkdir('./screenshots/mobile', { recursive: true });

  // Test with iPhone 14 (most common)
  const context = await browser.newContext({
    viewport: VIEWPORTS['iphone-14'],
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  try {
    // 1. Homepage - Mobile
    console.log('📱 Capturing mobile homepage...');
    await page.goto(BASE_URL);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: './screenshots/mobile/01-homepage-iphone14.png',
      fullPage: true
    });

    // 2. Leaderboard - Mobile
    console.log('📱 Capturing mobile leaderboard...');
    await page.goto(`${BASE_URL}/leaderboard`);
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: './screenshots/mobile/02-leaderboard-iphone14.png',
      fullPage: true
    });

    // 3. Try analyze page
    console.log('📱 Attempting to capture mobile analyze page...');
    try {
      await page.goto(`${BASE_URL}/analyze/testuser`);
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: './screenshots/mobile/03-analyze-iphone14.png',
        fullPage: true
      });
    } catch (error) {
      console.log('⚠️  Could not capture analyze page');
    }

    console.log('\n✅ Mobile screenshots captured!');
    console.log('📁 Check ./screenshots/mobile/ directory\n');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
