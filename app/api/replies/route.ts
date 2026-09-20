import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    const repliesRes = await db.execute({
      sql: `SELECT * FROM granthagram_replies WHERE review_id = ? ORDER BY id ASC`,
      args: [reviewId]
    });

    return NextResponse.json({ replies: repliesRes.rows });
  } catch (error) {
    console.error('API Error in replies GET:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const { reviewId, username, comment } = await request.json();

    if (!reviewId || !username || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prevent saving placeholder or fallback client indexes into the database
    if (String(reviewId).startsWith('idx-')) {
      return NextResponse.json(
        { error: 'Invalid review reference. Please refresh the page and try again.' }, 
        { status: 400 }
      );
    }

    const id = 'rep_' + Date.now();
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO granthagram_replies (id, review_id, username, comment, created_at) VALUES (?, ?, ?, ?, ?)`,
      args: [id, reviewId, username, comment, createdAt]
    });

    return NextResponse.json({ success: true, message: 'Reply saved to Turso' });
  } catch (error) {
    console.error('API Error in replies POST:', error);
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
  }
}