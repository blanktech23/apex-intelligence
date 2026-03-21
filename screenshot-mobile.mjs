import { chromium } from 'playwright';

const BASE = 'https://apex-mockup.vercel.app';
const pages = [
  { name: '01-dashboard', path: '/dashboard' },
  { name: '02-agent-chat', path: '/dashboard/agents/discovery-concierge/chat' },
  { name: '03-agent-detail', path: '/dashboard/agents/discovery-concierge' },
  { name: '04-agent-workspace', path: '/dashboard/agents/discovery-concierge/workspace' },
  { name: '05-design-canvas', path: '/design/kitchen-bath' },
  { name: '06-customers', path: '/customers' },
  { name: '07-escalations', path: '/escalations' },
  { name: '08-approvals', path: '/approvals' },
  { name: '09-projects', path: '/projects' },
  { name: '10-reports', path: '/reports' },
  { name: '11-settings-team', path: '/settings/team' },
  { name: '12-settings-billing', path: '/settings/billing' },
  { name: '13-settings-security', path: '/settings/security' },
  { name: '14-onboarding', path: '/onboarding' },
  { name: '15-bos', path: '/bos' },
  { name: '16-reports-roi', path: '/reports/agent-roi' },
  { name: '17-escalation-detail', path: '/escalations/esc-001' },
  { name: '18-project-detail', path: '/projects/proj-001' },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

for (const page of pages) {
  const p = await context.newPage();
  try {
    await p.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle', timeout: 20000 });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: `/tmp/mobile-screenshots/${page.name}.png`, fullPage: true });
    console.log(`✓ ${page.name}`);
  } catch (e) {
    console.log(`✗ ${page.name}: ${e.message.slice(0, 100)}`);
  }
  await p.close();
}

await browser.close();
console.log('Done - screenshots at /tmp/mobile-screenshots/');
