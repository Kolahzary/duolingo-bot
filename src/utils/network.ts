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
                const requestPostData = sanitize(request.postData());

                const entry: NetworkLogEntry = {
                    timestamp: new Date().toISOString(),
                    url: url,
                    method: request.method(),
                    requestHeaders: sanitizeHeaders(request.headers()),
                    requestPostData: requestPostData,
                    responseStatus: response.status(),
                    responseHeaders: sanitizeHeaders(response.headers()),
                    responseBody: sanitizeObject(responseBody)
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

function sanitize(data: string | null): string | null {
    if (!data) return null;
    try {
        const json = JSON.parse(data);
        const sanitized = sanitizeObject(json);
        return JSON.stringify(sanitized);
    } catch (e) {
        // Not JSON or failed to parse, keep original
    }
    return data;
}

function sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sensitiveKeys = ['password', 'identifier', 'token', 'email', 'jwt', 'shopitems'];
    const sanitized: any = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const lowerKey = key.toLowerCase();
            if (sensitiveKeys.includes(lowerKey) || lowerKey.includes('jwt')) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
    }

    return sanitized;
}

function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie', 'jwt'];
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
        if (sensitiveHeaders.includes(key.toLowerCase()) || key.toLowerCase().includes('jwt')) {
            sanitized[key] = '[REDACTED]';
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
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
export async function captureSessionData(page: Page, timeoutMs: number = 15000, expectedType = "SPECIFIED_MATCH_PRACTICE"): Promise<any | null> {
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

                        if (sessionData.type == expectedType) {
                            console.log("Session data captured");
                            resolved = true;
                            page.off('response', responseHandler);
                            resolve(sessionData);
                        } else {
                            console.log(`Session data captured, but not expected type: ${sessionData.type}`);
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
                resolve(sessionData);
            }
        }, timeoutMs);
    });
}
