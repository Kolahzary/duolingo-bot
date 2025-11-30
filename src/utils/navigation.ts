import { Page } from 'playwright';

/**
 * Navigates to the Practice Hub and starts the "Words" lesson.
 * Handles navigation, button clicks, and robust Start button interaction.
 */
export async function startWordsLesson(page: Page): Promise<void> {
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
    await wordsButton.waitFor({ timeout: 10000 });
    console.log('Clicking Words button...');
    await wordsButton.click({ force: true });

    // Wait for potential start button or lesson load
    try {
        const startButton = page.getByRole('button', { name: /START|REVIEW/i }).first();

        if (await startButton.isVisible({ timeout: 5000 })) {
            console.log('Start button visible, clicking...');

            // Ensure it's in view and enabled
            await startButton.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000); // Stability delay
            await startButton.waitFor({ state: 'visible', timeout: 2000 });

            // Try standard click first
            try {
                await startButton.click({ timeout: 3000 });
            } catch (e) {
                console.log('Standard click failed, trying JS click...');
                await startButton.evaluate(node => (node as HTMLElement).click());
            }

            // Wait for navigation or session start
            try {
                await Promise.race([
                    page.waitForURL(/.*\/lesson.*/, { timeout: 10000 }),
                    page.waitForResponse(resp => resp.url().includes('/sessions') && resp.request().method() === 'POST', { timeout: 10000 })
                ]);
            } catch (e) {
                console.log('Navigation wait timed out, but proceeding...');
            }
        }
    } catch (e) {
        console.log('Start button interaction failed:', e);
    }
}
