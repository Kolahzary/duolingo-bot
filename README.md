# Duolingo Bot

A Playwright-based bot to automate Duolingo interactions and maintain your streak.

## Motivation

Duolingo is a fantastic app for learning languages. However, the gamification mechanics—specifically the streak—can sometimes have the opposite effect. Instead of being a motivating tool for learning, it can become a daily chore. Many users find themselves logging in just to "keep the streak alive," focusing on the number rather than the actual learning.

The app transforms from a helpful educational tool into a source of anxiety, where you commit time solely to avoid losing your progress. If you find yourself in this position—enslaved by the streak and not using Duolingo for its intended purpose—this script is for you.

Consider this your path to freedom. Keep your streak, but reclaim your time.

## TLDR; How can I automate my streak protection?

1.  **Fork the repository** and clone your fork locally.
2.  **Authenticate**: Follow the [Secure Authentication Setup](#secure-authentication-setup) guide below to generate your encrypted state.
3.  **Configure Schedule**: Optionally, customize the cron schedule in `.github/workflows/streak-keeper.yml` to run whenever you like.

### Secure Authentication Setup

To run the bot in GitHub Actions, you need to securely provide your authentication state.

1.  **Generate an ENCRYPTION_KEY secret**:
    - Generate a strong password (at least 32 characters).
    - Save it in your GitHub repository's **Settings > Secrets and variables > Actions** as `ENCRYPTION_KEY`.
    - Also add it to your local `.env` file.

2.  **Login locally**:
    - Run `pnpm run login-manual` to log in to Duolingo.
    - This will verify your credentials and save your session state locally.

3.  **Encrypt your state**:
    - Run `pnpm run encrypt-state` to generate an encrypted version of your session (`assets/state.bin`).
    - This file is safe to commit because it can only be decrypted with your `ENCRYPTION_KEY`.

4.  **Push your changes**:
    - Commit and push the generated `assets/state.bin` to your repository.


## Features

- **Auto Login**: Automatically logs in using credentials from `.env`.
- **Manual Login**: Helper script to log in manually and save the session state (useful for CAPTCHAs).
- **Login Verification**: Verifies if the saved session state is still valid.
- **State Management**: Saves browser state (cookies, local storage) to avoid repeated logins.
- **State Encryption**: Encrypts the session state for secure storage and portability.

## Prerequisites

- Node.js (v24 or higher) - managed via `fnm`
- pnpm - managed via `corepack`

## Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd duolingo-bot
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Duolingo credentials:
    ```env
    DUOLINGO_EMAIL=your_email@example.com
    DUOLINGO_PASSWORD=your_password
    ENCRYPTION_KEY=your_32_char_encryption_key # Optional: For encrypting/decrypting state
    HEADLESS=true # Optional: Set to false to see the browser
    ```

## Usage

### 1. Start Practice (Default)
Run the automated practice bot. This will use the saved state (or log in if needed) and solve practice lessons.
```bash
pnpm start
```
or
```bash
pnpm run practice
```

### 2. Manual Login (Recommended First Step)
Run this command to open a browser window. Log in to Duolingo manually. The script will detect when you are logged in and save the session state.
```bash
pnpm run login-manual
```
*Note: This is useful if you encounter CAPTCHAs or 2FA.*

### 3. Auto Login
Attempt to log in automatically using the credentials in `.env`.
```bash
pnpm run login-auto
```

### 4. Verify Login
Check if the currently saved session state is valid.
```bash
pnpm run login-verify
```

### 5. Get Status
Get your current Duolingo status including gems, streak, league, and learning progress.
```bash
pnpm run get-status
```
This will save a detailed status report to `logs/<timestamp>_get-status/status.json` with:
- Global stats: gems, streak, todaysStreakCompleted, league, dailyQuests, availableLanguages
- Language-specific data: current language name and learning path units

**Get All Languages:**
To fetch data for **all** your learning languages in a single run:
```bash
pnpm run get-status -- --all
```
This will iterate through every language you are learning and aggregate the data into `status.json`.


### 6. Switch Language
Switch your active learning language.
```bash
pnpm run switch-language -- <language-name>
```
Examples:
```bash
pnpm run switch-language -- Turkish
pnpm run switch-language -- Spanish
pnpm run switch-language -- French
pnpm run switch-language -- Esperanto
```

**Note:** Use the full language name as it appears in Duolingo (e.g., "Turkish", not "tr").

### 7. Start Manual Session
Open a browser with the saved session state to interact with Duolingo manually.
```bash
pnpm run start-manual
```

### 8. State Encryption
Encrypt your `storageState.json` to `assets/state.bin` for secure backup or transfer.
```bash
pnpm run encrypt-state
```

### 9. State Decryption
Decrypt `assets/state.bin` to `state/storageState.json`. Useful if you are restoring a session on a new machine.
```bash
pnpm run decrypt-state
```

## Security

Your account security is paramount. If you follow the instructions above, your account is safe.

-   **Encryption**: The `state.bin` file is encrypted using AES-256-GCM, a military-grade encryption standard.
-   **Private Key**: It can **only** be decrypted using your unique `ENCRYPTION_KEY`.
-   **No Exposure**: This key exists only on your local machine and in your private GitHub Secrets. It is never committed to the repository.

Even if someone forks your repository or downloads your `state.bin`, they **cannot** access your Duolingo account without your private key.


## Project Structure

- `src/practice.ts`: Main entry point for the practice bot.
- `src/login-manual.ts`: Script for manual login and state saving.
- `src/login-auto.ts`: Script for automated login.
- `src/login-verify.ts`: Script to verify login status.
- `src/get-status.ts`: Script to get current Duolingo status and progress.
- `src/switch-language.ts`: Script to switch active learning language.
- `src/start-manual.ts`: Script to launch browser with saved state.
- `src/scripts/`: Helper scripts for state encryption/decryption.
- `src/utils/`: Shared utilities for authentication, logging, data extraction, and browser config.
- `src/interfaces/`: TypeScript interfaces for Duolingo API data structures.
- `state/`: Directory where browser state (`storageState.json`) is saved (gitignored).
- `assets/`: Directory for encrypted state (`state.bin`) and other static assets.
- `logs/`: Directory for execution logs and screenshots (gitignored).

## License

ISC
