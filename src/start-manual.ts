import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { getStatePath } from './utils/auth.js';
import { getBrowserConfig, getContextOptions } from './utils/browser.js';
import * as fs from 'fs';

dotenv.config();

(async () => {
    console.log('Starting browser for manual interaction...');
    const config = getBrowserConfig();
    config.headless = false; // Force headful for manual interaction
    const browser = await chromium.launch(config);

    const storageStatePath = getStatePath();
    const logDir = createLogDirectory('start-manual');
    console.log(`Log directory: ${logDir} `);

    const baseContextOptions = getContextOptions();
    const contextOptions: any = { ...baseContextOptions };

    if (fs.existsSync(storageStatePath)) {
        console.log(`Loading state from: ${storageStatePath} `);
        contextOptions.storageState = storageStatePath;
    } else {
        console.log('No saved state found. Starting with fresh session.');
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    // Handle browser close
    browser.on('disconnected', () => {
        console.log('\nBrowser closed. Exiting...');
        process.exit(0);
    });

    try {
        console.log('Navigating to Duolingo...');

        // Inject Duolingo-PRO userscript
        const scriptPath = 'src/scripts/duolingo-pro.js';
        if (fs.existsSync(scriptPath)) {
            console.log(`Injecting userscript from: ${scriptPath}`);
            await page.addInitScript({ path: scriptPath });
        } else {
            console.warn(`Userscript not found at: ${scriptPath}`);
        }

        await page.goto('https://www.duolingo.com/', { waitUntil: 'domcontentloaded' });
        console.log('Browser is open. You can interact with the page.');
        console.log('Close the browser window (or tab) to stop the script.');

        // Keep script running until tab is closed
        while (!page.isClosed()) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('Tab closed.');
        await browser.close();
        process.exit(0);

    } catch (error) {
        console.error('An error occurred:', error);
        if (browser.isConnected()) {
            await browser.close();
        }
        process.exit(1);
    }
})();
