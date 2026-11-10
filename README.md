# JAIFLIX

Deployable bilingual streaming-catalog MVP built with Next.js, Vercel and Neon.

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local`.
3. Run `npm install` then `npm run dev`.
4. Open http://localhost:3000.

The app uses built-in demo content when `DATABASE_URL` is absent or unavailable.

## Neon
1. Create a Neon project and copy its pooled PostgreSQL connection string.
2. Run `db/schema.sql` in the Neon SQL Editor.
3. Insert your licensed catalog rows into `media`.
4. Set `DATABASE_URL` in Vercel.

## Vercel
Push this folder to GitHub, import it into Vercel, add environment variables, then deploy.

## VidAPI
The player base defaults to `https://vaplayer.ru`. Configure `NEXT_PUBLIC_VIDAPI_BASE` if your VidAPI dashboard gives you another verified domain. Movies use `/embed/movie/{TMDB_OR_IMDB_ID}`. Episodes use `/embed/tv/{TMDB_OR_IMDB_ID}/{season}/{episode}`. Subtitle preference is passed with `ds_lang=en` or `ds_lang=ar`.

## Before production
- Replace demo metadata and image URLs with records you are authorized to use.
- Add authentication, age controls, privacy/terms/DMCA pages, monitoring and an admin workflow.
- Verify VidAPI terms, domain configuration, advertising behavior and content rights.
- Do not claim that JAIFLIX hosts streams. The app embeds an external provider.
