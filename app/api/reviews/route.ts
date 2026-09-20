import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
    }

    const reviewsRes = await db.execute({
      sql: `SELECT id, book_id, username, rating, comment, genre, created_at FROM granthagram_reviews WHERE book_id = ? ORDER BY id DESC`,
      args: [bookId]
    });

    // Map database 'comment' to 'content' for clean component consumption
    const formattedReviews = reviewsRes.rows.map((row: any) => ({
      ...row,
      content: row.comment
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('API Error in reviews GET:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();

    const body = await request.json();
    const { bookId, username, content, rating, genre } = body;

    if (!bookId || !username || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numericRating = Number(rating) || 5;
    const genreValue = genre ? String(genre).trim() : '';

    // Inserts review text into your Turso database column 'comment' and genre into 'genre'
    await db.execute({
      sql: `INSERT INTO granthagram_reviews (book_id, username, comment, rating, genre) VALUES (?, ?, ?, ?, ?)`,
      args: [bookId, username, content, numericRating, genreValue]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error in reviews POST:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}