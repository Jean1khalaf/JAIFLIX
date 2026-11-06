import { neon } from '@neondatabase/serverless';
export function db(){if(!process.env.DATABASE_URL) return null; return neon(process.env.DATABASE_URL);}
export async function ensureSchema(){const sql=db();if(!sql)return;await sql`CREATE TABLE IF NOT EXISTS favorites (id BIGSERIAL PRIMARY KEY, visitor_id TEXT NOT NULL, media_id INTEGER NOT NULL, media_type TEXT NOT NULL, title TEXT NOT NULL, poster TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(visitor_id,media_id,media_type))`;}
