# JAIFLIX with TMDB + VidAPI

## Environment variables
Copy `.env.example` to `.env.local`.
- `TMDB_READ_ACCESS_TOKEN`: TMDB API Read Access Token, server-side only.
- `TMDB_API_KEY`: optional alternative v3 key.
- `NEXT_PUBLIC_VIDAPI_BASE=https://vaplayer.ru`

## Local start
```bash
npm install
npm run dev
```

## TMDB
JAIFLIX retrieves trending titles, search results, posters, backdrops and details from TMDB API v3. The API credential stays server-side. The required TMDB attribution statement is rendered in the UI.

## VidAPI full player
Movies use `https://vaplayer.ru/embed/movie/{TMDB_ID}`.
Series episodes use `https://vaplayer.ru/embed/tv/{TMDB_ID}/{SEASON}/{EPISODE}`.
JAIFLIX does not request TMDB trailers. If VidAPI displays a trailer, reports unavailable content, or blocks the frame, check:
1. The TMDB ID is correct.
2. The title/episode exists in VidAPI's catalog.
3. Your localhost/deployed domain is registered in VidAPI Dashboard → Domains → Allowed Sites.
4. Your browser/ad blocker is not blocking the player domain.
5. Your VidAPI account/domain settings allow the selected playback mode.

## Deploy
Push to GitHub, import into Vercel, and configure all environment variables in Vercel → Project → Settings → Environment Variables. Redeploy after adding them.

## Rights
TMDB supplies metadata, not streaming rights. VidAPI controls playback availability. Publish or embed only content you are licensed or legally authorized to distribute.
