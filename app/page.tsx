'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Book {
  id: string;
  title: string;
  shelf: string;
  publisher?: string;
  author: string;
  avgRating?: number;
  reviewCount?: number;
  suggestedGenres?: string[];
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedShelf, setSelectedShelf] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'most-rated' | 'highest-rating'>('latest');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('granthagram_current_user');
    if (savedUser) setCurrentUser(savedUser);
    fetchBooks('');
  }, []);

  const fetchBooks = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/books?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.books) {
        setBooks(data.books);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchBooks(val);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('granthagram_current_user');
  };

  // Extract all unique genres across books
  const allGenres = Array.from(
    new Set(books.flatMap((b) => b.suggestedGenres || []))
  ).filter(Boolean);

  // Extract unique shelves
  const allShelves = Array.from(
    new Set(books.map((b) => b.shelf).filter(Boolean))
  );

  const filteredBooks = books.filter((book) => {
    const matchesGenre =
      selectedGenre === 'all' ||
      book.suggestedGenres?.some(
        (g) => g.toLowerCase() === selectedGenre.toLowerCase()
      );
    const matchesShelf = selectedShelf === 'all' || book.shelf === selectedShelf;
    return matchesGenre && matchesShelf;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'latest') return Number(b.id) - Number(a.id);
    if (sortBy === 'oldest') return Number(a.id) - Number(b.id);
    if (sortBy === 'highest-rating') return (b.avgRating || 0) - (a.avgRating || 0);
    if (sortBy === 'most-rated') return (b.reviewCount || 0) - (a.reviewCount || 0);
    return 0;
  });

  return (
    <main className="min-h-screen bg-black text-white font-sans border-t-2 border-white">
      {/* Header Bar */}
      <header className="border-b border-zinc-800 px-6 py-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            BOOK REVIEW PORTAL
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
            RATEURBOOK
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-2 tracking-wide">
            AL MANHAL LIBRARY - DARUL HUDA ISLAMIC UNIVERSITY
          </p>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3 border border-zinc-800 px-3 py-1.5 font-mono text-xs">
              <span className="text-zinc-400">USER:</span>
              <span className="text-white font-bold">{currentUser}</span>
              <button
                onClick={handleLogout}
                className="ml-2 text-zinc-500 hover:text-white uppercase transition-colors"
              >
                [EXIT]
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="border border-white bg-white text-black px-4 py-2 font-mono text-xs font-bold uppercase hover:bg-zinc-200 transition-colors"
            >
              LOG IN
            </Link>
          )}
        </div>
      </header>

      {/* Swiss Filter Grid */}
      <section className="max-w-7xl mx-auto border-b border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          
          {/* Minimal Search Input */}
          <div className="md:col-span-6 relative flex items-center px-4 py-3 bg-black">
            <svg
              className="w-4 h-4 text-zinc-400 shrink-0 mr-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="square" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="SEARCH BY TITLE, AUTHOR, PUBLISHER OR ID..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-transparent text-white font-mono text-xs tracking-wider placeholder-zinc-600 focus:outline-none uppercase"
            />
          </div>

          {/* Genre Dropdown */}
          <div className="md:col-span-2 px-3 py-2 flex items-center bg-black">
            <label className="text-[9px] font-mono text-zinc-500 uppercase mr-2 shrink-0">GENRE:</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-black text-white font-mono text-xs focus:outline-none w-full uppercase cursor-pointer"
            >
              <option value="all">ALL GENRES</option>
              {allGenres.map((g) => (
                <option key={g} value={g}>
                  {g.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Shelf Dropdown */}
          <div className="md:col-span-2 px-3 py-2 flex items-center bg-black">
            <label className="text-[9px] font-mono text-zinc-500 uppercase mr-2 shrink-0">SHELF:</label>
            <select
              value={selectedShelf}
              onChange={(e) => setSelectedShelf(e.target.value)}
              className="bg-black text-white font-mono text-xs focus:outline-none w-full uppercase cursor-pointer"
            >
              <option value="all">ALL SHELVES</option>
              {allShelves.map((s) => (
                <option key={s} value={s}>
                  SHELF {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2 px-3 py-2 flex items-center bg-black">
            <label className="text-[9px] font-mono text-zinc-500 uppercase mr-2 shrink-0">SORT:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black text-white font-mono text-xs focus:outline-none w-full uppercase cursor-pointer"
            >
              <option value="latest">NEWEST</option>
              <option value="oldest">OLDEST</option>
              <option value="highest-rating">RATING</option>
              <option value="most-rated">REVIEWS</option>
            </select>
          </div>

        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6 font-mono text-xs text-zinc-500">
          <span>SHOWING {sortedBooks.length} ITEMS</span>
          <span>MADE WITH ❤️ BY NAJAH</span>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
            LOADING BOOKS...
          </div>
        ) : sortedBooks.length === 0 ? (
          <div className="py-20 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
            NO RECORDS MATCH QUERY
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-zinc-800">
            {sortedBooks.map((book) => {
              const avgRating = book.avgRating || 0;
              const reviewCount = book.reviewCount || 0;

              return (
                <article
                  key={book.id}
                  className="border-r border-b border-zinc-800 p-6 flex flex-col justify-between hover:bg-zinc-950 transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-start font-mono text-[10px] text-zinc-400 mb-4 pb-2 border-b border-zinc-900">
                      <span>SHELF: {book.shelf}</span>
                      <span>ID #{book.id}</span>
                    </div>

                    <h2 className="text-xl font-bold uppercase tracking-tight text-white mb-2 leading-tight">
                      {book.title}
                    </h2>

                    <p className="text-xs font-mono text-zinc-300 uppercase mb-1">
                      BY {book.author}
                    </p>

                    {book.publisher && (
                      <p className="text-[11px] font-mono text-zinc-500 uppercase mb-4">
                        PUB: {book.publisher}
                      </p>
                    )}

                    {/* Genres Tag Box */}
                    {book.suggestedGenres && book.suggestedGenres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {book.suggestedGenres.map((g, idx) => (
                          <span
                            key={idx}
                            className="font-mono text-[9px] uppercase border border-zinc-800 px-2 py-0.5 text-zinc-300"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
                    <div className="font-mono text-xs">
                      {avgRating > 0 ? (
                        <span className="text-white font-bold">
                          ★ {avgRating.toFixed(1)}{' '}
                          <span className="text-zinc-500 font-normal">({reviewCount})</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600">UNRATED</span>
                      )}
                    </div>

                    <Link
                      href={`/books/${book.id}`}
                      className="font-mono text-xs uppercase border border-zinc-700 px-3 py-1.5 hover:bg-white hover:text-black hover:border-white transition-all font-bold"
                    >
                      PREVIEW &rarr;
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}