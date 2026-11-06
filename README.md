# JAIFLIX

A bilingual (English / Arabic) movie and series discovery website built with Next.js and TMDB.

## Languages
Use the language switcher in the top navigation to switch between English (LTR) and Arabic (RTL). The selection is saved in a browser cookie.

## Run locally
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env.local` and add your TMDB Read Access Token.
3. Run `npm install` then `npm run dev`.
4. Open `http://localhost:3000`.

## Playback: important
TMDB provides catalogue metadata, artwork and trailers. It does **not** provide full movie or episode streams. That is why the site can show a trailer while full playback remains disabled.

To enable full-length playback, integrate a video service or catalogue for which you have the necessary distribution rights. Add its documented URL format as `VIDEO_API_URL_TEMPLATE` only if it supports the placeholders `{type}`, `{id}`, `{season}`, and `{episode}`. A provider may require additional API authentication, server-side calls, or a different integration; a URL template alone may not be sufficient.

Do not assume that an embed aggregator is licensed to distribute every title it lists. VidAPI's own public site describes it as a content aggregator and says it does not host/store copyrighted content; that statement does not establish distribution rights for each title. Review its terms, rights, and domain restrictions before considering it. See https://vidapi.ru/api.

Example shape for a provider you are authorized to use (replace with its actual documented URL):
`VIDEO_API_URL_TEMPLATE=https://your-authorized-provider.example/embed/{type}/{id}`

For TV, this project currently passes season 1 / episode 1 by default. A production TV player should add season and episode selection and validate availability with the provider.

## Deploy
Add `TMDB_BEARER_TOKEN`, optional `DATABASE_URL`, and (only if authorized) `VIDEO_API_URL_TEMPLATE` to your hosting provider's environment variables, then redeploy.

## TMDB attribution
This product uses the TMDB API but is not endorsed or certified by TMDB. Follow TMDB's current attribution and API terms.
