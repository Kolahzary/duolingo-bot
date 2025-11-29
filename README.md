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

### 4. Start Manual Session
Open a browser with the saved session state to interact with Duolingo manually.
```bash
pnpm run start-manual
```

## Project Structure

- `src/login-manual.ts`: Script for manual login and state saving.
- `src/login-auto.ts`: Script for automated login.
- `src/login-verify.ts`: Script to verify login status.
- `src/start-manual.ts`: Script to launch browser with saved state.
- `src/utils/`: Shared utilities for authentication and logging.
- `state/`: Directory where browser state (`storageState.json`) is saved (gitignored).
- `logs/`: Directory for execution logs and screenshots (gitignored).

## License

ISC
