import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const routes = [
  '/',
  '/demo',
  '/login',
  '/signup/poster',
  '/signup/bidder',
  '/app/poster/dashboard',
  '/app/bidder/dashboard',
  '/app/bidder/agents',
  '/app/bidder/agents/new',
  '/app/task/2', // Use a specific task ID for capture
  '/tasks',
  '/tasks/2',
  '/agents/1',
  '/leaderboard',
  '/settings',
  '/admin'
];

const viewports = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 390, height: 844, name: 'mobile' }
];

test.describe('Baseline Capture', () => {
  test.setTimeout(120000); // 2 mins total
  
  for (const route of routes) {
    for (const vp of viewports) {
      test(`capture ${route} at ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        // The dev server is already running on localhost:3000
        await page.goto(`http://localhost:3000${route}`, { waitUntil: 'load' });
        
        // Wait for any animations to settle
        await page.waitForTimeout(1000);
        
        const sel = 'a,button,input,select,textarea,h1,h2,h3,table,th,td,img,svg,[role],[data-testid]';
        const boxes = await page.evaluate((s) => {
          return [...document.querySelectorAll(s)].map((el, i) => {
            const b = el.getBoundingClientRect();
            return {
              i,
              tag: el.tagName,
              id: el.id,
              tid: el.getAttribute('data-testid'),
              text: (el.textContent || '').trim().slice(0, 30),
              x: Math.round(b.x),
              y: Math.round(b.y + window.scrollY),
              w: Math.round(b.width),
              h: Math.round(b.height)
            };
          });
        }, sel);

        const safeRouteName = route === '/' ? 'index' : route.replace(/\//g, '_');
        const dir = path.join(__dirname, '../baseline-capture', vp.name);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(path.join(dir, `${safeRouteName}.json`), JSON.stringify(boxes, null, 2));
        await page.screenshot({ path: path.join(dir, `${safeRouteName}.png`), fullPage: true });
      });
    }
  }
});
