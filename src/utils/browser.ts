import { LaunchOptions, BrowserContextOptions } from 'playwright';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in root
dotenv.config({ path: path.join(__dirname, '../../.env') });

export function getBrowserConfig(): LaunchOptions {
    const isHeadless = process.env.HEADLESS === 'true' || process.env.CI === 'true';
    return {
        headless: isHeadless,
    };
}

export function getContextOptions(): BrowserContextOptions {
    return {
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };
}
