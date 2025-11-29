import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { isLoggedIn, getStatePath } from './utils/auth.js';

import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




(async () => {
    const browser = await chromium.launch({
        headless: false, // Set to false to see the browser UI
    });

    // Create timestamped log directory for this run
    const logDir = createLogDirectory('main');
    console.log(`Log directory: ${logDir}`);

    const storageStatePath = getStatePath();

    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        storageState: fs.existsSync(storageStatePath) ? storageStatePath : undefined,
    });
    const page = await context.newPage();

    // Handle graceful exit
    const handleExit = async () => {
        console.log('Received exit signal. Saving state...');
        try {
            await context.storageState({ path: storageStatePath });
            console.log('Saved browser state to', storageStatePath);
        } catch (e) {
            console.error('Failed to save state on exit:', e);
        }
        await browser.close();
        process.exit(0);
    };
    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);

    try {
        console.log('Navigating to Duolingo...');
        await page.goto('https://www.duolingo.com/', { waitUntil: 'domcontentloaded' });
        await page.screenshot({ path: path.join(logDir, 'home.png') });

        // Check if we are already logged in
        if (await isLoggedIn(page)) {
            console.log('Already logged in!');
        } else {
            console.log('Not logged in, aborting.');

            await new Promise(resolve => setTimeout(resolve, 5000));
            await handleExit();
        }

    } catch (error) {
        console.error('An error occurred:', error);
        await page.screenshot({ path: path.join(logDir, 'error.png') });
    } finally {
        // Save state on exit as well, just in case
        try {
            await context.storageState({ path: storageStatePath });
            console.log('Saved browser state to', storageStatePath);
        } catch (e) {
            console.error('Failed to save state on exit:', e);
        }
        await browser.close();
    }
})();
