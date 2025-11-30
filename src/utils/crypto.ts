import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
    if (!ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY is not set in .env file');
    }

    if (ENCRYPTION_KEY.length === 64 && /^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY)) {
        return Buffer.from(ENCRYPTION_KEY, 'hex');
    } else if (ENCRYPTION_KEY.length === 32) {
        return Buffer.from(ENCRYPTION_KEY, 'utf8');
    } else {
        throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes) or 32-character string.');
    }
}

export function encryptFile(inputPath: string, outputPath: string): void {
    const key = getKey();

    if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found at ${inputPath}`);
    }

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileContent = fs.readFileSync(inputPath);
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(fileContent), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Format: IV (12 bytes) + Auth Tag (16 bytes) + Encrypted Data
    const output = Buffer.concat([iv, authTag, encrypted]);

    fs.writeFileSync(outputPath, output);
}

export function decryptFile(inputPath: string, outputPath: string): void {
    const key = getKey();

    if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found at ${inputPath}`);
    }

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileContent = fs.readFileSync(inputPath);

    // Extract IV, Auth Tag, and Encrypted Data
    // IV (12 bytes) + Auth Tag (16 bytes) + Encrypted Data
    if (fileContent.length < 12 + 16) {
        throw new Error('File is too short to be a valid encrypted file');
    }

    const iv = fileContent.subarray(0, 12);
    const authTag = fileContent.subarray(12, 28);
    const encrypted = fileContent.subarray(28);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    fs.writeFileSync(outputPath, decrypted);
}
