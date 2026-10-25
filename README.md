# Amazon login flow (Playwright + TypeScript)

## Setup (run once, inside this folder)
    npm install
    npx playwright install chromium

## Run
    npm run login     # logs in, saves session to .auth/user.json
    npm test          # runs setup first, then tests using the saved session
    npm run report    # open the HTML report

## Notes
- Credentials live in `.env` (edit AMAZON_EMAIL / AMAZON_PASSWORD there).
- Saved session: `.auth/user.json` (delete it to force a fresh login).
- If Amazon shows an OTP or captcha, complete it manually in the browser window.
