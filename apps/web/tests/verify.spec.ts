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
  '/app/task/2',
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

test.describe('Layout Verification', () => {
  test.setTimeout(120000);
  
  for (const route of routes) {
    for (const vp of viewports) {
      test(`verify ${route} at ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`http://localhost:3000${route}`, { waitUntil: 'load' });
        await page.waitForTimeout(1000);
        
        const sel = 'a,button,input,select,textarea,h1,h2,h3,table,th,td,img,svg,[role],[data-testid]';
        const newBoxes = await page.evaluate((s) => {
          return [...document.querySelectorAll(s)].map((el, i) => {
            const b = el.getBoundingClientRect();
            return {
              i, tag: el.tagName, text: (el.textContent || '').trim().slice(0, 30),
              x: Math.round(b.x), y: Math.round(b.y + window.scrollY),
              w: Math.round(b.width), h: Math.round(b.height)
            };
          });
        }, sel);

        const safeRouteName = route === '/' ? 'index' : route.replace(/\//g, '_');
        const baselinePath = path.join(__dirname, '../baseline-capture', vp.name, `${safeRouteName}.json`);
        
        if (!fs.existsSync(baselinePath)) {
          throw new Error(`Baseline not found for ${route}`);
        }
        
        const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
        expect(newBoxes.length).toBe(baseline.length);
        
        for (let i = 0; i < baseline.length; i++) {
          const b = baseline[i];
          const n = newBoxes[i];
          expect(n.tag).toBe(b.tag);
          
          const dx = Math.abs(n.x - b.x);
          const dy = Math.abs(n.y - b.y);
          const dw = Math.abs(n.w - b.w);
          const dh = Math.abs(n.h - b.h);
          
          let maxDiff = 15; // Accommodate accumulated font metric shifts across stacked containers
          if (['H1', 'H2', 'H3', 'P', 'SPAN', 'A', 'BUTTON'].includes(n.tag)) {
            maxDiff = 80; // Font weight changes (800 -> 300) cause large intrinsic width changes and up to 1 line wrap (60px)
          }

          if (dx > maxDiff || dy > maxDiff || dw > maxDiff || dh > maxDiff) {
            throw new Error(`Layout shifted for element ${i} (${n.tag} "${n.text}") on ${route} at ${vp.name}. Baseline: [x:${b.x} y:${b.y} w:${b.w} h:${b.h}], New: [x:${n.x} y:${n.y} w:${n.w} h:${n.h}]`);
          }
        }
      });
    }
  }
});
