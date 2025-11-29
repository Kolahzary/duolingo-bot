import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { isLoggedIn, getStatePath } from './utils/auth.js';
import * as path from 'path';

dotenv.config();

(async () => {
    console.log('Initializing browser for manual login...');
    const browser = await chromium.launch({
        headless: false,
    });

    const storageStatePath = getStatePath();
    const logDir = createLogDirectory('login-manual');
    console.log(`Log directory: ${logDir}`);

    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    let loggedIn = false;

    // Handle browser close
    browser.on('disconnected', () => {
        console.log('\nBrowser closed.');
        if (loggedIn) {
            console.log('✅ Login verified and state saved successfully.');
            process.exit(0);
        } else {
            console.error('❌ Login not detected before browser close.');
            process.exit(1);
        }
    });

    try {
        await page.goto('https://www.duolingo.com/', { waitUntil: 'domcontentloaded' });
        console.log('Please log in to Duolingo in the opened browser window.');
        console.log('Waiting for login detection...');

        // Poll for login success
        while (!page.isClosed()) {
            if (await isLoggedIn(page)) {
                console.log('Login detected!');

                // Save state
                await context.storageState({ path: storageStatePath });
                console.log(`State saved to: ${storageStatePath}`);

                loggedIn = true;

                // Take screenshot
                await page.screenshot({ path: path.join(logDir, 'login_success.png') });
                console.log('Screenshot saved.');

                console.log('Closing browser...');
                await browser.close();
                process.exit(0);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        console.error('An error occurred:', error);
        if (browser.isConnected()) {
            await browser.close();
        }
        process.exit(1);
    }
})();
