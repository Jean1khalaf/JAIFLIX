CREATE TABLE IF NOT EXISTS media (
 id SERIAL PRIMARY KEY, tmdb_id INTEGER NOT NULL, type TEXT NOT NULL CHECK(type IN ('movie','series')),
 title_en TEXT NOT NULL, title_ar TEXT NOT NULL, description_en TEXT NOT NULL, description_ar TEXT NOT NULL,
 category TEXT NOT NULL CHECK(category IN ('international','turkish','arabic','lebanese','syrian')),
 year INTEGER NOT NULL, rating NUMERIC(3,1) NOT NULL DEFAULT 0, runtime TEXT NOT NULL,
 poster TEXT NOT NULL, backdrop TEXT NOT NULL, featured BOOLEAN NOT NULL DEFAULT FALSE, seasons INTEGER
);
CREATE INDEX IF NOT EXISTS media_type_idx ON media(type);
CREATE INDEX IF NOT EXISTS media_category_idx ON media(category);
