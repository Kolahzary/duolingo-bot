import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { isLoggedIn, getStatePath, waitForLogin } from './utils/auth.js';
import {
    getGems,
    getStreak,
    getAvailableLanguages,
    getCurrentLanguage,
    getCurrentLanguageISO,
    getCurrentLeague,
    getDailyQuests,
    getSkillPath,
    getTodaysStreakCompleted
} from './utils/homepage.js';
import { startNetworkLogging, captureUserData, captureLeaderboardData } from './utils/network.js';
import { NetworkLogs } from './interfaces';

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
    console.log(`Log directory: ${ logDir } `);

    try {
        const context = await browser.newContext({
            storageState: storageStatePath,
            viewport: { width: 1280, height: 720 },
        });
        const page = await context.newPage();

        // Start network logging
        await startNetworkLogging(page, logDir);

        // Set up data capture
        const userDataPromise = captureUserData(page);
        const leaderboardDataPromise = captureLeaderboardData(page);

        console.log('Navigating to Duolingo...');
        await page.goto('https://www.duolingo.com/learn', { waitUntil: 'domcontentloaded' });

        // Wait for login using utility function
        const loggedIn = await waitForLogin(page);

        if (!loggedIn) {
            console.error('❌ Not logged in. Please run "npm run login-manual" or "npm run login-auto".');
            await page.screenshot({ path: path.join(logDir, 'not_logged_in.png') });
            await browser.close();
            process.exit(1);
        }

        console.log('Logged in. Waiting for data...');

        // Wait for both user data and leaderboard data
        const userData = await userDataPromise;
        const leaderboardData = await leaderboardDataPromise;

        if (!userData) {
            console.error('❌ Failed to capture user data from network.');
            // Fallback or exit?
            // Let's try to reload if not found? Or just proceed with empty data.
        }

        await page.screenshot({ path: path.join(logDir, 'homepage.png') });
        const html = await page.content();
        fs.writeFileSync(path.join(logDir, 'homepage.html'), html);

        const status: any = {};

        if (userData) {
            // Create NetworkLogs object
            const logs: NetworkLogs = {
                userData: userData,
                leaderboardData: leaderboardData
            };

            // Get current language ISO code
            const currentLangISO = getCurrentLanguageISO(logs);

            // Global stats
            status.gems = getGems(logs);
            status.streak = getStreak(logs);
            status.todaysStreakCompleted = getTodaysStreakCompleted(logs);
            status.league = getCurrentLeague(logs);
            status.dailyQuests = getDailyQuests(logs);
            status.availableLanguages = getAvailableLanguages(logs);

            // Language-specific data organized by ISO code
            status.languages = {
                [currentLangISO]: {
                    name: getCurrentLanguage(logs),
                    units: getSkillPath(logs)
                }
            };
        } else {
            status.error = "Failed to capture network data";
        }

        console.log('Status collected:', status);

        const outputPath = path.join(logDir, 'status.json');
        fs.writeFileSync(outputPath, JSON.stringify(status, null, 2));
        console.log(`Status saved to: ${ outputPath } `);

        await browser.close();

    } catch (error) {
        console.error('An error occurred:', error);
        await browser.close();
        process.exit(1);
    }
})();
