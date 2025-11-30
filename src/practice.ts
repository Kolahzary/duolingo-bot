import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { getStatePath, waitForLogin } from './utils/auth.js';
import { startNetworkLogging, captureSessionData } from './utils/network.js';
import { Session } from './interfaces/index.js';
import { solveVisibleTokens } from './utils/solver.js';
import { startWordsLesson } from './utils/navigation.js';

dotenv.config();

(async () => {
    console.log('Starting practice session...');

    const storageStatePath = getStatePath();
    if (!fs.existsSync(storageStatePath)) {
        console.error('❌ No saved state found. Please login first.');
        process.exit(1);
    }

    const browser = await chromium.launch({ headless: false });
    const logDir = createLogDirectory('practice');
    let page: Page | null = null;

    try {
        const context = await browser.newContext({
            storageState: storageStatePath,
            viewport: { width: 1280, height: 720 },
        });
        page = await context.newPage();

        await startNetworkLogging(page, logDir);

        await page.goto('https://www.duolingo.com/learn', { waitUntil: 'domcontentloaded' });

        if (!await waitForLogin(page)) {
            console.error('❌ Not logged in.');
            await browser.close();
            process.exit(1);
        }

        const sessionDataPromise = captureSessionData(page, 30000);

        // Use the new navigation utility
        await startWordsLesson(page);

        console.log('Waiting for session data...');
        const sessionData: Session = await sessionDataPromise;
        if (!sessionData || !sessionData.challenges) {
            console.error('❌ Failed to capture session data.');
            await browser.close();
            process.exit(1);
        }

        fs.writeFileSync(path.join(logDir, 'session_data.json'), JSON.stringify(sessionData, null, 2));

        // Identify and Solve Loop
        while (true) {
            try {
                // 2. Solve visible tokens
                const actionTaken = await solveVisibleTokens(page, sessionData);

                if (!actionTaken) {
                    // 1. Try to click "Continue" button (End of session or next section)
                    const continueButton = page.locator('[data-test="player-next"]');
                    if (await continueButton.isVisible()) {
                        await continueButton.click();
                    }

                    // Check for Start button directly
                    const startButton = page.getByRole('button', { name: /START|REVIEW/i });
                    if (await startButton.isVisible()) {
                        console.log('Start button detected. Session complete!');
                        break;
                    }

                    try {
                        await page.locator('button[data-test*="-challenge-tap-token"]').first().waitFor({ state: 'visible', timeout: 1000 });
                    } catch (e) { }
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

