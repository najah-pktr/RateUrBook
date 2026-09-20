import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await initDb();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Check if user already exists using the 'handle' column
    const existing = await db.execute({
      sql: `SELECT * FROM granthagram_users WHERE handle = ?`,
      args: [username]
    });

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Handle already registered' }, { status: 400 });
    }

    // Insert new user into the 'handle' column
    await db.execute({
      sql: `INSERT INTO granthagram_users (handle, password) VALUES (?, ?)`,
      args: [username, password]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error in register:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}