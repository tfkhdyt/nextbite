# NextBite

Personal meal tracker for logging what you eat, browsing food history, and getting a simple “eat this next” suggestion based on least-eaten foods.

## Features

- **Logs**: add meals with food name, timestamp, and optional note (foods are upserted automatically)
- **Foods**: list of tracked foods sorted by eat count (least first), with last-eaten time
- **Dashboard**: totals, recent logs, meals-per-day chart, top foods, and least-eaten recommendation (after ~30 days of history)
- **Auth**: single shared password behind an HTTP-only session cookie

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) + [Svelte 5](https://svelte.dev)
- [Convex](https://convex.dev) (database and realtime API)
- [Tailwind CSS](https://tailwindcss.com) v4
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) (`@sveltejs/adapter-cloudflare`)
- [pnpm](https://pnpm.io)

## Prerequisites

- Node.js 20+
- pnpm
- A [Convex](https://convex.dev) account (for `npx convex dev`)

## Setup

```sh
pnpm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
| --- | --- |
| `ORIGIN` | App origin URL (e.g. `http://localhost:5173`) |
| `APP_PASSWORD` | Shared login password |
| `SESSION_SECRET` | Long random string used to sign session cookies |
| `PUBLIC_CONVEX_URL` | Convex deployment URL (set by `convex dev` / dashboard) |

Start Convex (creates/links a deployment and syncs `PUBLIC_CONVEX_URL` into `.env.local` when configured):

```sh
pnpm convex:dev
```

In another terminal, start the app:

```sh
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in with `APP_PASSWORD`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Vite / SvelteKit dev server |
| `pnpm convex:dev` | Convex backend watcher |
| `pnpm build` | Production build for Cloudflare Workers |
| `pnpm preview` | Preview the Workers build locally |
| `pnpm check` | Typecheck (`svelte-check` + Wrangler types) |
| `pnpm lint` | Prettier + ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm gen` | Generate Wrangler / Worker types |

## Project layout

```
src/routes/       # SvelteKit pages (dashboard, logs, foods, login)
src/lib/          # UI helpers, charts, session utilities
convex/           # Schema and Convex queries/mutations
```

## Deploy

1. Deploy the Convex backend: `npx convex deploy`
2. Set production env vars (`APP_PASSWORD`, `SESSION_SECRET`, `ORIGIN`, `PUBLIC_CONVEX_URL`) on Cloudflare
3. Build and deploy the Worker:

```sh
pnpm build
npx wrangler deploy
```

## License

Private / personal use.
