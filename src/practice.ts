import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { getStatePath, waitForLogin, ensureStateExists } from './utils/auth.js';
import { startNetworkLogging, captureUserData } from './utils/network.js';
import { solveVisibleTokens } from './utils/solver.js';
import { startWordsLesson } from './utils/navigation.js';
import { getCurrentLanguage, selectLanguage } from './utils/homepage.js';
import { getBrowserConfig, getContextOptions } from './utils/browser.js';

dotenv.config();

(async () => {
    console.log('Starting practice session...');

    const storageStatePath = getStatePath();
    const validStatePath = ensureStateExists();
    if (!validStatePath) {
        console.error('❌ No saved state found. Please login first.');
        process.exit(1);
    }

    const browser = await chromium.launch(getBrowserConfig());
    const logDir = createLogDirectory('practice');
    let page: Page | null = null;

    try {
        const context = await browser.newContext({
            ...getContextOptions(),
            storageState: storageStatePath,
        });
        page = await context.newPage();

        await startNetworkLogging(page, logDir);

        const userDataPromise = captureUserData(page);
        await page.goto('https://www.duolingo.com/learn', { waitUntil: 'domcontentloaded' });

        if (!await waitForLogin(page)) {
            console.error('❌ Not logged in.');
            await browser.close();
            process.exit(1);
        }

        const userData = await userDataPromise;
        if (!userData) {
            console.error('❌ Failed to capture user data.');
            await browser.close();
            process.exit(1);
        }

        // Language Switch Logic
        const targetLanguage = process.env.PRACTICE_LANGUAGE;
        if (targetLanguage) {
            const currentLanguage = getCurrentLanguage({ userData, leaderboardData: null });

            if (currentLanguage !== targetLanguage) {
                console.log(`Current language: ${currentLanguage}`);
                console.log(`Switching to ${targetLanguage}...`);
                await selectLanguage(page, targetLanguage);
            }
        }

        const sessionData = await startWordsLesson(page);
        if (!sessionData || !sessionData.challenges) {
            console.error('❌ Failed to capture session data.');
            await browser.close();
            process.exit(1);
        }

        fs.writeFileSync(path.join(logDir, 'session_data.json'), JSON.stringify(sessionData, null, 2));

        // Identify and Solve Loop
        while (true) {
            try {
                // // 1. Try to click "Continue" button (End of session or next section)
                const continueButton = page.locator('[data-test="player-next"]');
                if (await continueButton.isVisible()) {
                    await continueButton.click();
                }

                // 2. Solve visible tokens
                const solvedCount = await solveVisibleTokens(page, sessionData);
                console.log(`Solved ${solvedCount} tokens.`);

                // Check for Start button directly
                const startButton = page.getByRole('button', { name: /START|REVIEW/i });
                if (await startButton.isVisible()) {
                    console.log('Start button detected. Session complete!');
                    break;
                }
            } catch (e: any) {
                if (e.message && e.message.includes('Target page, context or browser has been closed')) {
                    break;
                }
                console.error('Error in loop:', e);
            }
        }

        console.log('Session loop ended.');
        await page.screenshot({ path: path.join(logDir, 'session_completed.png') });
        await browser.close();

    } catch (error) {
        console.error('An error occurred:', error);
        if (page) {
            try {
                const html = await page.content();
                fs.writeFileSync(path.join(logDir, 'error_state.html'), html);
                await page.screenshot({ path: path.join(logDir, 'error.png') });
            } catch (e) { }
        }
        await browser.close();
        process.exit(1);
    }
})();

