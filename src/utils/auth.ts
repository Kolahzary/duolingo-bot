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
