# JAIFLIX — TMDB + VidAPI with YouTube playback fallback

JAIFLIX keeps TMDB for catalogue metadata and VidAPI as the primary playback provider. YouTube Data API v3 is an optional, user-selected fallback when VidAPI cannot play a title (for example, a VidAPI 404).

## Environment variables

Copy `.env.example` to `.env.local` and configure:

- `TMDB_READ_ACCESS_TOKEN`: TMDB API Read Access Token (server-side only).
- `TMDB_API_KEY`: optional alternative TMDB v3 API key.
- `NEXT_PUBLIC_VIDAPI_BASE`: VidAPI embed host (defaults to `https://vaplayer.ru`).
- `YOUTUBE_API_KEY`: YouTube Data API v3 key (server-side only; required for YouTube fallback).
- `YOUTUBE_ALLOWED_CHANNEL_IDS`: optional comma-separated list of trusted YouTube channel IDs. When configured, only search results from those channels are returned.

Never commit `.env.local` or expose `YOUTUBE_API_KEY` through a `NEXT_PUBLIC_` variable. In Google Cloud Console, enable **YouTube Data API v3** and restrict the key to that API. Since requests are made server-side from Vercel, do not apply browser HTTP-referrer restrictions to this key; use suitable server-side/API restrictions supported by your Google Cloud setup.

## Playback behavior

1. TMDB continues to provide titles, posters, descriptions, seasons and episode metadata.
2. VidAPI remains the default player and is loaded first.
3. VidAPI starts automatically. YouTube is offered only as a manual fallback when the viewer chooses to try another source.
4. JAIFLIX searches using several title variants (including a broad title-only search for series), then checks each candidate's actual YouTube `status.embeddable` flag before showing it. It does not force a region code or require every season/episode keyword to match in one query. The viewer chooses a result and watches it in YouTube's official privacy-enhanced embedded player.

Browsers do not let a website reliably inspect the HTTP status or internal error page of a cross-origin iframe. Therefore JAIFLIX does not claim to automatically detect VidAPI's internal 404; it provides a visible manual fallback switch whenever playback is unavailable.

A video may be watchable on youtube.com but unavailable for embedding because its uploader disabled embedding; JAIFLIX cannot override that setting. YouTube search results being embeddable does not prove that an upload is authorized, complete, or available in every country. Use official rights-holder channels or configure `YOUTUBE_ALLOWED_CHANNEL_IDS` to restrict search to channels you trust. If this optional allowlist is configured, results from all other channels are intentionally hidden. Only embed content you are legally authorized to make available. JAIFLIX does not download or host YouTube video files.

## Local development

```bash
npm install
npm run dev
```

## Deploy on Vercel

Add the TMDB variables, `NEXT_PUBLIC_VIDAPI_BASE`, and `YOUTUBE_API_KEY` under Project → Settings → Environment Variables. Add `YOUTUBE_ALLOWED_CHANNEL_IDS` if you want to restrict results to selected official channels. Redeploy after changing environment variables.

## Build

```bash
npm run build
```

The `prebuild` script removes obsolete conflicting `[type]` route folders before Next.js builds.

## Rights and attribution

TMDB supplies metadata, not streaming rights. Keep the required TMDB attribution while using TMDB. VidAPI controls its own playback availability. YouTube embeds are subject to YouTube's terms, the uploader's permissions, and regional availability.

## YouTube playback fallback

VidAPI remains the default player. When a viewer chooses **Watch on YouTube**, the server-side `/api/youtube` route searches using both the English and Arabic TMDB titles, prioritizes the requested season/episode, verifies that the selected public video allows embedding, and returns a single best match. The player opens that episode directly with autoplay enabled; it does not show a separate search-results catalogue. Keep `YOUTUBE_API_KEY` configured as a server-only Vercel environment variable. The browser never receives the API key.


## Navigation safety

The JAIFLIX player embeds are sandboxed. The sandbox intentionally does not grant popups,
top-level navigation, or top-navigation-by-user-activation permissions, which prevents an
embedded provider from opening a new tab or navigating the main JAIFLIX page. The player
can still display content inside its own frame; a site cannot reliably inspect or filter
cross-origin content rendered inside a third-party player. For stronger content safety,
use a playback provider you control or trust, and remove any provider that serves
unauthorized or inappropriate material. Set `NEXT_PUBLIC_VIDAPI_BASE` only to a vetted
provider hostname.

## Android PWA

JAIFLIX is installable as a Progressive Web App on Android phones. Open the deployed site in Chrome and choose **Install app** or **Add to Home screen**. It opens in a standalone app window. The web app includes a manifest, Android-sized icons and a service worker for the app shell. Android TV and Google TV support has been removed. An optional Android phone WebView wrapper remains in `android/` for testing; see [`android/README.md`](android/README.md).
