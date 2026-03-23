import { chromium } from 'playwright';
const BASE = 'https://kiptra-mockup.vercel.app';
const pages = [
  { name: '01-dashboard', path: '/dashboard' },
  { name: '02-agent-chat', path: '/dashboard/agents/discovery-concierge/chat' },
  { name: '03-design-canvas', path: '/design/kitchen-bath' },
  { name: '04-approvals', path: '/approvals' },
  { name: '05-onboarding', path: '/onboarding' },
  { name: '06-escalation-detail', path: '/escalations/esc-001' },
];
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
for (const page of pages) {
  const p = await context.newPage();
  await p.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle', timeout: 20000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `/tmp/mobile-v2/${page.name}.png`, fullPage: true });
  console.log(`✓ ${page.name}`);
  await p.close();
}
await browser.close();
