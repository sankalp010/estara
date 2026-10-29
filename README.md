# Estara

An editorial, dark-premium real estate marketplace for Bengaluru. The monorepo contains a Next.js web app, Express REST API, and shared TypeScript contracts.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Run locally

```sh
npm install
npm run dev
```

The website runs at [http://localhost:3000](http://localhost:3000); the API runs at [http://localhost:4000](http://localhost:4000). Without `MONGODB_URI`, the API serves seeded demo listings and accepts inquiries in memory. Admin routes stay disabled until `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` are set.

## Environment

Copy `apps/api/.env.example` to `apps/api/.env` and `apps/web/.env.example` to `apps/web/.env.local`. Configure MongoDB Atlas, Cloudinary, and Resend to enable persistent listings, photo uploads, and email notifications.

## Workspace

- `apps/web`: Next.js App Router, public listing experience, and admin console.
- `apps/api`: Express API, MongoDB models, validation, authentication, uploads, and inquiry notification.
- `packages/shared`: shared marketplace types.

## Deployment

Deploy `apps/web` to Vercel and `apps/api` to Render. Set `NEXT_PUBLIC_API_URL` to the Render URL, allow the Vercel origin in `WEB_ORIGIN`, and configure MongoDB Atlas, Cloudinary, Resend, and admin secrets in the API environment.
