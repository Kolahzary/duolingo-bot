import { Page, Locator } from 'playwright';

export interface VisibleToken {
    dataTest: string;
    text: string;
    element: Locator;
    cleanInnerText: string;
}

/**
 * Normalizes text for comparison (remove special chars, lowercase).
 * Supports extended Latin characters including Turkish.
 */
export function normalize(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F]/g, '');
}

/**
 * Extracts all visible challenge tokens from the page.
 */
export async function getVisibleTokens(page: Page): Promise<VisibleToken[]> {
    const tokens = await page.locator('button[data-test*="-challenge-tap-token"]').all();
    const visibleTokens: VisibleToken[] = [];

    for (const token of tokens) {
        if (await token.isVisible()) {
            if (await token.getAttribute('aria-disabled') === 'true') continue;

            const dataTest = await token.getAttribute('data-test');
            const innerText = await token.innerText();
            const cleanInnerText = innerText.replace(/^\d+\s*\n?/, '').trim();

            if (dataTest) {
                const match = dataTest.match(/^(.*)-challenge-tap-token(?:\s+(.*))?$/);
                if (match) {
                    visibleTokens.push({
                        dataTest,
                        text: match[1],
                        element: token,
                        cleanInnerText
                    });
                }
            }
        }
    }

    return visibleTokens;
}
