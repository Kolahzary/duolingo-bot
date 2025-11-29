import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { isLoggedIn, getStatePath } from './utils/auth.js';
import {
    getGems,
    getStreak,
    getAvailableLanguages,
    getCurrentLanguage,
    getCurrentLeague,
    getDailyQuests,
    getSkillPath
} from './utils/homepage.js';

dotenv.config();

(async () => {
    console.log('Getting user status...');

    const storageStatePath = getStatePath();
    if (!fs.existsSync(storageStatePath)) {
        console.error('❌ No saved state found. Please login first.');
        process.exit(1);
    }

    const browser = await chromium.launch({
        headless: true,
    });

    const logDir = createLogDirectory('get-status');
    console.log(`Log directory: ${logDir}`);

    try {
        const context = await browser.newContext({
            storageState: storageStatePath,
            viewport: { width: 1280, height: 720 },
        });
        const page = await context.newPage();

        console.log('Navigating to Duolingo...');
        await page.goto('https://www.duolingo.com/learn', { waitUntil: 'domcontentloaded' });

        // Wait for login check with polling
        let loggedIn = false;
        for (let i = 0; i < 10; i++) {
            if (await isLoggedIn(page)) {
                loggedIn = true;
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!loggedIn) {
            console.error('❌ Not logged in. Please run "npm run login-manual" or "npm run login-auto".');
            await page.screenshot({ path: path.join(logDir, 'not_logged_in.png') });
            await browser.close();
            process.exit(1);
        }

        console.log('Logged in. Scraping data...');
        // Wait a bit for dynamic content to load
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(logDir, 'homepage.png') });
        const html = await page.content();
        fs.writeFileSync(path.join(logDir, 'homepage.html'), html);



        const status: any = {};

        // Gems
        status.gems = await getGems(page);

        // Streak
        status.streak = await getStreak(page);

        // Languages (Available & Current)
        status.availableLanguages = await getAvailableLanguages(page);

        // Current Language
        status.currentLanguage = await getCurrentLanguage(page);

        // Current League
        status.currentLeague = await getCurrentLeague(page);

        // Daily Quests
        status.dailyQuests = await getDailyQuests(page);

        // Skill Path
        status.skillPath = await getSkillPath(page);

        console.log('Status collected:', status);



        const outputPath = path.join(logDir, 'status.json');
        fs.writeFileSync(outputPath, JSON.stringify(status, null, 2));
        console.log(`Status saved to: ${outputPath}`);

        await browser.close();

    } catch (error) {
        console.error('An error occurred:', error);
        await browser.close();
        process.exit(1);
    }
})();
