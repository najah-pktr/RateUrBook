import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    // Notice we accept 'username' from the frontend payload, but match it against the 'handle' column in the DB
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const res = await db.execute({
      sql: `SELECT * FROM granthagram_users WHERE handle = ? AND password = ?`,
      args: [username, password]
    });

    if (!res.rows || res.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid handle or password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: res.rows[0] });
  } catch (error: any) {
    console.error('CRITICAL API Error in signin:', error.message || error);
    return NextResponse.json({ error: 'Internal server error: ' + (error.message || 'unknown') }, { status: 500 });
  }
}