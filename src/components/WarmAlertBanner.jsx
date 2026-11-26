import { Sun } from 'lucide-react';
import { formatTemperature } from '../services/weatherApi';

export function WarmAlertBanner({ warmDays, thresholdC, unit }) {
  if (!warmDays || warmDays.length === 0) return null;

  const summary = warmDays
    .map((d) => `${d.dayLabel} (${formatTemperature(d.maxC, unit)})`)
    .join(', ');

  return (
    <div
      role="status"
      className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 flex items-start gap-3"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
        <Sun className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="text-xs sm:text-sm text-amber-950">
        <p className="font-semibold">
          Warm weather alert (≥ {formatTemperature(thresholdC, unit)})
        </p>
        <p className="text-amber-800 mt-0.5">
          Upcoming warm {warmDays.length === 1 ? 'day' : 'days'}: <span className="font-medium">{summary}</span>.
        </p>
      </div>
    </div>
  );
}
