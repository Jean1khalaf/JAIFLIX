# JAIFLIX

Bilingual English / Arabic movie and TV discovery website using Next.js and TMDB, with ordered iframe playback providers.

## Run locally
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env.local` and add your TMDB Read Access Token.
3. Run `npm install` then `npm run dev`.
4. Open `http://localhost:3000`.

## Playback provider order

The title page keeps the existing in-page player and tries providers in this order:

1. **VidAPI** — primary (`https://vaplayer.ru/embed/...`)
2. **YouTube** — first fallback for TV series whose TMDB origin country is Turkey (`TR`) or Lebanon (`LB`); JAIFLIX searches for the selected episode automatically.
3. **Viduki** — next fallback (configure its generated embed URL templates below)
4. **ezvidapi** — next fallback (`https://ezvidapi.com/embed/...`)
5. **vidapi.ru** — final fallback (`https://vidapi.ru/embed/...`)
6. If all sources fail, JAIFLIX displays an unavailable message.

For other titles, YouTube is omitted and the existing provider order is preserved. YouTube search uses the series title, selected season and episode, the country-appropriate query language, and YouTube's `videoEmbeddable=true` filter. Search results are not guaranteed to be official, complete, correctly matched, or available in every region; review the results and use content only when you have the necessary rights.

JAIFLIX starts a 15-second fallback watchdog for each source and stops it when playback is detected. YouTube playback-start and playback-error events are detected through the official YouTube IFrame Player API. Viduki's documented `viduki:all-servers-failed` message is also handled. **Important limitation:** arbitrary third-party cross-origin iframe players do not expose a common playback-state API. For those sources the 15-second watchdog is best-effort and may advance even if playback has actually begun; a universally reliable `not_started` detector is not possible without cooperation from each provider. Viewers can also use **Try next source** manually.

### Viduki setup (required to enable slot 2)

Viduki offers several API variants and its exact embed URL depends on the selected API and media type. To avoid inventing an endpoint, open [Viduki](https://www.viduki.net/), use its player URL generator, select the API variant you want, and copy the generated Movie and TV embed URL patterns into `.env.local`:

```dotenv
NEXT_PUBLIC_VIDUKI_MOVIE_URL_TEMPLATE=https://www.viduki.net/PASTE-MOVIE-EMBED-PATTERN-HERE
NEXT_PUBLIC_VIDUKI_TV_URL_TEMPLATE=https://www.viduki.net/PASTE-TV-EMBED-PATTERN-HERE
```

Replace the actual TMDB ID in each copied URL with `{id}`. In the TV template, replace the season and episode values with `{season}` and `{episode}`. These values are public URLs, not secrets. Restart the Next.js server after changing `.env.local`.

Until the relevant template is configured, Viduki is skipped rather than loading a guessed URL.

### YouTube fallback setup

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **YouTube Data API v3** for that project.
3. Create an API key and add it to your hosting provider as `YOUTUBE_API_KEY` (server-side, without `NEXT_PUBLIC_`).
4. Redeploy. The key is used only by `/api/youtube-search` and is not sent to the browser.

The YouTube `search.list` request uses `type=video` and `videoEmbeddable=true`. Search API quota applies; monitor usage and configure key restrictions in Google Cloud.

### Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `TMDB_BEARER_TOKEN` | Yes | Server-side TMDB Read Access Token used for catalogue metadata |
| `DATABASE_URL` | Only if database features are used | PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical deployed site URL |
| `NEXT_PUBLIC_VIDUKI_MOVIE_URL_TEMPLATE` | Optional to run; needed for Viduki movie fallback | Viduki Movie iframe URL template |
| `NEXT_PUBLIC_VIDUKI_TV_URL_TEMPLATE` | Optional to run; needed for Viduki TV fallback | Viduki TV iframe URL template |
| `YOUTUBE_API_KEY` | Required for YouTube fallback | Server-side YouTube Data API v3 key; never use `NEXT_PUBLIC_` |

**Do not add API secrets with the `NEXT_PUBLIC_` prefix.** Next.js exposes variables with that prefix in browser bundles. Viduki URL templates are public iframe URLs, so they are suitable for this prefix. Keep `TMDB_BEARER_TOKEN` and database credentials server-only.

VidAPI documents domain allowlisting under Domains → Allowed Sites. Add your production domain there if its player blocks embedding. Review each provider's terms and confirm you have the necessary rights to make content available.

References:
- [VidAPI API documentation](https://vidapi.ru/api)
- [Viduki](https://www.viduki.net/)
- [ezvidapi](https://ezvidapi.com/)

## TMDB
TMDB provides catalogue metadata, posters and trailers, not full-length streams. This product uses the TMDB API but is not endorsed or certified by TMDB. Follow TMDB attribution requirements.
