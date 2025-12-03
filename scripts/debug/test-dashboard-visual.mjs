import { chromium } from 'playwright';

async function testDashboard() {
  const browser = await chromium.launch();
  const context = await browser.createContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Navigate to login
    await page.goto('http://localhost:3000/vendor/login', { waitUntil: 'networkidle' });
    console.log('✓ Reached login page');

    // Login
    await page.fill('[type="email"]', 'test@test.com');
    await page.fill('[type="password"]', '123');
    await page.click('button:has-text("Sign In")');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✓ Logged in');

    // Check dashboard
    await page.goto('http://localhost:3000/vendor/dashboard', { waitUntil: 'networkidle' });
    console.log('✓ Reached dashboard');

    // Take screenshot
    await page.screenshot({ path: '/tmp/dashboard-light.png' });
    console.log('✓ Screenshot saved: /tmp/dashboard-light.png');

    // Check sidebar height
    const sidebar = await page.querySelector('aside');
    const main = await page.querySelector('main');

    if (sidebar && main) {
      const sidebarBox = await sidebar.boundingBox();
      const mainBox = await main.boundingBox();

      console.log('\nLayout Analysis:');
      console.log(`Sidebar height: ${sidebarBox.height}`);
      console.log(`Main content height: ${mainBox.height}`);
      console.log(`Difference: ${sidebarBox.height - mainBox.height}px`);

      if (sidebarBox.height > mainBox.height) {
        console.log('⚠️  ISSUE: Sidebar extends beyond main content');
      }
    }

    // Test dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.screenshot({ path: '/tmp/dashboard-dark.png' });
    console.log('✓ Dark mode screenshot: /tmp/dashboard-dark.png');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testDashboard();
