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
2. **Viduki** — first fallback (configure its exact generated embed URL templates below)
3. **ezvidapi** — second fallback (`https://ezvidapi.com/embed/...`)
4. **vidapi.ru** — final fallback (`https://vidapi.ru/embed/...`)
5. If the viewer advances past the final provider, JAIFLIX displays an unavailable message.

If a provider fails, viewers can select **Try next source**. Viduki additionally documents a `viduki:all-servers-failed` `postMessage` event; JAIFLIX listens for that event and advances automatically. Browsers do not expose a reliable, universal way for a parent page to detect playback failures inside arbitrary cross-origin iframes, so the other providers cannot be safely auto-detected. A loaded iframe is not proof that a stream is playable.

### Viduki setup (required to enable slot 2)

Viduki offers several API variants and its exact embed URL depends on the selected API and media type. To avoid inventing an endpoint, open [Viduki](https://www.viduki.net/), use its player URL generator, select the API variant you want, and copy the generated Movie and TV embed URL patterns into `.env.local`:

```dotenv
NEXT_PUBLIC_VIDUKI_MOVIE_URL_TEMPLATE=https://www.viduki.net/PASTE-MOVIE-EMBED-PATTERN-HERE
NEXT_PUBLIC_VIDUKI_TV_URL_TEMPLATE=https://www.viduki.net/PASTE-TV-EMBED-PATTERN-HERE
```

Replace the actual TMDB ID in each copied URL with `{id}`. In the TV template, replace the season and episode values with `{season}` and `{episode}`. These values are public URLs, not secrets. Restart the Next.js server after changing `.env.local`.

Until both relevant templates are configured, Viduki is skipped rather than loading a guessed URL.

### Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `TMDB_BEARER_TOKEN` | Yes | Server-side TMDB Read Access Token used for catalogue metadata |
| `DATABASE_URL` | Only if database features are used | PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical deployed site URL |
| `NEXT_PUBLIC_VIDUKI_MOVIE_URL_TEMPLATE` | Optional to run; needed for Viduki movie fallback | Viduki Movie iframe URL template |
| `NEXT_PUBLIC_VIDUKI_TV_URL_TEMPLATE` | Optional to run; needed for Viduki TV fallback | Viduki TV iframe URL template |

**Do not add API secrets with the `NEXT_PUBLIC_` prefix.** Next.js exposes variables with that prefix in browser bundles. Viduki URL templates are public iframe URLs, so they are suitable for this prefix. Keep `TMDB_BEARER_TOKEN` and database credentials server-only.

VidAPI documents domain allowlisting under Domains → Allowed Sites. Add your production domain there if its player blocks embedding. Review each provider's terms and confirm you have the necessary rights to make content available.

References:
- [VidAPI API documentation](https://vidapi.ru/api)
- [Viduki](https://www.viduki.net/)
- [ezvidapi](https://ezvidapi.com/)

## TMDB
TMDB provides catalogue metadata, posters and trailers, not full-length streams. This product uses the TMDB API but is not endorsed or certified by TMDB. Follow TMDB attribution requirements.
