import { useState } from 'react';
import { LocateFixed, Search } from 'lucide-react';

export function SearchBar({ onSearch, onDetectLocation, isLoading }) {
  const [query, setQuery] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setValidationError('Enter a city name or ZIP code to search.');
      return;
    }
    setValidationError('');
    onSearch(trimmed);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2" noValidate>
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="Search city or ZIP code (e.g. Bucharest, 10001)..."
            aria-label="Search city or ZIP code"
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 disabled:opacity-60 transition"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-medium shadow-xs disabled:opacity-60 transition cursor-pointer"
          >
            {isLoading ? 'Loading...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={isLoading}
            title="Use current GPS location"
            aria-label="Use current location"
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs disabled:opacity-60 transition cursor-pointer flex items-center justify-center gap-1.5 text-sm font-medium"
          >
            <LocateFixed className="w-4 h-4 text-sky-600" aria-hidden="true" />
            <span className="sm:hidden">Locate</span>
          </button>
        </div>
      </form>
      {validationError && (
        <p className="mt-1.5 text-xs text-rose-600 font-medium" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}
