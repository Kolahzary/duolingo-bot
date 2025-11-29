import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface NetworkLogEntry {
    timestamp: string;
    url: string;
    method: string;
    requestHeaders: Record<string, string>;
    requestPostData?: string | null;
    responseStatus: number;
    responseHeaders: Record<string, string>;
    responseBody: any;
}

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
