import { chromium } from 'playwright';
const BASE = 'https://kiptra-mockup.vercel.app';
const pages = [
  { name: '01-dashboard', path: '/dashboard' },
  { name: '02-agent-chat', path: '/dashboard/agents/design-spec-assistant/chat' },
  { name: '03-design-canvas', path: '/design/kitchen-bath' },
  { name: '04-team', path: '/settings/team' },
  { name: '05-escalations', path: '/escalations' },
];
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
for (const pg of pages) {
  const p = await context.newPage();
  await p.goto(`${BASE}${pg.path}`, { waitUntil: 'networkidle', timeout: 20000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `/tmp/mobile-v3/${pg.name}.png`, fullPage: true });
  console.log(`✓ ${pg.name}`);
  await p.close();
}
await browser.close();
