# Google Sheets submissions on Vercel

The Vercel API route sends each valid feedback submission to a Google Apps Script
web app. The shared secret stays on the server and is never sent to the browser.
The route only returns success after Apps Script confirms that it appended a row.

## 1. Install the Apps Script

1. Open the destination Google spreadsheet.
2. Open **Extensions → Apps Script**.
3. Replace the editor contents with `google-apps-script/Code.gs` from this repo.
4. In the Apps Script project, open **Project Settings → Script Properties** and
   add:
   - `GOOGLE_SHEETS_SPREADSHEET_ID` — the ID from the spreadsheet URL between
     `/d/` and `/edit`.
   - `GOOGLE_SHEETS_WEBHOOK_SECRET` — a long, random secret.
5. Deploy the script as a **Web app**. Set **Execute as** to your account and
   **Who has access** to **Anyone**, then deploy and copy the web app URL ending
   in `/exec`.

The script creates a `Feedback` tab and its header row the first time it runs.
The Google account that deploys the script must have edit access to the sheet.

## 2. Add Vercel environment variables

In the Vercel project, open **Settings → Environment Variables** and add:

| Name | Value |
| --- | --- |
| `GOOGLE_SHEETS_WEB_APP_URL` | The Apps Script web app URL ending in `/exec` |
| `GOOGLE_SHEETS_WEBHOOK_SECRET` | The same secret stored in Apps Script |

Add them to every environment where you expect submissions, then redeploy so
the new values are available to the function.

Use the Apps Script **web app URL**, not the ordinary Google spreadsheet URL.
The endpoint validates submissions, forwards them server-to-server, and returns
an error instead of reporting success if the sheet is not configured or the
append fails.

## Vercel build

Import the repository with the Vercel **Root Directory** set to the repository
root (`.`). Do not set it to `artifacts/cwc-feedback`: the root config needs the
pnpm workspace and `api/feedback.ts`.

`vercel.json` installs the pinned pnpm workspace, runs the Vite build with the
required `PORT` and `BASE_PATH`, and serves
`artifacts/cwc-feedback/dist/public`. The root-level `api/feedback.ts` handles
`POST /api/feedback`, matching the route already used by the form.
