import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';

const BASE_URL = 'http://localhost:3002';

async function captureScreenshots() {
  console.log('🎬 Starting Playwright browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Create screenshots directory
  await mkdir('./screenshots', { recursive: true });

  try {
    // 1. Homepage
    console.log('📸 Capturing homepage...');
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: './screenshots/01-homepage.png',
      fullPage: true
    });

    // 2. Leaderboard
    console.log('📸 Capturing leaderboard...');
    await page.goto(`${BASE_URL}/leaderboard`);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: './screenshots/02-leaderboard.png',
      fullPage: true
    });

    // 3. Try to get an analyze page if we have mock data
    console.log('📸 Attempting to capture analyze page...');
    try {
      await page.goto(`${BASE_URL}/analyze/testuser`);
      await page.waitForTimeout(3000); // Give it time to load
      await page.screenshot({
        path: './screenshots/03-analyze.png',
        fullPage: true
      });
    } catch (error) {
      console.log('⚠️  Could not capture analyze page (may need mock data)');
    }

    console.log('✅ Screenshots captured successfully!');
    console.log('📁 Check ./screenshots/ directory');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
