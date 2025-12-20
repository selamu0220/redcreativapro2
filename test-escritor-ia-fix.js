#!/usr/bin/env node

/**
 * Test script to verify that the Escritor IA page flashing issue has been resolved
 */

const puppeteer = require('puppeteer');

async function testEscritorIAPage() {
  console.log('🧪 Testing Escritor IA page for flashing issues...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Keep browser visible for manual inspection
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Track page changes to detect flashing
    let renderCount = 0;
    let lastContent = '';
    let flashCount = 0;

    page.on('framenavigated', () => {
      console.log('📄 Page navigated');
    });

    // Monitor DOM changes to detect flashing
    page.on('domcontentloaded', async () => {
      console.log('📄 DOM content loaded');

      // Inject script to monitor rendering changes
      await page.evaluate(() => {
        window.renderCount = 0;
        window.lastContent = '';
        window.flashCount = 0;

        const observer = new MutationObserver((mutations) => {
          window.renderCount++;

          // Check for significant content changes that might indicate flashing
          const bodyContent = document.body.innerHTML;
          if (window.lastContent && window.lastContent !== bodyContent) {
            const diff = Math.abs(bodyContent.length - window.lastContent.length);
            if (diff > 1000) { // Significant content change
              window.flashCount++;
              console.log(`⚡ Potential flash detected (render #${window.renderCount})`);
            }
          }
          window.lastContent = bodyContent;
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true
        });

        // Monitor loading states
        const checkLoading = () => {
          const loaders = document.querySelectorAll('[class*="loader"], [class*="loading"], [class*="spinner"]');
          if (loaders.length > 0) {
            console.log(`⏳ Loading indicators found: ${loaders.length}`);
          }
        };

        // Check every 500ms for first 10 seconds
        let checks = 0;
        const interval = setInterval(() => {
          checkLoading();
          checks++;
          if (checks >= 20) clearInterval(interval);
        }, 500);
      });
    });

    // Navigate to the Escritor IA page
    console.log('🌐 Navigating to Escritor IA page...');
    await page.goto('http://localhost:3000/escritor-ia', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for initial load
    await page.waitForTimeout(3000);

    // Get monitoring results
    const results = await page.evaluate(() => {
      return {
        renderCount: window.renderCount || 0,
        flashCount: window.flashCount || 0,
        finalContentLength: document.body.innerHTML.length
      };
    });

    console.log('\n📊 Test Results:');
    console.log(`  • Total renders: ${results.renderCount}`);
    console.log(`  • Detected flashes: ${results.flashCount}`);
    console.log(`  • Final content length: ${results.finalContentLength}`);

    // Wait a bit more to see if there are any delayed flashes
    console.log('\n⏳ Waiting for potential delayed issues...');
    await page.waitForTimeout(5000);

    const finalResults = await page.evaluate(() => {
      return {
        renderCount: window.renderCount || 0,
        flashCount: window.flashCount || 0
      };
    });

    console.log('📊 Final Test Results:');
    console.log(`  • Total renders: ${finalResults.renderCount}`);
    console.log(`  • Detected flashes: ${finalResults.flashCount}`);

    // Assessment
    if (finalResults.flashCount === 0 && finalResults.renderCount < 10) {
      console.log('\n✅ SUCCESS: No flashing detected! The page loads smoothly.');
    } else if (finalResults.flashCount < 3) {
      console.log('\n⚠️  PARTIAL SUCCESS: Minimal flashing detected, but much improved.');
    } else {
      console.log('\n❌ ISSUE: Significant flashing still detected.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      console.log('\n🔄 Keeping browser open for manual inspection...');
      console.log('Close the browser window when done.');
      // Don't close browser automatically for manual inspection
      // await browser.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testEscritorIAPage().catch(console.error);
}

module.exports = { testEscritorIAPage };
