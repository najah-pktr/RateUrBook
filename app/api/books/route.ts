import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Fetch all books
    const booksRes = await db.execute({
      sql: `SELECT * FROM granthagram_books`,
      args: []
    });

    // Fetch all reviews to calculate ratings and genres dynamically
    const reviewsRes = await db.execute({
      sql: `SELECT book_id, rating, genre FROM granthagram_reviews`,
      args: []
    });

    const reviews = reviewsRes.rows as any[];

    // Map and aggregate metrics
    const books = booksRes.rows.map((book: any) => {
      const bookReviews = reviews.filter((r) => String(r.book_id) === String(book.id));
      
      const reviewCount = bookReviews.length;
      const avgRating = reviewCount > 0 
        ? bookReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / reviewCount 
        : 0;

      const suggestedGenres = Array.from(
        new Set(
          bookReviews
            .map((r) => r.genre)
            .filter((g) => g && typeof g === 'string' && g.trim() !== '')
        )
      );

      return {
        ...book,
        avgRating,
        reviewCount,
        suggestedGenres
      };
    });

    const filteredBooks = books.filter((book: any) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        String(book.title || '').toLowerCase().includes(q) ||
        String(book.author || '').toLowerCase().includes(q) ||
        String(book.publisher || '').toLowerCase().includes(q) ||
        String(book.id || '').toLowerCase().includes(q) ||
        String(book.shelf || '').toLowerCase().includes(q)
      );
    });

    return NextResponse.json({ books: filteredBooks });
  } catch (error) {
    console.error('API Error in books GET:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}