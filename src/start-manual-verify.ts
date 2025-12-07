import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { getStatePath } from './utils/auth.js';
import { getBrowserConfig, getContextOptions } from './utils/browser.js';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

(async () => {
    console.log('Starting browser for manual verification...');
    const config = getBrowserConfig();
    config.headless = false; // Force headful
    const browser = await chromium.launch(config);

    const storageStatePath = getStatePath();
    const logDir = createLogDirectory('start-manual-verify');
    console.log(`Log directory: ${logDir}`);

    const baseContextOptions = getContextOptions();
    const contextOptions: any = { ...baseContextOptions };

    if (fs.existsSync(storageStatePath)) {
        console.log(`Loading state from: ${storageStatePath}`);
        contextOptions.storageState = storageStatePath;
    } else {
        console.log('No saved state found. Starting with fresh session.');
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    try {
        console.log('Navigating to Duolingo...');

        // Inject Duolingo-PRO userscript
        const scriptPath = 'src/scripts/duolingo-pro.js';
        if (fs.existsSync(scriptPath)) {
            console.log(`Injecting userscript from: ${scriptPath}`);
            await page.addInitScript({ path: scriptPath });
        } else {
            console.warn(`Userscript not found at: ${scriptPath}`);
        }

        await page.goto('https://www.duolingo.com/', { waitUntil: 'domcontentloaded' });

        // 1. Check if Toolbar exists
        console.log('Waiting for toolbar to appear...');
        const toolbarSelector = '.DLP_Main';
        try {
            await page.waitForSelector(toolbarSelector, { timeout: 10000 });
            console.log('Toolbar found!');
        } catch (e) {
            console.error('Toolbar NOT found within 10s.');
            throw e;
        }

        // 2. Take Screenshot of Toolbar
        const screenshotPath1 = path.join(logDir, 'verify-toolbar-before.png');
        await page.screenshot({ path: screenshotPath1 });
        console.log(`Screenshot saved: ${screenshotPath1}`);

        // 3. Switch to Legacy Mode if needed
        const practiceSelector = '#DLP_Get_PRACTICE_1_ID';
        const isPracticeVisible = await page.isVisible(practiceSelector);

        if (!isPracticeVisible) {
            console.log('Practice section not visible. Attempting to switch to Legacy mode...');
            const legacySwitchSelector = '#DLP_Switch_Legacy_Button_1_ID';
            if (await page.isVisible(legacySwitchSelector)) {
                await page.click(legacySwitchSelector);
                console.log('Clicked "Switch to Legacy". Waiting for Practice section...');
                await page.waitForSelector(practiceSelector, { timeout: 10000 });
                console.log('Legacy mode active.');
            } else {
                console.warn('Could not find Switch to Legacy button, but Practice also not visible. Script might fail.');
            }
        } else {
            console.log('Practice section already visible.');
        }

        // 4. Enter '1' in Practices
        console.log('Entering "1" into Practice field...');
        const inputSelector = `${practiceSelector} input`;
        await page.fill(inputSelector, '1');

        // 5. Watch Practice
        console.log('Clicking START...');
        const startButtonSelector = `${practiceSelector} #DLP_Inset_Button_1_ID`;

        // Note: There might be multiple Inset Buttons inside the practice block? 
        // Based on the HTML, there is one input wrapper and one button wrapper in hierarchy.
        // #DLP_Get_PRACTICE_1_ID > .DLP_HStack_8 > #DLP_Inset_Button_1_ID (The button)

        await page.click(startButtonSelector);

        console.log('Waiting for practice to complete...');
        // We expect the URL to change to a lesson URL, then back to home.
        // Or we just wait for a while if it's an overlay. 
        // Assuming standard Duolingo behavior: it navigates to /lesson/...

        try {
            // Wait for navigation away from home, or for a specific "Learning" state
            // Let's rely on the URL changing from duolingo.com to duolingo.com/lesson...
            // However, with the PRO script, it might be auto-solving fast.
            // Let's wait for a return to the homepage with the toolbar visible again.

            // Wait for navigation away from home
            const getIsHome = () => page.url() === 'https://www.duolingo.com/' || page.url() === 'https://www.duolingo.com/learn';

            console.log('Waiting for navigation away from home...');
            await page.waitForFunction(() => location.href !== 'https://www.duolingo.com/' && location.href !== 'https://www.duolingo.com/learn', { timeout: 10000 }).catch(() => console.log('Timeout waiting for navigation start.'));

            if (!getIsHome()) {
                console.log(`Practice started. Current URL: ${page.url()}`);
                console.log('Waiting for return to home (up to 60s)...');
                await page.waitForURL((url) => url.href === 'https://www.duolingo.com/' || url.href === 'https://www.duolingo.com/learn', { timeout: 60000 });
                console.log('Returned to home.');
            } else {
                console.log('URL did not change. Maybe overlay? Waiting 10s...');
                await page.waitForTimeout(10000);
            }
            console.log(`Current URL after wait: ${page.url()}`);

        } catch (e) {
            console.log('Warning: Navigation flow detection might have timed out or differed. Continuing check.');
        }

        // 6. Final Check
        console.log('Verifying successful return...');
        await page.waitForSelector(toolbarSelector, { timeout: 10000 });

        const screenshotPath2 = path.join(logDir, 'verify-toolbar-after.png');
        await page.screenshot({ path: screenshotPath2 });
        console.log(`Final screenshot saved: ${screenshotPath2}`);

        console.log('Test complete!');
        await browser.close();
        process.exit(0);

    } catch (error) {
        console.error('An error occurred during verification:', error);
        await page.screenshot({ path: path.join(logDir, 'error-screenshot.png') });
        if (browser.isConnected()) {
            await browser.close();
        }
        process.exit(1);
    }
})();
