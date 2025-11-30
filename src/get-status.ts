import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { getStatePath, waitForLogin } from './utils/auth.js';
import { getBrowserConfig, getContextOptions } from './utils/browser.js';
import {
    getGems,
    getStreak,
    getAvailableLanguages,
    getCurrentLanguage,
    getCurrentLanguageISO,
    getCurrentLeague,
    getDailyQuests,
    getSkillPath,
    getTodaysStreakCompleted,
    selectLanguage
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

    const browser = await chromium.launch(getBrowserConfig());
    const logDir = createLogDirectory('get-status');
    console.log(`Log directory: ${logDir} `);

    try {
        const context = await browser.newContext({
            ...getContextOptions(),
            storageState: storageStatePath,
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
            console.error('❌ Not logged in. Please run "pnpm run login-manual" or "pnpm run login-auto".');
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

        // Check for --all flag
        const args = process.argv.slice(2);
        const fetchAll = args.includes('--all');

        if (userData) {
            // Create NetworkLogs object
            const logs: NetworkLogs = {
                userData: userData,
                leaderboardData: leaderboardData
            };

            // Get current language ISO code
            const currentLangISO = getCurrentLanguageISO(logs);
            const currentLangName = getCurrentLanguage(logs);

            // Global stats
            status.gems = getGems(logs);
            status.streak = getStreak(logs);
            status.todaysStreakCompleted = getTodaysStreakCompleted(logs);
            status.league = getCurrentLeague(logs);
            status.dailyQuests = getDailyQuests(logs);
            status.availableLanguages = getAvailableLanguages(logs);

            // Initialize languages object
            status.languages = {};

            // Add current language data
            status.languages[currentLangISO] = {
                name: currentLangName,
                units: getSkillPath(logs)
            };

            // If --all flag is present, fetch data for other languages
            if (fetchAll) {
                console.log('Fetching data for all languages...');
                const availableLanguages = status.availableLanguages;

                for (const langName of availableLanguages) {
                    if (langName === currentLangName) continue;

                    console.log(`Switching to ${langName}...`);

                    // Select language
                    await selectLanguage(page, langName);

                    // Wait for data update
                    const newUserDataPromise = captureUserData(page);
                    await page.reload({ waitUntil: 'domcontentloaded' });
                    const newUserData = await newUserDataPromise;

                    if (newUserData) {
                        const newLogs: NetworkLogs = {
                            userData: newUserData,
                            leaderboardData: null // We don't need leaderboard for specific languages
                        };

                        const newLangISO = getCurrentLanguageISO(newLogs);
                        status.languages[newLangISO] = {
                            name: langName,
                            units: getSkillPath(newLogs)
                        };
                        console.log(`Captured data for ${langName}`);
                    }
                }

                // Switch back to original language if needed? 
                // Maybe not strictly necessary for get-status, but polite.
                // Let's leave it on the last language for now to save time.
            }

        } else {
            status.error = "Failed to capture network data";
        }

        console.log('Status collected:', status);

        const outputPath = path.join(logDir, 'status.json');
        fs.writeFileSync(outputPath, JSON.stringify(status, null, 2));
        console.log(`Status saved to: ${outputPath} `);

        await browser.close();

    } catch (error) {
        console.error('An error occurred:', error);
        await browser.close();
        process.exit(1);
    }
})();
