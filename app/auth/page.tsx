'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate Instagram-style username syntax (letters, numbers, underscores, periods)
  const validateUsername = (rawInput: string): { valid: boolean; formatted: string; message?: string } => {
    // Strip all leading @ symbols entered by user to avoid @@ duplicates
    const cleaned = rawInput.replace(/^@+/, '').trim();

    if (!cleaned) {
      return { valid: false, formatted: '', message: 'PLEASE ENTER A STUDENT HANDLE.' };
    }

    // Fixed: Removed the accidental space before {1,30}
    const igRegex = /^[a-zA-Z0-9_.]{1,30}$/;
    if (!igRegex.test(cleaned)) {
      return { 
        valid: false, 
        formatted: '', 
        message: 'HANDLE MUST ONLY CONTAIN LETTERS, NUMBERS, UNDERSCORES, OR PERIODS.' 
      };
    }

    if (cleaned.startsWith('.') || cleaned.endsWith('.')) {
      return { valid: false, formatted: '', message: 'HANDLE CANNOT START OR END WITH A PERIOD.' };
    }

    if (cleaned.includes('..')) {
      return { valid: false, formatted: '', message: 'HANDLE CANNOT CONTAIN CONSECUTIVE PERIODS.' };
    }

    return { valid: true, formatted: `@${cleaned.toLowerCase()}` };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('PLEASE ENTER YOUR PASSWORD.');
      return;
    }

    const { valid, formatted, message } = validateUsername(handle);
    if (!valid) {
      setError(message || 'INVALID USERNAME SYNTAX.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/signin';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formatted,
          password: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ? String(data.error).toUpperCase() : 'AUTHENTICATION FAILED. TRY AGAIN.');
        setLoading(false);
        return;
      }

      // Store cleaned session handle
      localStorage.setItem('granthagram_current_user', formatted);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('NETWORK ERROR CONNECTING TO DATABASE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans border-t-2 border-white flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Navigation Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="font-mono text-xs uppercase border border-zinc-800 px-3 py-1.5 hover:bg-white hover:text-black transition-colors"
          >
            &larr; CATALOGUE
          </Link>
        </div>

        {/* Main Auth Container */}
        <div className="border border-zinc-800 bg-black p-8">
          
          {/* Header & Mode Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-800">
            <div>
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                SYS // AUTHENTICATION
              </p>
              <h1 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
                {mode === 'signin' ? 'STUDENT SIGN IN' : 'REGISTER ACCOUNT'}
              </h1>
            </div>

            <div className="flex border border-zinc-800 p-0.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); }}
                className={`px-3 py-1 uppercase font-bold transition-colors cursor-pointer ${
                  mode === 'signin' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`px-3 py-1 uppercase font-bold transition-colors cursor-pointer ${
                  mode === 'register' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                }`}
              >
                REGISTER
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 border border-red-800 bg-red-950/20 text-red-400 p-3 font-mono text-xs uppercase">
              ERR: {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[10px] text-zinc-400 uppercase mb-2">
                STUDENT HANDLE (E.G. NAJAH_PKTR)
              </label>
              <div className="flex border border-zinc-800 focus-within:border-white">
                <span className="bg-zinc-950 text-zinc-500 font-mono text-xs flex items-center px-3 border-r border-zinc-800">
                  @
                </span>
                <input
                  type="text"
                  placeholder="username"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/^@+/, ''))}
                  className="w-full bg-black text-white font-mono text-xs p-3 focus:outline-none placeholder-zinc-700 uppercase"
                />
              </div>
              <p className="font-mono text-[9px] text-zinc-600 mt-1 uppercase">
                LETTERS, NUMBERS, UNDERSCORES AND PERIODS ONLY.
              </p>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-zinc-400 uppercase mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-white placeholder-zinc-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-white text-black font-mono text-xs font-bold uppercase py-3.5 border border-white hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : mode === 'signin' ? 'AUTHENTICATE &rarr;' : 'CREATE ACCOUNT →;'}
            </button>
          </form>

        </div>

        {/* Footer Info */}
        <p className="font-mono text-[9px] text-zinc-600 uppercase text-center mt-6">
          RateUrBook AL MANHAL LIBRARY BOOK REVIEW PORTAL 
        </p>

      </div>
    </main>
  );
}