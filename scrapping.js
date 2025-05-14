const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Open the UBL website
  await page.goto('https://www.ubldigital.com');
  console.log("👉 Please log in manually and navigate to your transaction page.");

  // Wait for user to login and open transaction page
  const selector = '#dnn_ctr403_accountTransactions_pnlContainer_i2_i0_rdgStatement_ctl00_Header';

  try {
    await page.waitForSelector(selector, { timeout: 180000 }); // Wait for table header
    await page.waitForSelector('table.rgMasterTable tbody tr', { timeout: 60000 }); // Wait for table rows
    console.log("✅ Transaction table detected. Starting periodic scraping...");

    // Function to scrape data
    const scrapeData = async () => {
      const transactions = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table.rgMasterTable tbody tr'));
        return rows.map(row => {
          const cols = Array.from(row.querySelectorAll('td'));
          
          const amountDebit = cols[3]?.innerText?.trim() || '';
          const amountCredit = cols[4]?.innerText?.trim() || '';
      
          let amount = '';
          let type = '';
      
          if (amountDebit && !amountCredit) {
            amount = amountDebit;
            type = 'debit';
          } else if (amountCredit && !amountDebit) {
            amount = amountCredit;
            type = 'credit';
          }
      
          return {
            date: cols[0]?.innerText?.trim() || '',
            description: cols[1]?.innerText?.trim() || '',
            amount,
            type
          };
        });
      });

      // Clean unwanted rows
      const cleaned = transactions.filter(
        t => t.date && t.description && !t.description.includes('Transactions per page') && t.description !== 'Total'
      );

      console.log("📦 Scraped at", new Date().toLocaleTimeString(), cleaned);
    };

    // Run scrapeData every 3 minutes (180,000ms)
    setInterval(scrapeData, 180000);

    // Initial scrape
    await scrapeData();

  } catch (e) {
    console.error("❌ Failed to detect transaction table in time:", e.message);
  }

  // Keep the process alive
})();
