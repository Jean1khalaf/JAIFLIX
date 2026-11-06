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


## Fix the TMDB message
1. Create/sign in to a TMDB account and open **Settings → API**.
2. Copy the **API Read Access Token** (the long Bearer token).
3. In the project root, copy `.env.example` to `.env.local`.
4. Replace `your_tmdb_read_access_token` with that token, without quotes.
5. Restart the dev server (`npm run dev`) or redeploy after adding `TMDB_BEARER_TOKEN` in Vercel Environment Variables.

The home page now includes separate Turkish-original-language and Arabic-original-language series feeds. It also keeps the other feeds visible if one TMDB request fails.

## Fix the playback message
This is not a TMDB error. Playback is intentionally unavailable until you configure a video endpoint from a provider that has licensed rights to stream the titles in your target regions. Set `VIDEO_API_URL_TEMPLATE` to that provider's documented embed URL, using `{type}` and `{id}` placeholders (and `{season}` / `{episode}` for providers that support episodes). Do not use an arbitrary third-party stream URL. If you do not have a licensed provider, leave playback disabled; discovery, search, details, and official YouTube trailers can still work.
