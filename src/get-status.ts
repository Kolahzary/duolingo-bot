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
import { startNetworkLogging } from './utils/network.js';

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

        // Start network logging
        await startNetworkLogging(page, logDir);

        // Intercept user profile and leaderboard
        let userData: any = null;
        let leaderboardData: any = null;

        page.on('response', async (response) => {
            const url = response.url();

            // Match users/<id> request which contains the profile
            if (url.includes('/users/') && url.includes('fields=')) {
                try {
                    const json = await response.json();
                    if (json.currentCourseId && json.courses) {
                        userData = json;
                        console.log('Captured user profile data from network.');
                    }
                } catch (e) { /* Ignore */ }
            }

            // Match leaderboard request
            // https://duolingo-leaderboards-prod.duolingo.com/leaderboards/...
            if (url.includes('duolingo-leaderboards-prod.duolingo.com') && url.includes('/leaderboards/')) {
                try {
                    const json = await response.json();
                    // Check for tier in the response
                    // It might be in active_contest or similar
                    if (json.leaderboard || json.active) {
                        // Prioritize if it has 'active' data (meaning active cohort)
                        // or if we don't have any data yet.
                        if (!leaderboardData || (json.active && !leaderboardData.active)) {
                            leaderboardData = json;
                            console.log('Captured leaderboard data from network (Active).');
                        } else if (!leaderboardData) {
                            leaderboardData = json;
                            console.log('Captured leaderboard data from network.');
                        }
                    }
                } catch (e) { /* Ignore */ }
            }
        });

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

        console.log('Logged in. Waiting for data...');
        // Wait for user data
        for (let i = 0; i < 30; i++) {
            if (userData) break;
            await page.waitForTimeout(500);
        }

        // Wait a bit more for leaderboard data if not yet captured
        if (userData && !leaderboardData) {
            console.log('Waiting for leaderboard data...');
            for (let i = 0; i < 10; i++) {
                if (leaderboardData) break;
                await page.waitForTimeout(500);
            }
        }

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
            // Merge leaderboard data if available
            if (leaderboardData) {
                // Try to find tier in leaderboard data and attach to userData
                // Structure seen: { leaderboard: { active_contest: { tier: 9 } } }
                // or { active: { ... } } depending on endpoint

                // If it matches the structure we saw in logs:
                if (leaderboardData.tier !== undefined) {
                    userData.tier = leaderboardData.tier;
                } else if (leaderboardData.leaderboard?.active_contest?.tier !== undefined) {
                    userData.tier = leaderboardData.leaderboard.active_contest.tier;
                }
            }

            // Gems
            status.gems = getGems(userData);

            // Streak
            status.streak = getStreak(userData);

            // Languages (Available & Current)
            status.availableLanguages = getAvailableLanguages(userData);

            // Current Language
            status.currentLanguage = getCurrentLanguage(userData);

            // Current League
            status.currentLeague = getCurrentLeague(userData);

            // Daily Quests
            status.dailyQuests = getDailyQuests(userData);

            // Skill Path (Units)
            status.units = getSkillPath(userData);
        } else {
            status.error = "Failed to capture network data";
        }

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
