# JAIFLIX

A deployment-ready, responsive movie and series discovery app built with Next.js, TMDB, TVmaze, Neon, and Vercel.

## Included
- Professional responsive home, movie, series, search, title, trailer, and personal-list pages
- TMDB metadata through server-only Bearer authentication
- TVmaze streaming schedule
- Neon-backed anonymous favorites
- Configurable playback adapter for a **licensed** provider
- Vercel-ready environment configuration

## Run locally
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env.local` and add your credentials.
3. Run `npm install` then `npm run dev`.
4. Open `http://localhost:3000`.

## Deploy with GitHub + Vercel + Neon
1. Create a GitHub repository and push this folder.
2. Import the repository into Vercel.
3. Add a Neon Postgres database from Vercel Marketplace or create one at Neon.
4. In Vercel Project Settings > Environment Variables, add `DATABASE_URL`, `TMDB_BEARER_TOKEN`, `VIDEO_API_URL_TEMPLATE`, and `NEXT_PUBLIC_SITE_URL` for Production, Preview, and Development.
5. Redeploy. The `favorites` table is created on first use.

## Playback / VidAPI adapter
`VIDEO_API_URL_TEMPLATE` accepts `{type}`, `{id}`, `{season}`, and `{episode}`. Example:
`https://your-licensed-provider.example/embed/{type}/{id}`

Only connect a provider for which you have distribution rights. TMDB and TVmaze provide metadata, not streaming rights. The specific service called “VidAPI” is not hard-coded because similarly named providers have different routes and licensing terms. Replace the environment value with the documented, licensed endpoint you control.

## TMDB attribution
This product uses the TMDB API but is not endorsed or certified by TMDB. Add the official TMDB logo to an About/Credits page before public launch if required by your API terms.

## Production checklist
- Add authentication before storing user-specific data beyond anonymous favorites.
- Add a privacy policy, cookie notice where applicable, terms of service, copyright/takedown contact, and age controls.
- Add rate limiting and error monitoring (for example, Vercel Firewall and Sentry).
- Confirm licenses for posters, metadata, trailers, and all streamed video.
