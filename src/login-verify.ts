import { chromium } from 'playwright';
import * as fs from 'fs';
import dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { isLoggedIn, getStatePath } from './utils/auth.js';
import { getBrowserConfig, getContextOptions } from './utils/browser.js';
import * as path from 'path';

dotenv.config();

(async () => {
    console.log('Verifying login state...');

    const storageStatePath = getStatePath();
    if (!fs.existsSync(storageStatePath)) {
        console.error('❌ No saved state found at:', storageStatePath);
        console.log('Run "pnpm run login-manual" or "pnpm run login-auto" first.');
        process.exit(1);
    }

    const browser = await chromium.launch(getBrowserConfig());

    const logDir = createLogDirectory('login-verify');
    console.log(`Log directory: ${logDir}`);

    try {
        const context = await browser.newContext({
            ...getContextOptions(),
            storageState: storageStatePath,
        });
        const page = await context.newPage();

        console.log('Navigating to Duolingo...');
        await page.goto('https://www.duolingo.com/', { waitUntil: 'domcontentloaded' });

        console.log('Waiting for page to load and login check...');

        // Poll for login status for up to 10 seconds
        let attempts = 0;
        let loggedIn = false;
        while (attempts < 10) {
            if (await isLoggedIn(page)) {
                loggedIn = true;
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
            attempts++;
        }

        if (loggedIn) {
            console.log('✅ State is valid. User is logged in.');
            await page.screenshot({ path: path.join(logDir, 'verified_success.png') });
            await browser.close();
            process.exit(0);
        } else {
            console.error('❌ State is invalid or expired. User is NOT logged in.');
            await page.screenshot({ path: path.join(logDir, 'verified_failed.png') });
            // Save HTML for debugging
            const html = await page.content();
            fs.writeFileSync(path.join(logDir, 'verified_failed.html'), html);

            await browser.close();
            process.exit(1);
        }

    } catch (error) {
        console.error('An error occurred during verification:', error);
        await browser.close();
        process.exit(1);
    }
})();
