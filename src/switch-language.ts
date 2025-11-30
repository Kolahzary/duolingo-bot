import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { getStatePath, waitForLogin } from './utils/auth.js';
import { getBrowserConfig, getContextOptions } from './utils/browser.js';
import { getCurrentLanguage, selectLanguage } from './utils/homepage.js';
import { captureUserData } from './utils/network.js';
import { NetworkLogs } from './interfaces/index.js';


dotenv.config();

(async () => {
    // Get target language from command line argument
    // Skip the '--' separator that npm adds
    const args = process.argv.slice(2).filter(arg => arg !== '--');
    const targetLanguage = args[0];

    if (!targetLanguage) {
        console.error('❌ Error: Please provide a target language name (e.g., "Turkish", "Spanish", "French")');
        console.log('Usage: pnpm run switch-language -- <language-name>');
        console.log('Example: pnpm run switch-language -- Turkish');
        process.exit(1);
    }

    console.log(`Switching to language: ${targetLanguage} `);

    const storageStatePath = getStatePath();
    if (!fs.existsSync(storageStatePath)) {
        console.error('❌ No saved state found. Please login first.');
        process.exit(1);
    }

    const browser = await chromium.launch(getBrowserConfig());

    const logDir = createLogDirectory('switch-language');
    console.log(`Log directory: ${logDir} `);

    try {
        const context = await browser.newContext({
            ...getContextOptions(),
            storageState: storageStatePath,
        });
        const page = await context.newPage();

        console.log('Navigating to Duolingo...');
        await page.goto('https://www.duolingo.com/learn', { waitUntil: 'domcontentloaded' });

        // Wait for login using utility function
        const loggedIn = await waitForLogin(page);

        if (!loggedIn) {
            console.error('❌ Not logged in. Please run "pnpm run login-manual" or "pnpm run login-auto".');
            await page.screenshot({ path: path.join(logDir, 'not_logged_in.png') });
            await browser.close();
            process.exit(1);
        }

        console.log('Logged in. Checking current language...');

        // Capture user data from network
        const userDataPromise = captureUserData(page);
        await page.reload({ waitUntil: 'domcontentloaded' });
        const userData = await userDataPromise;

        if (userData) {
            const logs: NetworkLogs = {
                userData: userData,
                leaderboardData: null
            };
            const currentLanguage = getCurrentLanguage(logs);
            console.log(`Current language: ${currentLanguage} `);

            if (currentLanguage === targetLanguage) {
                console.log(`✅ Already on ${targetLanguage}. No action needed.`);
                await browser.close();
                return;
            }

            console.log(`Switching from ${currentLanguage} to ${targetLanguage}...`);
        }

        await page.screenshot({ path: path.join(logDir, '01_before_switch.png') });

        // Select the language using utility function
        await selectLanguage(page, targetLanguage);
        console.log(`Clicked on language: ${targetLanguage} `);

        await page.screenshot({ path: path.join(logDir, '02_after_switch.png') });

        console.log('✅ Language switch completed');
        console.log(`Screenshots saved to: ${logDir} `);

        await browser.close();

    } catch (error) {
        console.error('❌ An error occurred:', error);
        await browser.close();
        process.exit(1);
    }
})();
