'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface Review {
  id?: number | string;
  username: string;
  content: string;
  rating: number;
  genre?: string;
  created_at?: string;
}

interface Reply {
  id: string;
  review_id: string;
  username: string;
  comment: string;
  created_at?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  shelf: string;
  avgRating?: number;
  reviewCount?: number;
  suggestedGenres?: string[];
}

// Utility function to split comma-separated genres and clean them up
const parseGenres = (genreString?: string): string[] => {
  if (!genreString) return [];
  return genreString
    .split(',')
    .map((g) => g.trim().toUpperCase())
    .filter((g) => g.length > 0);
};

function timeAgo(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'JUST NOW';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `BEFORE ${minutes} MINUTE${minutes > 1 ? 'S' : ''}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `BEFORE ${hours} HOUR${hours > 1 ? 'S' : ''}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `BEFORE ${days} DAY${days > 1 ? 'S' : ''}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `BEFORE ${months} MONTH${months > 1 ? 'S' : ''}`;
  const years = Math.floor(months / 12);
  return `BEFORE ${years} YEAR${years > 1 ? 'S' : ''}`;
}

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bookId = resolvedParams.id;

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [repliesMap, setRepliesMap] = useState<{ [key: string]: Reply[] }>({});
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('granthagram_current_user');
    if (saved) setCurrentUser(saved);
    loadBookData();
  }, [bookId]);

  const loadBookData = async () => {
    setLoading(true);
    try {
      const bookRes = await fetch(`/api/books?q=${encodeURIComponent(bookId)}`);
      const bookData = await bookRes.json();

      if (bookData.books && bookData.books.length > 0) {
        const found = bookData.books.find((b: Book) => String(b.id) === String(bookId)) || bookData.books[0];
        setBook(found);
      }

      const reviewRes = await fetch(`/api/reviews?bookId=${bookId}`);
      const reviewData = await reviewRes.json();
      
      if (reviewData.reviews) {
        setReviews(reviewData.reviews);

        const newRepliesMap: { [key: string]: Reply[] } = {};
        await Promise.all(
          reviewData.reviews.map(async (rev: Review, index: number) => {
            const activeReviewId = rev.id ? String(rev.id) : `review-${index}`;
            try {
              const repRes = await fetch(`/api/replies?reviewId=${encodeURIComponent(activeReviewId)}`);
              const repData = await repRes.json();
              if (repData.replies) {
                newRepliesMap[activeReviewId] = repData.replies;
              }
            } catch (err) {
              console.error('Failed to load replies for review:', activeReviewId, err);
            }
          })
        );
        setRepliesMap(newRepliesMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setSubmitError('YOU MUST BE LOGGED IN TO LEAVE A REVIEW.');
      return;
    }

    if (!content.trim()) {
      setSubmitError('PLEASE ENTER A REVIEW.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          username: currentUser,
          content,
          rating,
          genre: genreInput
        })
      });

      if (res.ok) {
        setContent('');
        setGenreInput('');
        loadBookData();
      } else {
        setSubmitError('FAILED TO SUBMIT REVIEW. TRY AGAIN.');
      }
    } catch (err) {
      setSubmitError('AN ERROR OCCURRED.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (targetReviewId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const comment = replyInputs[targetReviewId];
    if (!comment || !comment.trim()) return;

    try {
      const res = await fetch('/api/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: targetReviewId,
          username: currentUser,
          comment: comment.trim()
        })
      });

      if (res.ok) {
        setReplyInputs({ ...replyInputs, [targetReviewId]: '' });
        loadBookData();
      } else {
        const errData = await res.json();
        console.error('Server error posting reply:', errData.error);
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans border-t-2 border-white">
      <header className="border-b border-zinc-800 px-6 py-4 max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="font-mono text-xs uppercase border border-zinc-800 px-3 py-1.5 hover:bg-white hover:text-black transition-all"
        >
          &larr; BACK TO CATALOGUE
        </Link>
        <span className="font-mono text-xs text-zinc-500 uppercase">
          INDEX ID: #{bookId}
        </span>
      </header>

      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
          LOADING RECORD DETAILS...
        </div>
      ) : !book ? (
        <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
          BOOK RECORD NOT FOUND
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          
          <div className="lg:col-span-5 p-8 flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs text-zinc-400 mb-6 pb-2 border-b border-zinc-900 flex justify-between">
                <span>SHELF LOCATION: {book.shelf}</span>
                <span>RATEURBOOK DISCUSSIONS</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4 leading-tight">
                {book.title}
              </h1>

              <p className="text-sm font-mono text-zinc-300 uppercase mb-2">
                AUTHOR: {book.author}
              </p>

              {book.publisher && (
                <p className="text-xs font-mono text-zinc-500 uppercase mb-6">
                  PUBLISHER: {book.publisher}
                </p>
              )}

              <div className="border border-zinc-800 p-4 mb-6 bg-zinc-950">
                <p className="font-mono text-[10px] text-zinc-500 uppercase mb-1">AGGREGATE RATING</p>
                <div className="text-2xl font-bold font-mono">
                  {book.avgRating && book.avgRating > 0 ? (
                    <span>★ {book.avgRating.toFixed(1)} / 5.0</span>
                  ) : (
                    <span className="text-zinc-600">NO RATINGS YET</span>
                  )}
                </div>
                <p className="font-mono text-[10px] text-zinc-400 mt-1 uppercase">
                  BASED ON {reviews.length} STUDENT REVIEWS
                </p>
              </div>

              {/* Aggregated Suggested Genres with Comma Splitting */}
              <div className="border border-zinc-800 p-4 bg-zinc-950">
                <p className="font-mono text-[10px] text-zinc-500 uppercase mb-2">STUDENT SUGGESTED GENRES</p>
                {book.suggestedGenres && book.suggestedGenres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {book.suggestedGenres.flatMap((g) => parseGenres(g)).map((g, i) => (
                      <span key={i} className="font-mono text-xs uppercase bg-black border border-zinc-800 px-2.5 py-1 text-white">
                        {g}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-xs text-zinc-600 uppercase">NO GENRES SUGGESTED YET</p>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-900 font-mono text-[10px] text-zinc-600 uppercase">
              RATEURBOOK DIGITAL ARCHIVE SYSTEM
            </div>
          </div>

          <div className="lg:col-span-7 p-8">
            <section className="mb-12 border border-zinc-800 p-6 bg-zinc-950">
              <h2 className="text-lg font-black uppercase tracking-tight mb-2">
                SUBMIT STUDENT REVIEW
              </h2>
              <p className="font-mono text-xs text-zinc-400 mb-6">
                Help fellow students discover this book. Write honest feedback and suggest genres (comma separated).
              </p>

              {!currentUser ? (
                <div className="border border-zinc-800 p-4 font-mono text-xs text-zinc-400">
                  YOU MUST BE SIGNED IN TO WRITE A REVIEW.{' '}
                  <Link href="/auth" className="text-white underline uppercase">
                    LOG IN HERE
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {submitError && (
                    <div className="border border-red-800 bg-red-950/30 text-red-400 p-3 font-mono text-xs uppercase">
                      {submitError}
                    </div>
                  )}

                  <div>
                    <label className="block font-mono text-[10px] text-zinc-400 uppercase mb-2">RATING (1 TO 5)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className={`w-10 h-10 font-mono text-xs font-bold border transition-colors ${
                            rating >= star
                              ? 'bg-white text-black border-white'
                              : 'bg-black text-zinc-500 border-zinc-800'
                          }`}
                        >
                          {star}★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-zinc-400 uppercase mb-2">
                      YOUR REVIEW (ENGLISH, MALAYALAM, OR MANGLISH)
                    </label>
                    <textarea
                      rows={3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="WHAT DID YOU THINK OF THIS BOOK?"
                      className="w-full bg-black border border-zinc-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-white placeholder-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-zinc-400 uppercase mb-2">
                      SUGGEST GENRES (SEPARATED BY COMMAS, E.G. POETRY, LOVE, THRILLER)
                    </label>
                    <input
                      type="text"
                      value={genreInput}
                      onChange={(e) => setGenreInput(e.target.value)}
                      placeholder="E.G. POETRY, ROMANCE, SHORT READ"
                      className="w-full bg-black border border-zinc-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-white uppercase placeholder-zinc-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-white text-black font-mono text-xs font-bold uppercase py-3 border border-white hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'SUBMITTING...' : 'POST REVIEW'}
                  </button>
                </form>
              )}
            </section>

            <section>
              <h3 className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-4">
                STUDENT REVIEWS ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <div className="border border-zinc-900 p-8 text-center font-mono text-xs text-zinc-600 uppercase">
                  NO REVIEWS RECORDED YET. BE THE FIRST TO REVIEW!
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev, index) => {
                    const reviewId = rev.id ? String(rev.id) : `review-${index}`;
                    const reviewReplies = repliesMap[reviewId] || [];

                    return (
                      <article key={reviewId} className="border border-zinc-800 p-5 bg-black">
                        <div className="flex justify-between items-center font-mono text-xs mb-3 pb-2 border-b border-zinc-900">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">@{rev.username.replace(/^@+/, '')}</span>
                            {rev.created_at && (
                              <span className="text-zinc-600 text-[10px]">({timeAgo(rev.created_at)})</span>
                            )}
                          </div>
                          <span className="text-zinc-400">RATING: {rev.rating}/5</span>
                        </div>

                        <p className="text-xs text-zinc-300 font-sans leading-relaxed mb-3">
                          {rev.content}
                        </p>

                        {/* Individual Review Genre Tags Parsed from Commas */}
                        {rev.genre && (
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {parseGenres(rev.genre).map((g, i) => (
                              <span key={i} className="inline-block font-mono text-[9px] uppercase border border-zinc-800 px-2 py-0.5 text-zinc-400">
                                {g}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-zinc-900 pl-4 space-y-3">
                          <h4 className="font-mono text-[10px] text-zinc-500 uppercase">
                            REPLIES ({reviewReplies.length})
                          </h4>

                          {reviewReplies.map((rep) => (
                            <div key={rep.id} className="border-l border-zinc-800 pl-3 py-1 font-mono text-xs">
                              <div className="flex justify-between items-center text-zinc-400 text-[10px] mb-1">
                                <span className="text-white font-bold">@{rep.username.replace(/^@+/, '')}</span>
                                {rep.created_at && <span>{timeAgo(rep.created_at)}</span>}
                              </div>
                              <p className="text-zinc-300 font-sans text-xs">{rep.comment}</p>
                            </div>
                          ))}

                          {currentUser ? (
                            <form 
                              onSubmit={(e) => handleReplySubmit(reviewId, e)}
                              className="mt-3 flex gap-2"
                            >
                              <input
                                type="text"
                                placeholder="WRITE A REPLY..."
                                value={replyInputs[reviewId] || ''}
                                onChange={(e) => setReplyInputs({ ...replyInputs, [reviewId]: e.target.value })}
                                className="flex-1 bg-black border border-zinc-800 px-3 py-2 text-white font-mono text-[11px] placeholder-zinc-700 focus:outline-none focus:border-white"
                              />
                              <button
                                type="submit"
                                className="bg-white text-black font-mono text-[10px] font-bold uppercase px-3 py-2 border border-white hover:bg-zinc-200 transition-colors cursor-pointer"
                              >
                                REPLY
                              </button>
                            </form>
                          ) : (
                            <p className="font-mono text-[10px] text-zinc-600 uppercase mt-2">
                              LOG IN TO REPLY TO THIS REVIEW.
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
