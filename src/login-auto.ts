import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { createLogDirectory } from './utils/logger.js';
import { isLoggedIn, getStatePath, ensureStateExists } from './utils/auth.js';
import { startNetworkLogging } from './utils/network.js';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

(async () => {
    const username = process.env.DUOLINGO_USERNAME || process.env.DUOLINGO_EMAIL;
    const password = process.env.DUOLINGO_PASSWORD;

    console.log('Initializing browser for auto login...');
    const isHeadless = process.env.HEADLESS === 'true' || process.env.CI === 'true';
    const browser = await chromium.launch({
        headless: isHeadless,
    });

    const storageStatePath = getStatePath();
    const logDir = createLogDirectory('login-auto');
    console.log(`Log directory: ${logDir}`);

    // Check for --force-login flag or FORCE_LOGIN env var
    const args = process.argv.slice(2);
    const forceLogin = args.includes('--force-login') || args.includes('--no-cache') || process.env.FORCE_LOGIN === 'true';

    if (forceLogin) {
        console.log('🧹 --force-login flag detected. Clearing existing session state...');
        if (fs.existsSync(storageStatePath)) {
            fs.unlinkSync(storageStatePath);
            console.log('Existing state file deleted.');
        }
    }

    const contextOptions: any = {
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    if (!forceLogin) {
        // Check for state or encrypted backup
        const validStatePath = ensureStateExists();
        if (validStatePath) {
            console.log(`📂 Found existing state at: ${validStatePath}`);
            contextOptions.storageState = validStatePath;
        }
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    await startNetworkLogging(page, logDir);

    try {
        console.log('Navigating to Duolingo...');
        await page.goto('https://www.duolingo.com/');
        await page.screenshot({ path: path.join(logDir, '01_home.png') });

        // Handle Cookie Banner
        try {
            const acceptCookies = page.getByText('I ACCEPT').or(page.locator('[data-test="cookie-banner-accept-button"]'));
            if (await acceptCookies.isVisible()) {
                console.log('Accepting cookies...');
                await acceptCookies.first().click();
                await new Promise(r => setTimeout(r, 1000)); // Wait for banner to disappear
            }
        } catch (e) {
            // Ignore if no cookie banner
        }

        if (await isLoggedIn(page)) {
            console.log('✅ Already logged in!');
            // Ensure state is saved/updated even if we just loaded it, to keep it fresh if needed
            await context.storageState({ path: storageStatePath });
            console.log(`State saved/verified at: ${storageStatePath}`);
            await browser.close();
            process.exit(0);
        } else {
            console.log('Not logged in (or session expired). Proceeding with login...');

            if (!username || !password) {
                console.error('❌ Error: Not logged in, and DUOLINGO_EMAIL/PASSWORD are not set in .env file.');
                console.error('Please set them to allow re-login.');
                await browser.close();
                process.exit(1);
            }
        }

        console.log('Clicking "I ALREADY HAVE AN ACCOUNT"...');
        // The button usually says "I ALREADY HAVE AN ACCOUNT"
        // We can look for the test id or text.
        // Based on common Duolingo flows, it's often [data-test="have-account"]
        await page.locator('[data-test="have-account"]').click({
            steps: 10
        });

        console.log('Waiting for login form...');
        // Wait for email/password inputs
        await page.waitForSelector('[data-test="email-input"]');
        await page.screenshot({ path: path.join(logDir, '02_login_form.png') });


        console.log('Filling credentials...');
        const usernameField = page.locator('[data-test="email-input"]');
        const passwordField = page.locator('[data-test="password-input"]');
        await usernameField.pressSequentially(username, { delay: 80 });
        await passwordField.pressSequentially(password, { delay: 120 });

        console.log('Submitting login...');

        // Try to find the login button. It might be "register-button" or "login-button"
        const loginButton = page.locator('[data-test="login-button"]').or(page.locator('[data-test="register-button"]'));
        await loginButton.first().click({ steps: 10 });

        console.log('Waiting for login to complete...');

        // Wait up to 30 seconds for login detection
        let attempts = 0;
        while (attempts < 30) {
            if (await isLoggedIn(page)) {
                console.log('✅ Login successful!');
                await page.screenshot({ path: path.join(logDir, '03_logged_in.png') });

                await context.storageState({ path: storageStatePath });
                console.log(`State saved to: ${storageStatePath}`);

                await browser.close();
                process.exit(0);
            }

            // Check for error message
            // Common error selector: [data-test="form-error-message"] or similar?
            // We can check for text "Incorrect password" or "User not found"
            const errorText = await page.getByText('Incorrect password').or(page.getByText('User not found')).isVisible().catch(() => false);
            if (errorText) {
                console.error('❌ Login failed: Incorrect credentials.');
                await page.screenshot({ path: path.join(logDir, '04_failed_credentials.png') });
                await browser.close();
                process.exit(1);
            }

            await new Promise(r => setTimeout(r, 1000));
            attempts++;
        }

        console.error('❌ Login timed out or failed.');
        await page.screenshot({ path: path.join(logDir, '04_failed_timeout.png') });

        // Check for CAPTCHA
        const captchaFrame = page.frames().find(f => f.url().includes('recaptcha'));
        const captchaBadge = await page.locator('.grecaptcha-badge').isVisible().catch(() => false);

        if (captchaFrame || captchaBadge) {
            console.log('ℹ️  CAPTCHA elements detected on page.');
            // Only consider it a blocker if we are definitely not logged in and timed out.
            // But since we timed out, it's possible.
            console.warn('⚠️  If the browser is open and you see a CAPTCHA challenge, please solve it manually.');
        }

        // Dump HTML for debugging
        const html = await page.content();
        fs.writeFileSync(path.join(logDir, 'failed_state.html'), html);

        await browser.close();
        process.exit(1);

    } catch (error) {
        console.error('An error occurred:', error);
        await page.screenshot({ path: path.join(logDir, 'error.png') });
        await browser.close();
        process.exit(1);
    }
})();
