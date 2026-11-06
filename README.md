# JAIFLIX

Bilingual English / Arabic movie and TV discovery website using Next.js and TMDB, with VidAPI iframe playback integration.

## Run locally
1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env.local` and add your TMDB Read Access Token.
3. Run `npm install` then `npm run dev`.
4. Open `http://localhost:3000`.

## VidAPI playback
Title pages now embed the VidAPI player in-page:
- Movies: `https://vaplayer.ru/embed/movie/{TMDB_ID}`
- TV episodes: `https://vaplayer.ru/embed/tv/{TMDB_ID}/{SEASON}/{EPISODE}`

The TV page includes season and episode selectors populated from TMDB season metadata. The selected language (`en` or `ar`) is passed as VidAPI's documented `lang` subtitle-language parameter. Actual subtitle availability depends on VidAPI and the selected title.

VidAPI's documentation identifies `vaplayer.ru` as the player host and documents domain allowlisting, optional API-key authenticated requests, and player parameters. Add your production domain in the VidAPI dashboard under Domains → Allowed Sites if embedding is blocked. Review VidAPI's current account terms and any applicable rights requirements before public use. VidAPI describes itself as a content aggregator and says it does not host/store copyrighted content; that does not itself establish distribution rights for each source/title.

References:
- https://vidapi.ru/api
- https://vidapi.ru/

## TMDB
TMDB provides catalogue metadata, posters and trailers, not full-length streams. This product uses the TMDB API but is not endorsed or certified by TMDB. Follow TMDB attribution requirements.
