import { useState } from 'react';

export default function SearchBar({ onSearch, onUseLocation, loading }) {
  const [query, setQuery] = useState('');
  const [validationError, setValidationError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setValidationError('Please enter a city name or ZIP code.');
      return;
    }
    setValidationError('');
    onSearch(trimmed);
  }

  function handleChange(e) {
    setQuery(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search city or ZIP code (e.g., London, 10001)..."
            aria-label="City name or ZIP code"
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>

          <button
            type="button"
            onClick={onUseLocation}
            disabled={loading}
            title="Use current location"
            aria-label="Use current location"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 shadow-xs transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3m0 14v3m10-10h-3M5 12H2m10-6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {validationError && (
        <p className="mt-1.5 text-xs text-rose-600" role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}
