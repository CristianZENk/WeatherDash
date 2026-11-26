import { MapPin, Sparkles, X } from 'lucide-react';

export function RecommendationBanner({
  username,
  topCities,
  currentCityName,
  onSelectCity,
  onDismiss,
}) {
  if (!username || !topCities || topCities.length === 0) return null;

  const primary = topCities[0];
  const isAlreadyViewingPrimary =
    currentCityName &&
    primary.location.name.toLowerCase() === currentCityName.toLowerCase();

  return (
    <div className="mt-4 rounded-2xl border border-sky-200/90 bg-sky-50/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="text-xs sm:text-sm text-slate-800">
          <p className="font-semibold text-slate-900">
            Welcome back, {username}
          </p>
          <p className="text-slate-600 mt-0.5">
            {isAlreadyViewingPrimary ? (
              <>
                Showing your most searched city:{' '}
                <span className="font-medium text-slate-900">
                  {primary.location.name}
                </span>{' '}
                ({primary.count}×).
              </>
            ) : (
              <>
                You usually search for{' '}
                <span className="font-medium text-slate-900">
                  {primary.location.name}
                </span>{' '}
                ({primary.count}×). Load it now?
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {topCities.map((entry) => {
          const active =
            currentCityName &&
            entry.location.name.toLowerCase() === currentCityName.toLowerCase();
          return (
            <button
              key={`${entry.location.name}-${entry.location.country}`}
              type="button"
              onClick={() => onSelectCity(entry.location)}
              disabled={active}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                active
                  ? 'bg-sky-600 text-white opacity-90 cursor-default'
                  : 'bg-white border border-sky-200 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {entry.location.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss recommendation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-sky-100/70 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
