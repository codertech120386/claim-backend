const puppeteer = require('puppeteer');

class BrowserSessionManager {
  constructor() {
    this.sessions = new Map();
  }

  async setupBrowser() {
    try {
      console.log('Going to setup browser');

      // Launching the browser
      //  const browser = await puppeteer.launch({ headless: true });
      const browser = await puppeteer.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--aggressive-cache-discard',
          '--disable-cache',
          '--disable-application-cache',
          '--disable-offline-load-stale-cache',
          '--disable-gpu-shader-disk-cache',
          '--media-cache-size=0',
          '--disk-cache-size=0',
        ],
      });

      console.log('Browser launched successfully');

      // Opening a new page
      const page = await browser.newPage();

      console.log('New page opened successfully');

      // Setting viewport
      await page.setViewport({ width: 1800, height: 1200 });

      console.log('Viewport set successfully');

      return { browser, page };
    } catch (error) {
      console.error('Error in setupBrowser:', error.message);
      throw new Error('Failed to setup browser: ' + error.message);
    }
  }
}

module.exports = BrowserSessionManager;
