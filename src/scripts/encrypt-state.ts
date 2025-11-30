import * as path from 'path';
import { fileURLToPath } from 'url';
import { encryptFile } from '../utils/crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATE_DIR = path.join(__dirname, '../../state');
const ASSETS_DIR = path.join(__dirname, '../../assets');
const INPUT_FILE = path.join(STATE_DIR, 'storageState.json');
const OUTPUT_FILE = path.join(ASSETS_DIR, 'state.bin');

try {
    encryptFile(INPUT_FILE, OUTPUT_FILE);
    console.log(`Successfully encrypted ${INPUT_FILE} to ${OUTPUT_FILE}`);
} catch (error) {
    console.error('Encryption failed:', error instanceof Error ? error.message : error);
    process.exit(1);
}
