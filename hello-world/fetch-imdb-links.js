const { chromium } = require('playwright');

// Function to add random delay between actions
const randomDelay = (min, max) => 
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

async function fetchImdbItems() {
  let browser;
  try {
    // Launch browser with anti-scraping configurations
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      acceptDownloads: true,
      hasTouch: false,
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation']
    });

    // Enable storage state persistence
    await context.addCookies([{
      name: 'session-id',
      value: '123-' + Date.now(),
      domain: '.imdb.com',
      path: '/'
    }]);

    const page = await context.newPage();
    
    // Navigate to IMDb watchlist with random delay
    await page.goto('https://www.imdb.com/user/ur52527492/watchlist/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await randomDelay(2000, 4000);

    // Simulate human-like scrolling
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    await randomDelay(1000, 2000);

    // Wait for the elements to be available
    await page.waitForSelector('.ipc-metadata-list-summary-item');
    
    // Extract movie/series information with rate limiting
    const items = [];
    const elements = await page.$$('.ipc-metadata-list-summary-item');
    
    for (const element of elements) {
      // Add random delay between processing each item
      await randomDelay(500, 1500);
      
      const linkElement = await element.$('.ipc-poster a');
      const typeElement = await element.$('.dli-title-type-data');
      
      if (linkElement) {
        const href = await linkElement.getAttribute('href');
        const match = href.match(/\/title\/(tt\d+)/);
        const id = match ? match[1] : null;
        const type = typeElement ? 'series' : 'movie';
        
        if (id) {
          items.push({ id, type });
          
          // Occasionally simulate clicking on a title (10% chance)
          if (Math.random() < 0.1) {
            await linkElement.click();
            await randomDelay(2000, 4000);
            await page.goBack();
            await randomDelay(1000, 2000);
          }
        }
      }
    }
    
    // Clean exit
    await context.clearCookies();
    await browser.close();
    console.log(items)
    return items;
  } catch (error) {
    console.error('An error occurred:', error);
    // Ensure browser closes even if there's an error
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

// Example usage:
// if (require.main === module) {
//   (async () => {
//     try {
//       const items = await fetchImdbItems();
//       console.log('Found items:');
//       items.forEach(item => console.log(`ID: ${item.id}, Type: ${item.type}`));
//     } catch (error) {
//       console.error('Failed to fetch items:', error);
//     }
//   })();
// }

module.exports = fetchImdbItems;
