# Duolingo Bot

A Playwright-based bot to automate Duolingo interactions and maintain your streak.

## Features

- **Auto Login**: Automatically logs in using credentials from `.env`.
- **Manual Login**: Helper script to log in manually and save the session state (useful for CAPTCHAs).
- **Login Verification**: Verifies if the saved session state is still valid.
- **State Management**: Saves browser state (cookies, local storage) to avoid repeated logins.

## Prerequisites

- Node.js (v18 or higher)
- pnpm

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
    ```

## Usage

### 1. Manual Login (Recommended First Step)
Run this command to open a browser window. Log in to Duolingo manually. The script will detect when you are logged in and save the session state.
```bash
pnpm run login-manual
```
*Note: This is useful if you encounter CAPTCHAs or 2FA.*

### 2. Auto Login
Attempt to log in automatically using the credentials in `.env`.
```bash
pnpm run login-auto
```

### 3. Verify Login
Check if the currently saved session state is valid.
```bash
pnpm run login-verify
```

### 4. Get Status
Get your current Duolingo status including gems, streak, league, and learning progress.
```bash
pnpm run get-status
```
This will save a detailed status report to `logs/<timestamp>_get-status/status.json` with:
- Global stats: gems, streak, todaysStreakCompleted, league, dailyQuests, availableLanguages
- Language-specific data: current language name and learning path units

### 5. Switch Language
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

### 6. Start Manual Session
Open a browser with the saved session state to interact with Duolingo manually.
```bash
pnpm run start-manual
```

## Project Structure

- `src/login-manual.ts`: Script for manual login and state saving.
- `src/login-auto.ts`: Script for automated login.
- `src/login-verify.ts`: Script to verify login status.
- `src/get-status.ts`: Script to get current Duolingo status and progress.
- `src/switch-language.ts`: Script to switch active learning language.
- `src/start-manual.ts`: Script to launch browser with saved state.
- `src/utils/`: Shared utilities for authentication, logging, and data extraction.
- `src/interfaces/`: TypeScript interfaces for Duolingo API data structures.
- `state/`: Directory where browser state (`storageState.json`) is saved (gitignored).
- `logs/`: Directory for execution logs and screenshots (gitignored).

## License

ISC
