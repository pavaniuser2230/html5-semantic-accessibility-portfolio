const { chromium } = require('playwright');

const pages = ['index.html', 'about.html', 'projects.html', 'contact.html'];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const pagePath of pages) {
    const page = await browser.newPage();
    await page.goto(`http://localhost:8000/${pagePath}`, { waitUntil: 'networkidle' });
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });

    const results = await page.evaluate(async () => {
      const axe = window.axe;
      return await axe.run(document, {
        runOnly: ['wcag2a', 'wcag2aa', 'best-practice']
      });
    });

    console.log(`\n== ${pagePath} ==`);
    console.log(JSON.stringify({
      violations: results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map(n => ({
          html: n.html,
          target: n.target,
          impact: n.impact,
          message: n.failureSummary || n.message
        }))
      }))
    }, null, 2));

    await page.close();
  }

  await browser.close();
})();
