import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function isLoggedIn(page: Page): Promise<boolean> {
    try {
        // Check for multiple possible logged-in indicators
        const homeNav = page.locator('[data-test="home-nav"]');
        const profileTab = page.locator('[data-test="profile-tab"]');
        const learnLink = page.locator('[data-test="learn-nav-link"]');

        return await homeNav.isVisible() || await profileTab.isVisible() || await learnLink.isVisible();
    } catch (e) {
        return false;
    }
}

export function ensureStateDir(): string {
    const stateDir = path.join(__dirname, '../../state');
    if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
    }
    return stateDir;
}

export function getStatePath(): string {
    return path.join(ensureStateDir(), 'storageState.json');
}

/**
 * Wait for login check with polling
 * @param page - Playwright page object
 * @param maxRetries - Maximum number of retries (default: 10)
 * @param retryDelayMs - Delay between retries in milliseconds (default: 1000)
 * @returns Promise<boolean> - true if logged in, false otherwise
 */
export async function waitForLogin(page: Page, maxRetries: number = 10, retryDelayMs: number = 1000): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
        if (await isLoggedIn(page)) {
            return true;
        }
        await new Promise(r => setTimeout(r, retryDelayMs));
    }
    return false;
}
