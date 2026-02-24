# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (Astro)
```bash
npm run dev       # Start dev server
npm run build     # Build static site
npm run preview   # Preview production build
```

### Infrastructure (AWS CDK) — run from `infra/`
```bash
npm run build     # Compile TypeScript
npm run test      # Run Jest tests
npx cdk deploy    # Deploy stack
npx cdk diff      # Preview changes
```

## Architecture

This is a personal portfolio site built with Astro. The frontend is a static site deployed to GitHub Pages; the backend is an AWS Lambda + API Gateway stack (in `infra/`) that proxies the Spotify API to return the currently playing track.

**Frontend (`src/`):**
- `pages/` — file-based routing; `index.astro` is the homepage
- `layouts/Layout.astro` — base HTML shell shared across pages
- `components/Sphere.astro` — canvas wrapper that loads `lib/sphere.ts`
- `components/CurrentlyPlaying.tsx` — React component that polls the API every 30s; falls back to `mock/mock_response.json` when `PUBLIC_API_URL`/`PUBLIC_API_KEY` env vars are absent
- `lib/sphere.ts` — Three.js scene (dual sphere: inner solid + outer wireframe, continuous rotation)
- `styles/global.css` — Tailwind import + CSS custom properties for the color palette

**Environment variables (frontend):**
- `PUBLIC_API_URL` — API Gateway endpoint
- `PUBLIC_API_KEY` — API key for the gateway

**Infrastructure (`infra/`):**
- Single CDK stack (`currently-playing-stack.ts`) wires a Lambda handler to API Gateway
- Lambda code lives in `infra/lib/lambda-handler/`
- DynamoDB table used to cache the currently playing track

## Style

- Color palette is defined as CSS variables in `src/styles/global.css`: background `#00171F`, text `#BFBFBF`, highlight `#247BA0`
- Font: Roboto Mono Variable throughout
- Tailwind CSS v4 (via `@tailwindcss/vite`); use the `sm:` breakpoint for mobile layouts
- React is used only where interactivity is needed (`client:load` directive); prefer `.astro` components otherwise
