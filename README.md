# Genfux Coming Soon

Dark, Y2K-style waitlist site built with Next.js (App Router), TypeScript, Tailwind v4, and shadcn-compatible structure.

## Stack and Structure

- Next.js + TypeScript + Tailwind v4
- shadcn initialized (`components.json` exists)
- Default component path: `components/ui`
- Default styles path: `app/globals.css`

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create `.env.local` from `.env.example`.

```bash
cp .env.example .env.local
```

Required variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SITE_URL` (for absolute email logo URL, e.g. `http://localhost:3000` locally)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_RANGE` (optional, defaults to `Sheet1!A:D`)

## Gmail SMTP setup (App Password)

1. Use a Google account with 2-Step Verification ON.
2. Go to Google Account → Security → App passwords.
3. Create app password (Mail + Other/custom name).
4. Use:
	- `SMTP_HOST=smtp.gmail.com`
	- `SMTP_PORT=587`
	- `SMTP_USER=your@gmail.com`
	- `SMTP_PASS=<16-char app password>`
	- `SMTP_FROM=your@gmail.com`

## Google Sheets append setup

1. Create a Google Cloud project.
2. Enable Google Sheets API.
3. Create a Service Account.
4. Generate JSON key for the service account.
5. Share your target Google Sheet with the service account email as Editor.
6. Set env vars:
	- `GOOGLE_SERVICE_ACCOUNT_EMAIL` = `client_email` from key JSON
	- `GOOGLE_PRIVATE_KEY` = `private_key` from key JSON (keep `\n` escaped in env)
	- `GOOGLE_SHEET_ID` = sheet ID from URL
	- optional `GOOGLE_SHEET_RANGE` = e.g. `Sheet1!A:D`

Columns appended by API route:

1. Timestamp (ISO)
2. Email
3. Phone
4. Source tag

## Vercel deployment notes

- Add all env vars in Vercel Project → Settings → Environment Variables.
- Route handler uses Node runtime (`app/api/waitlist/route.ts`) for Nodemailer.
- Deploy normally; no additional server setup needed.

## If starting from a non-shadcn project

If `components/ui` does not exist, create it to keep consistent imports (`@/components/ui/...`) and easier component generation with shadcn CLI.

Quick setup commands:

```bash
npx create-next-app@latest . --typescript --tailwind --app
npx shadcn@latest init -d
```
