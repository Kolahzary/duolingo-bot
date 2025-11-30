import { Page } from 'playwright';
import { captureSessionData } from './network';
import { Session } from '../interfaces';

/**
 * Navigates to the Practice Hub and starts the "Words" lesson.
 * Handles navigation, button clicks, and robust Start button interaction.
 */
export async function startWordsLesson(page: Page): Promise<Session | null> {
    console.log('Navigating to Words lesson...');

    // Navigate to Learn page if not already there
    if (!page.url().includes('/learn')) {
        await page.goto('https://www.duolingo.com/learn', { waitUntil: 'domcontentloaded' });
    }

    // Click Practice Hub navigation item
    const practiceHubNav = page.locator('[data-test="practice-hub-nav"]');
    await practiceHubNav.waitFor({ timeout: 10000 });
    await practiceHubNav.click();


    // Click "Words" collection button
    const wordsButton = page.locator('[data-test="practice-hub-collection-button"]').filter({ hasText: 'Words' });
    await wordsButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Clicking Words button...');
    await wordsButton.click();
    await wordsButton.waitFor({ state: 'hidden', timeout: 10000 });
    const sessionDataPromise = captureSessionData(page, 30000);

    const startButton = page.getByRole('button', { name: /START|REVIEW/i }).first();
    console.log('Clicking Start button...');
    await startButton.waitFor({ timeout: 10000 });
    await startButton.click();
    await startButton.waitFor({ state: 'hidden', timeout: 10000 });

    return await sessionDataPromise;
}
