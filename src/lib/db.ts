import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

export async function initDb() {
  // Create users table if it doesn't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS granthagram_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      created_at TEXT
    )
  `);

  // Create books table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS granthagram_books (
      id TEXT PRIMARY KEY,
      title TEXT,
      author TEXT,
      publisher TEXT,
      shelf TEXT
    )
  `);

  // Create reviews table (using 'comment' or 'content' depending on your preference, 
  // but keeping it aligned with your schema setup)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS granthagram_reviews (
      id TEXT PRIMARY KEY,
      book_id TEXT,
      username TEXT,
      content TEXT,
      rating INTEGER,
      genre TEXT,
      created_at TEXT
    )
  `);

  // Create replies table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS granthagram_replies (
      id TEXT PRIMARY KEY,
      review_id TEXT,
      username TEXT,
      comment TEXT,
      created_at TEXT
    )
  `);
}