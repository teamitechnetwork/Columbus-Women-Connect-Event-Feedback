# Columbus Women Connect Feedback

A post-event form where Columbus Women Connect conference participants can rate the event, share comments, and choose whether they want follow-up.

## Run & Operate

- Use the managed `artifacts/cwc-feedback: web` workflow to run the Vite form at `/`.
- Use the managed `artifacts/api-server: API Server` workflow for the Replit API at `/api`.
- `pnpm run typecheck` — typecheck all workspace packages.
- `pnpm run build` — typecheck and build all workspace packages.
- The Replit API server requires `DATABASE_URL` for its PostgreSQL-backed feedback route.
- For Vercel deployment and Google Sheets setup, follow `docs/google-sheets-vercel.md`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod
- API codegen: Orval (from OpenAPI spec)
- Frontend: React + Vite
- API build: esbuild

## Where things live

- `artifacts/cwc-feedback/` — Vite feedback form.
- `artifacts/api-server/` — Replit Express API; its local feedback route stores submissions in PostgreSQL.
- `api/feedback.ts` — Vercel serverless route; forwards valid submissions to Google Apps Script.
- `google-apps-script/Code.gs` — validates the shared secret and appends rows to the sheet.
- `docs/google-sheets-vercel.md` — setup and Vercel deployment requirements.
- `lib/api-spec/openapi.yaml` — source for generated API schemas and clients.

## Architecture decisions

- Vercel serves the Vite build as static files and exposes the separate root-level `api/feedback.ts` function.
- The Vercel function only reports success after Apps Script confirms the row was appended; the shared secret remains server-side.
- Replit preview uses the Express/PostgreSQL route. Configure the documented Vercel variables in Replit Secrets too if preview submissions should also reach the sheet.

## Product

Participants can submit an overall rating, comments, and optional contact/update preferences after a Columbus Women Connect event.

## User preferences

Deployments for public submissions are expected to run on Vercel and write feedback to Google Sheets.

## Gotchas

- Vercel's Root Directory must remain the repository root so it can see both the pnpm workspace and the API function.
- Add `GOOGLE_SHEETS_WEB_APP_URL` and `GOOGLE_SHEETS_WEBHOOK_SECRET` to each Vercel environment that should accept submissions, then redeploy.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
