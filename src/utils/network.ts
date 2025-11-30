import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { UserData, LeaderboardData, NetworkLogEntry } from '../interfaces/index.js';

export async function startNetworkLogging(page: Page, logDir: string) {
    const networkLogFile = path.join(logDir, 'network_logs.json');
    const logs: NetworkLogEntry[] = [];

    // Initial write
    fs.writeFileSync(networkLogFile, JSON.stringify(logs, null, 2));

    page.on('response', async (response) => {
        try {
            const url = response.url();

            // Filter out cloudflare.net, cloudfront.net, cookielaw.org, onetrust.com, and sentry.io
            if (url.includes('cloudflare.net') ||
                url.includes('cloudfront.net') ||
                url.includes('cookielaw.org') ||
                url.includes('onetrust.com') ||
                url.includes('sentry.io')) return;

            const contentType = response.headers()['content-type'] || '';

            if (contentType.includes('application/json')) {
                let buffer;
                try {
                    buffer = await response.body();
                } catch (e) {
                    // Response might be closed or unavailable
                    return;
                }

                if (buffer.length === 0) return;

                let responseBody: any;
                try {
                    responseBody = JSON.parse(buffer.toString());
                } catch (e) {
                    responseBody = buffer.toString(); // Fallback to string if not valid JSON
                }

                const request = response.request();

                const entry: NetworkLogEntry = {
                    timestamp: new Date().toISOString(),
                    url: url,
                    method: request.method(),
                    requestHeaders: request.headers(),
                    requestPostData: request.postData(),
                    responseStatus: response.status(),
                    responseHeaders: response.headers(),
                    responseBody: responseBody
                };

                logs.push(entry);

                // Write to file (debouncing could be added for performance, but sync write is safer for short scripts)
                // We read the file first to ensure we don't overwrite if multiple contexts were writing (though here it's single context)
                // Actually, just overwriting with the in-memory array is fine for this single-script usage.
                try {
                    fs.writeFileSync(networkLogFile, JSON.stringify(logs, null, 2));
                } catch (writeErr) {
                    console.error('Error writing network log file:', writeErr);
                }
            }
        } catch (e) {
            console.error('Error logging network response:', e);
        }
    });
}

/**
 * Capture user data from network responses
 * Sets up network interception and waits for user data to be captured
 */
export async function captureUserData(page: Page, timeoutMs: number = 7500): Promise<UserData | null> {
    return new Promise((resolve) => {
        let userData: UserData | null = null;
        let resolved = false;

        const responseHandler = async (response: any) => {
            if (resolved) return;

            const url = response.url();
            if (url.includes('/users/') && url.includes('fields=')) {
                try {
                    const json = await response.json();
                    if (json.currentCourseId && json.courses) {
                        userData = json;
                        resolved = true;
                        page.off('response', responseHandler);
                        resolve(userData);
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        };

        page.on('response', responseHandler);

        // Timeout fallback
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                page.off('response', responseHandler);
                resolve(userData);
            }
        }, timeoutMs);
    });
}

/**
 * Capture leaderboard data from network responses
 * Sets up network interception and waits for leaderboard data to be captured
 * Prioritizes active contest data over inactive data
 */
export async function captureLeaderboardData(page: Page, timeoutMs: number = 7500): Promise<LeaderboardData | null> {
    return new Promise((resolve) => {
        let leaderboardData: LeaderboardData | null = null;
        let resolved = false;

        const responseHandler = async (response: any) => {
            if (resolved) return;

            const url = response.url();
            if (url.includes('duolingo-leaderboards-prod.duolingo.com') && url.includes('/leaderboards/')) {
                try {
                    const json = await response.json();
                    if (json.leaderboard || json.active) {
                        // Prioritize active contest data
                        if (!leaderboardData || (json.active && !leaderboardData.active)) {
                            leaderboardData = json;
                        }
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        };

        page.on('response', responseHandler);

        // Timeout fallback
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                page.off('response', responseHandler);
                resolve(leaderboardData);
            }
        }, timeoutMs);
    });
}

/**
 * Capture session data from network responses
 * Sets up network interception and waits for session data to be captured
 */
export async function captureSessionData(page: Page, timeoutMs: number = 15000): Promise<any | null> {
    return new Promise((resolve) => {
        let sessionData: any = null;
        let resolved = false;

        const responseHandler = async (response: any) => {
            if (resolved) return;

            const url = response.url();
            if (url.includes('/sessions') && response.request().method() === 'POST') {
                try {
                    const json = await response.json();
                    if (json.challenges) {
                        sessionData = json;
                        resolved = true;
                        page.off('response', responseHandler);
                        resolve(sessionData);
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        };

        page.on('response', responseHandler);

        // Timeout fallback
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                page.off('response', responseHandler);
                resolve(sessionData);
            }
        }, timeoutMs);
    });
}
